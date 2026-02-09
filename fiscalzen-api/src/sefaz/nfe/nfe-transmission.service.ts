import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { SoapService } from '../soap.service';
import { XmlSignerService } from './xml-signer.service';
import { NFeXmlBuilderService } from './nfe-xml-builder.service';
import { NFeData } from './nfe.interface';

// SEFAZ Response codes
export enum SefazStatus {
    AUTORIZADO = 100,
    AUTORIZADO_FORA_PRAZO = 150,
    LOTE_EM_PROCESSAMENTO = 105,
    LOTE_PROCESSADO = 104,
    REJEITADO_DUPLICIDADE = 204,
    REJEITADO_INUTILIZADO = 206,
    REJEITADO_DENEGADO = 301,
    SERVICO_PARALISADO = 108,
    SERVICO_PARALISADO_SEM_PREVISAO = 109,
}

export interface NFeAuthorizationResult {
    success: boolean;
    status: number;
    statusMessage: string;
    chaveAcesso?: string;
    protocolNumber?: string;
    authorizationDate?: string;
    xmlProtocolo?: string;
    errors?: string[];
    rawResponse?: string;
}

export interface NFeLoteResult {
    success: boolean;
    recibo?: string;
    status: number;
    statusMessage: string;
    errors?: string[];
}

export interface NFeConsultaResult {
    success: boolean;
    status: number;
    statusMessage: string;
    protNFe?: NFeAuthorizationResult[];
    errors?: string[];
}

@Injectable()
export class NFeTransmissionService {
    private readonly logger = new Logger(NFeTransmissionService.name);

    constructor(
        private readonly soapService: SoapService,
        private readonly xmlSigner: XmlSignerService,
        private readonly xmlBuilder: NFeXmlBuilderService,
    ) { }

    /**
     * Build, sign, and transmit NFe to SEFAZ
     */
    async transmitNFe(
        data: NFeData,
        companyId: string,
        production = false,
    ): Promise<NFeAuthorizationResult> {
        try {
            // 1. Generate chave de acesso
            const now = new Date();
            const aamm = `${now.getFullYear().toString().substring(2)}${(now.getMonth() + 1).toString().padStart(2, '0')}`;
            const cNF = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');

            const chaveAcesso = this.xmlBuilder.generateChaveAcesso(
                data.ide.cUF,
                aamm,
                data.emit.CNPJ,
                data.ide.mod,
                data.ide.serie,
                data.ide.nNF,
                data.ide.tpEmis,
                cNF,
            );

            // Update IDE with generated values
            data.ide.cNF = cNF;
            data.ide.cDV = chaveAcesso.slice(-1);

            // 2. Build XML
            const xml = this.xmlBuilder.buildNFeXml(data, chaveAcesso);

            // 3. Sign XML
            const signedXml = await this.xmlSigner.signNFeXml(xml, companyId);

            // 4. Build lote (batch envelope)
            const loteXml = this.buildLoteEnvio(signedXml, '1');

            // 5. Wrap in SOAP envelope
            const soapEnvelope = this.wrapInSoapEnvelope(loteXml, 'NFeAutorizacao4');

            // 6. Send to SEFAZ
            const response = await this.soapService.sendNFeAutorizacao(soapEnvelope, companyId, production);

            // 7. Parse response
            return this.parseAuthorizationResponse(response.data, chaveAcesso);
        } catch (error) {
            this.logger.error('NFe transmission failed:', error.message);
            return {
                success: false,
                status: 0,
                statusMessage: `Erro na transmissão: ${error.message}`,
                errors: [error.message],
            };
        }
    }

    /**
     * Consult authorization receipt
     */
    async consultarRecibo(
        recibo: string,
        companyId: string,
        production = false,
    ): Promise<NFeConsultaResult> {
        try {
            const xml = this.buildConsultaRecibo(recibo);
            const soapEnvelope = this.wrapInSoapEnvelope(xml, 'NFeRetAutorizacao4');

            const response = await this.soapService.consultarRecibo(soapEnvelope, companyId, production);

            return this.parseConsultaResponse(response.data);
        } catch (error) {
            this.logger.error('Recibo consultation failed:', error.message);
            return {
                success: false,
                status: 0,
                statusMessage: `Erro na consulta: ${error.message}`,
                errors: [error.message],
            };
        }
    }

    /**
     * Build enviNFe (lote) envelope
     */
    private buildLoteEnvio(signedNFe: string, idLote: string): string {
        return `<enviNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">` +
            `<idLote>${idLote}</idLote>` +
            `<indSinc>1</indSinc>` +
            signedNFe +
            `</enviNFe>`;
    }

    /**
     * Build consRecNFe XML for receipt consultation
     */
    private buildConsultaRecibo(recibo: string): string {
        return `<consReciNFe xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">` +
            `<tpAmb>2</tpAmb>` +
            `<nRec>${recibo}</nRec>` +
            `</consReciNFe>`;
    }

    /**
     * Wrap XML in SOAP envelope for specific service
     */
    private wrapInSoapEnvelope(xmlBody: string, service: string): string {
        return `<?xml version="1.0" encoding="utf-8"?>` +
            `<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ` +
            `xmlns:xsd="http://www.w3.org/2001/XMLSchema" ` +
            `xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">` +
            `<soap12:Body>` +
            `<nfeDadosMsg xmlns="http://www.portalfiscal.inf.br/nfe/wsdl/${service}">` +
            xmlBody +
            `</nfeDadosMsg>` +
            `</soap12:Body>` +
            `</soap12:Envelope>`;
    }

