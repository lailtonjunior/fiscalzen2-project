import { Injectable, Logger } from '@nestjs/common';
import { SoapService } from '../soap.service';
import { XmlFactoryService } from '../xml-factory.service';
import { CertificateService } from '../certificate.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as zlib from 'zlib';
import * as https from 'https';

@Injectable()
export class NFeDistributionService {
    private readonly logger = new Logger(NFeDistributionService.name);

    constructor(
        private readonly soapService: SoapService,
        private readonly xmlFactory: XmlFactoryService,
        private readonly certificateService: CertificateService,
        private readonly prisma: PrismaService,
    ) { }

    async fetchNewDocuments(companyId: string) {
        this.logger.log(`Starting document sync for company ${companyId}`);

        // 1. Get Company and Certificate
        const company = await this.prisma.empresa.findUnique({ where: { id: companyId } });
        if (!company) throw new Error('Company not found');

        const certPassword = company.certPassword || process.env.CERT_PASSWORD || '';
        const lastNSU = company.lastNSU || '0';
        const environment = company.ambienteSefaz === 'producao' ? '1' : '2';

        // 2. Build XML
        const innerXml = this.xmlFactory.createDistributionXml(company.cnpj, company.estado || 'RS', lastNSU, environment);
        const soapEnvelope = this.xmlFactory.wrapInSoapEnvelope(innerXml, 'distribution');

        // 3. Send Request
        // URL for AN (Ambiente Nacional) - different from RS
        const url = environment === '1'
            ? 'https://www1.nfe.fazenda.gov.br/NFeDistribuicaoDFe/NFeDistribuicaoDFe.asmx'
            : 'https://hom1.nfe.fazenda.gov.br/NFeDistribuicaoDFe/NFeDistribuicaoDFe.asmx';

        try {
            this.logger.log(`Fetching HTTPS agent for company ${companyId}`);
            const agentConfig = await this.certificateService.getHttpsAgent(companyId, certPassword);
            const agent = new https.Agent(agentConfig);

            this.logger.log(`Sending SOAP request to ${url}`);
            this.logger.debug(`SOAP Envelope: ${soapEnvelope.substring(0, 200)}...`);

            const response = await this.soapService.sendSoapRequest(
                url,
                soapEnvelope,
                agent,
                'http://www.portalfiscal.inf.br/nfe/wsdl/NFeDistribuicaoDFe/nfeDistDFeInteresse'
            );

            this.logger.log(`Received response: Status ${response.status}`);
            if (response.status !== 200) {
                this.logger.error(`SOAP Error Response: ${response.data}`);
                throw new Error(`SOAP Error: ${response.status} - ${response.data}`);
            }

            this.logger.debug(`Processing response payload...`);
            // 4. Parse Response
            return await this.processResponse(response.data, companyId);

        } catch (error) {
            this.logger.error(`Failed to fetch documents: ${error.message}`);
            if (error.response) {
                this.logger.error(`Upstream error data: ${JSON.stringify(error.response.data)}`);
            }
            throw error;
        }
    }

    private async processResponse(xmlResponse: string, companyId: string) {
        // Simple regex parsing for now (xml2js would be better but keeping it robust)
        const cStatMatch = xmlResponse.match(/<cStat>(\d+)<\/cStat>/);
        const cStat = cStatMatch ? cStatMatch[1] : null;

        const ultNSUMatch = xmlResponse.match(/<ultNSU>(\d+)<\/ultNSU>/);
        const maxNSU = ultNSUMatch ? ultNSUMatch[1] : null;

        this.logger.log(`Sefaz Response cStat: ${cStat}, MaxNSU: ${maxNSU}`);

        if (cStat === '138') { // Documentos localizados
            const docZipMatches = [...xmlResponse.matchAll(/<docZip NSU="(\d+)" schema="([^"]+)">([^<]+)<\/docZip>/g)];

            this.logger.log(`Found ${docZipMatches.length} documents`);

            let processedCount = 0;

            for (const match of docZipMatches) {
                const nsu = match[1];
                const schema = match[2];
                const base64Content = match[3];

                try {
                    const buffer = Buffer.from(base64Content, 'base64');
                    // Decompress (GZIP)
                    // Note: Node's zlib sometimes fails if header is missing, but Sefaz sends standard GZIP
                    const xmlContent = zlib.gunzipSync(buffer).toString('utf-8');

                    if (schema.includes('resNFe')) {
                        await this.processResNFe(xmlContent, companyId);
                    } else if (schema.includes('procNFe')) {
                        await this.processProcNFe(xmlContent, companyId);
                    }

                    processedCount++;
                } catch (e) {
                    this.logger.error(`Error processing NSU ${nsu}: ${e.message}`);
                }
            }

            // Update lastNSU if valid
            if (maxNSU) {
                await this.prisma.empresa.update({
                    where: { id: companyId },
                    data: { lastNSU: maxNSU }
                });
            }

            return { success: true, processed: processedCount, maxNSU, moreAvailable: true };
        } else if (cStat === '137') { // Nenhum documento localizado
            if (maxNSU) {
                await this.prisma.empresa.update({
                    where: { id: companyId },
                    data: { lastNSU: maxNSU }
                });
            }
            return { success: true, processed: 0, message: 'Nenhum documento novo' };
        } else if (cStat === '215') {
            const message = 'Falha no Schema XML - Verifique a versão e os campos enviados.';
            this.logger.error(message);
            throw new Error(message);
        }

        return { success: false, cStat, message: `Erro Sefaz: ${cStat} - ${xmlResponse.match(/<xMotivo>(.*?)<\/xMotivo>/)?.[1] || 'Motivo desconhecido'}` };
    }