    /**
     * Parse SEFAZ authorization response
     */
    private parseAuthorizationResponse(responseXml: string, chaveAcesso: string): NFeAuthorizationResult {
        try {
            // Extract cStat (status code)
            const cStatMatch = responseXml.match(/<cStat>(\d+)<\/cStat>/);
            const xMotivoMatch = responseXml.match(/<xMotivo>([^<]+)<\/xMotivo>/);

            const status = cStatMatch ? parseInt(cStatMatch[1], 10) : 0;
            const statusMessage = xMotivoMatch ? xMotivoMatch[1] : 'Resposta não identificada';

            // Check if processing in batch (need to consult receipt later)
            if (status === SefazStatus.LOTE_EM_PROCESSAMENTO) {
                const reciboMatch = responseXml.match(/<nRec>(\d+)<\/nRec>/);
                return {
                    success: false,
                    status,
                    statusMessage,
                    chaveAcesso,
                    protocolNumber: reciboMatch ? reciboMatch[1] : undefined,
                };
            }

            // Check for successful authorization
            const isAuthorized = status === SefazStatus.AUTORIZADO || status === SefazStatus.AUTORIZADO_FORA_PRAZO;

            if (isAuthorized) {
                const nProtMatch = responseXml.match(/<nProt>(\d+)<\/nProt>/);
                const dhRecbtoMatch = responseXml.match(/<dhRecbto>([^<]+)<\/dhRecbto>/);

                // Extract full protNFe for archiving
                const protNFeMatch = responseXml.match(/<protNFe[^>]*>([\s\S]*?)<\/protNFe>/);

                return {
                    success: true,
                    status,
                    statusMessage,
                    chaveAcesso,
                    protocolNumber: nProtMatch ? nProtMatch[1] : undefined,
                    authorizationDate: dhRecbtoMatch ? dhRecbtoMatch[1] : undefined,
                    xmlProtocolo: protNFeMatch ? protNFeMatch[0] : undefined,
                };
            }

            // Rejection or error
            return {
                success: false,
                status,
                statusMessage,
                chaveAcesso,
                errors: [statusMessage],
                rawResponse: responseXml,
            };
        } catch (error) {
            this.logger.error('Failed to parse authorization response:', error.message);
            return {
                success: false,
                status: 0,
                statusMessage: 'Erro ao processar resposta da SEFAZ',
                errors: [error.message],
                rawResponse: responseXml,
            };
        }
    }

    /**
     * Parse receipt consultation response
     */
    private parseConsultaResponse(responseXml: string): NFeConsultaResult {
        try {
            const cStatMatch = responseXml.match(/<cStat>(\d+)<\/cStat>/);
            const xMotivoMatch = responseXml.match(/<xMotivo>([^<]+)<\/xMotivo>/);

            const status = cStatMatch ? parseInt(cStatMatch[1], 10) : 0;
            const statusMessage = xMotivoMatch ? xMotivoMatch[1] : 'Resposta não identificada';

            // Check if lote was processed
            if (status === SefazStatus.LOTE_PROCESSADO) {
                // Extract all protNFe elements
                const protNFeMatches = responseXml.matchAll(/<protNFe[^>]*>([\s\S]*?)<\/protNFe>/g);
                const protNFe: NFeAuthorizationResult[] = [];

                for (const match of protNFeMatches) {
                    const protXml = match[0];
                    const chaveMatch = protXml.match(/<chNFe>(\d{44})<\/chNFe>/);

                    if (chaveMatch) {
                        protNFe.push(this.parseAuthorizationResponse(protXml, chaveMatch[1]));
                    }
                }

                return {
                    success: true,
                    status,
                    statusMessage,
                    protNFe,
                };
            }

            // Still processing or error
            return {
                success: status === SefazStatus.LOTE_EM_PROCESSAMENTO,
                status,
                statusMessage,
                errors: status !== SefazStatus.LOTE_EM_PROCESSAMENTO ? [statusMessage] : undefined,
            };
        } catch (error) {
            this.logger.error('Failed to parse consulta response:', error.message);
            return {
                success: false,
                status: 0,
                statusMessage: 'Erro ao processar resposta de consulta',
                errors: [error.message],
            };
        }
    }

    /**
     * Get human-readable status description
     */
    getStatusDescription(status: number): string {
        const descriptions: Record<number, string> = {
            [SefazStatus.AUTORIZADO]: 'Autorizado o uso da NF-e',
            [SefazStatus.AUTORIZADO_FORA_PRAZO]: 'Autorizado o uso da NF-e, autorização fora de prazo',
            [SefazStatus.LOTE_EM_PROCESSAMENTO]: 'Lote em processamento',
            [SefazStatus.LOTE_PROCESSADO]: 'Lote processado',
            [SefazStatus.REJEITADO_DUPLICIDADE]: 'Rejeição: Duplicidade de NF-e',
            [SefazStatus.REJEITADO_INUTILIZADO]: 'Rejeição: Número de NF-e inutilizado',
            [SefazStatus.REJEITADO_DENEGADO]: 'Uso Denegado',
            [SefazStatus.SERVICO_PARALISADO]: 'Serviço paralisado momentaneamente',
            [SefazStatus.SERVICO_PARALISADO_SEM_PREVISAO]: 'Serviço paralisado sem previsão',
        };

        return descriptions[status] || `Status desconhecido: ${status}`;
    }

    /**
     * Check if status indicates success
     */
    isAuthorized(status: number): boolean {
        return status === SefazStatus.AUTORIZADO || status === SefazStatus.AUTORIZADO_FORA_PRAZO;
    }

    /**
     * Check if should retry consultation
     */
    shouldRetryConsulta(status: number): boolean {
        return status === SefazStatus.LOTE_EM_PROCESSAMENTO;
    }
}