    private async processResNFe(xml: string, companyId: string) {
        // <resNFe ...><chNFe>...</chNFe><CNPJ>...</CNPJ><xNome>...</xNome><vNF>...</vNF><dhEmi>...</dhEmi></resNFe>
        const chNFe = this.extractTag(xml, 'chNFe');
        const cnpjEmit = this.extractTag(xml, 'CNPJ') || this.extractTag(xml, 'CPF');
        const xNome = this.extractTag(xml, 'xNome');
        const vNF = this.extractTag(xml, 'vNF');
        const dhEmi = this.extractTag(xml, 'dhEmi');

        if (chNFe) {
            await this.prisma.notaFiscal.upsert({
                where: { chaveAcesso: chNFe },
                create: {
                    empresaId: companyId,
                    chaveAcesso: chNFe,
                    numero: chNFe.substring(25, 34), // Extract from key
                    serie: chNFe.substring(22, 25),
                    tipo: 'NFe',
                    emitenteCnpj: cnpjEmit || '00000000000000',
                    emitenteNome: xNome || 'Desconhecido',
                    dataEmissao: dhEmi ? new Date(dhEmi) : new Date(),
                    valorTotal: vNF ? parseFloat(vNF) : 0,
                    statusSefaz: 'autorizada', // resNFe implies authorization
                    statusManifestacao: 'pendente'
                },
                update: {
                    // Update if mainly fields are missing
                }
            });
        }
    }

    private async processProcNFe(xml: string, companyId: string) {
        // Full XML
        const chNFe = this.extractTag(xml, 'chNFe');
        // Extract more details if needed
        // For sync, we mainly want to ensure it exists and store the XML

        if (chNFe) {
            const existing = await this.prisma.notaFiscal.findUnique({ where: { chaveAcesso: chNFe } });
            if (existing) {
                await this.prisma.notaFiscal.update({
                    where: { id: existing.id },
                    data: { xmlConteudo: xml }
                });
            } else {
                // Create full (simplified logic same as resNFe for now, but with XML)
                // In production, parse full XML to get items etc.
                const cnpjEmit = this.extractTag(xml, 'CNPJ') || this.extractTag(xml, 'CPF');
                const xNome = this.extractTag(xml, 'xNome');
                const vNF = this.extractTag(xml, 'vNF');
                const dhEmi = this.extractTag(xml, 'dhEmi');

                await this.prisma.notaFiscal.create({
                    data: {
                        empresaId: companyId,
                        chaveAcesso: chNFe,
                        numero: chNFe.substring(25, 34),
                        serie: chNFe.substring(22, 25),
                        tipo: 'NFe',
                        emitenteCnpj: cnpjEmit || '',
                        emitenteNome: xNome || '',
                        dataEmissao: dhEmi ? new Date(dhEmi) : new Date(),
                        valorTotal: vNF ? parseFloat(vNF) : 0,
                        statusSefaz: 'autorizada',
                        statusManifestacao: 'pendente',
                        xmlConteudo: xml
                    }
                });
            }
        }
    }

    private extractTag(xml: string, tag: string): string | null {
        const match = xml.match(new RegExp(`<${tag}>(.*?)</${tag}>`));
        return match ? match[1] : null;
    }
}
