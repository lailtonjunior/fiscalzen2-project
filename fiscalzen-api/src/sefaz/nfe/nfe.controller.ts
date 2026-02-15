import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    Request,
    Res,
    UseGuards,
    Logger,
    HttpStatus,
    HttpCode,
    HttpException,
    InternalServerErrorException,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiParam, ApiProduces } from '@nestjs/swagger';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { QUEUE_NAMES } from '../../common/queue/queue.module';
import { NFeTransmissionService } from './nfe-transmission.service';
import { NFeXmlBuilderService } from './nfe-xml-builder.service';
import { DanfeGeneratorService } from './danfe-generator.service';
import { NFeDistributionService } from './nfe-distribution.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
    EmitirNFeDto,
    EmissaoResultDto,
    StatusNFeDto,
} from './dto';
import { NFeData, NFeIde, NFeEmit, NFeDest, NFeDet, NFeTotal, NFeTransp, NFePag } from './nfe.interface';
import { NFeJobData } from './nfe.processor';

interface AuthenticatedRequest {
    user: {
        sub: string;
        email: string;
        empresaId: string;
    };
}

@ApiTags('nfe')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('nfe')
export class NFeController {
    private readonly logger = new Logger(NFeController.name);

    constructor(
        @InjectQueue(QUEUE_NAMES.XML_PROCESSING)
        private readonly xmlQueue: Queue,
        private readonly transmissionService: NFeTransmissionService,
        private readonly xmlBuilder: NFeXmlBuilderService,
        private readonly danfeGenerator: DanfeGeneratorService,
        private readonly distributionService: NFeDistributionService,
        private readonly prisma: PrismaService,
    ) { }

    @Post('sync')
    @ApiOperation({ summary: 'Sincronizar notas da Sefaz' })
    @ApiResponse({ status: 200, description: 'Sincronização iniciada com sucesso' })
    async sync(@Request() req: AuthenticatedRequest) {
        const companyId = req.user.empresaId;
        try {
            const result = await this.distributionService.fetchNewDocuments(companyId);
            return result;
        } catch (error) {
            this.logger.error(`Sync error: ${error.message}`, error.stack);
            throw new InternalServerErrorException(`Erro ao sincronizar: ${error.message}`);
        }
    }

    @Get()
    @ApiOperation({ summary: 'Listar notas fiscais' })
    @ApiResponse({ status: 200, description: 'Lista de notas fiscais' })
    async findAll(@Request() req: AuthenticatedRequest) {
        const companyId = req.user.empresaId;
        const notas = await this.prisma.notaFiscal.findMany({
            where: { empresaId: companyId },
            orderBy: { createdAt: 'desc' },
            include: { tags: true }
        });
        return notas;
    }

    @Post('emitir')
    @HttpCode(HttpStatus.ACCEPTED)
    @ApiOperation({ summary: 'Emitir NFe' })
    @ApiResponse({ status: 202, description: 'NFe queued for processing', type: EmissaoResultDto })
    @ApiResponse({ status: 400, description: 'Validation error' })
    async emitirNFe(
        @Request() req: AuthenticatedRequest,
        @Body() dto: EmitirNFeDto,
    ): Promise<EmissaoResultDto> {
        const companyId = req.user.empresaId;

        try {
            // Get company data for emitente
            const empresa = await this.prisma.empresa.findUnique({
                where: { id: companyId },
            });

            if (!empresa) {
                return {
                    success: false,
                    mensagem: 'Empresa não encontrada',
                };
            }

            // Get next NFe number
            const numero = dto.numero || await this.getNextNFeNumber(companyId);
            const serie = dto.serie || '1';

            // Build NFeData from DTO
            const nfeData = this.buildNFeData(dto, empresa, numero, serie);

            // Calculate total
            const valorTotal = this.calculateTotal(dto.produtos);

            // Create NotaFiscal record
            const notaFiscal = await this.prisma.notaFiscal.create({
                data: {
                    empresaId: companyId,
                    tipo: 'NFE',
                    numero,
                    serie,
                    chaveAcesso: '', // Will be updated after transmission
                    statusSefaz: 'pendente',
                    statusManifestacao: 'pendente',
                    valorTotal,
                    emitenteCnpj: (empresa.cnpj || '').replace(/\D/g, ''),
                    emitenteNome: empresa.razaoSocial || empresa.nomeFantasia || '',
                    dataEmissao: new Date(),
                },
            });

            // Queue job for async processing
            const job = await this.xmlQueue.add(
                'nfe-emitir',
                {
                    type: 'EMITIR',
                    companyId,
                    nfeData,
                    notaFiscalId: notaFiscal.id,
                    production: dto.producao ?? false,
                } as NFeJobData,
                {
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 5000,
                    },
                },
            );

            this.logger.log(`NFe emission job created: ${job.id}`);

            return {
                success: true,
                mensagem: 'NFe enviada para processamento',
                jobId: job.id,
            };
        } catch (error) {
            this.logger.error('Failed to queue NFe emission:', error.message);
            return {
                success: false,
                mensagem: `Erro ao processar NFe: ${error.message}`,
            };
        }
    }

    @Get(':chave/status')
    @ApiOperation({ summary: 'Consultar status da NFe por chave de acesso' })
    @ApiParam({ name: 'chave', description: 'Chave de acesso (44 dígitos)' })
    @ApiResponse({ status: 200, description: 'Status da NFe', type: StatusNFeDto })
    @ApiResponse({ status: 404, description: 'NFe não encontrada' })
    async getStatus(
        @Request() req: AuthenticatedRequest,
        @Param('chave') chave: string,
    ): Promise<StatusNFeDto> {
        const companyId = req.user.empresaId;

        const nota = await this.prisma.notaFiscal.findFirst({
            where: {
                empresaId: companyId,
                chaveAcesso: chave,
            },
        });

        if (!nota) {
            return {
                chaveAcesso: chave,
                status: 'NAO_ENCONTRADA',
            };
        }

        return {
            chaveAcesso: chave,
            status: nota.statusSefaz,
            dataAutorizacao: nota.dataAutorizacao?.toISOString(),
            motivoRejeicao: nota.statusSefaz === 'rejeitada' ? nota.statusSefaz : undefined,
            xmlAutorizado: !!nota.xmlConteudo,
        };
    }

    @Get(':chave')
    @ApiOperation({ summary: 'Obter detalhes da NFe' })
    @ApiParam({ name: 'chave', description: 'Chave de acesso (44 dígitos)' })
    async getNFe(
        @Request() req: AuthenticatedRequest,
        @Param('chave') chave: string,
    ) {
        const companyId = req.user.empresaId;

        const nota = await this.prisma.notaFiscal.findFirst({
            where: {
                empresaId: companyId,
                chaveAcesso: chave,
            },
        });

        if (!nota) {
            return { found: false, chaveAcesso: chave };
        }

        return {
            found: true,
            id: nota.id,
            numero: nota.numero,
            serie: nota.serie,
            chaveAcesso: nota.chaveAcesso,
            status: nota.statusSefaz,
            valorTotal: nota.valorTotal,
            dataEmissao: nota.dataEmissao,
            dataAutorizacao: nota.dataAutorizacao,
        };
    }

    @Get(':chave/danfe')
    @ApiOperation({ summary: 'Download DANFE PDF' })
    @ApiParam({ name: 'chave', description: 'Chave de acesso (44 dígitos)' })
    @ApiProduces('application/pdf')
    @ApiResponse({ status: 200, description: 'DANFE PDF file' })
    @ApiResponse({ status: 404, description: 'NFe não encontrada' })
    @ApiResponse({ status: 400, description: 'NFe não autorizada' })
    async downloadDanfe(
        @Request() req: AuthenticatedRequest,
        @Param('chave') chave: string,
        @Res() res: Response,
    ) {
        const companyId = req.user.empresaId;

        try {
            const pdfBuffer = await this.danfeGenerator.generateFromChave(chave, companyId);

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="DANFE-${chave}.pdf"`,
                'Content-Length': pdfBuffer.length,
            });

            res.send(pdfBuffer);
        } catch (error) {
            this.logger.error('Failed to generate DANFE:', error.message);
            res.status(HttpStatus.BAD_REQUEST).json({
                success: false,
                message: error.message,
            });
        }
    }

    /**
     * Build NFeData from DTO
     */
    private buildNFeData(
        dto: EmitirNFeDto,
        empresa: any,
        numero: string,
        serie: string,
    ): NFeData {
        const now = new Date();
        const dhEmi = now.toISOString().replace('Z', '-03:00');

        // IDE
        const ide: NFeIde = {
            cUF: this.getUFCode(empresa.uf || 'RS'),
            cNF: '',
            natOp: dto.naturezaOperacao,
            mod: '55',
            serie,
            nNF: numero,
            dhEmi,
            tpNF: dto.tipoOperacao,
            idDest: '1',
            cMunFG: empresa.codigoMunicipio || '4314902',
            tpImp: '1',
            tpEmis: '1',
            tpAmb: dto.producao ? '1' : '2',
            finNFe: '1',
            indFinal: '1',
            indPres: '1',
            procEmi: '0',
            verProc: 'FiscalZen 1.0',
        };

        // EMIT
        const emit: NFeEmit = {
            CNPJ: (empresa.cnpj || '').replace(/\D/g, ''),
            xNome: empresa.razaoSocial || empresa.nomeFantasia || '',
            xFant: empresa.nomeFantasia,
            enderEmit: {
                xLgr: empresa.logradouro || '',
                nro: empresa.numero || 'S/N',
                xBairro: empresa.bairro || '',
                cMun: empresa.codigoMunicipio || '4314902',
                xMun: empresa.municipio || 'PORTO ALEGRE',
                UF: empresa.uf || 'RS',
                CEP: (empresa.cep || '').replace(/\D/g, ''),
            },
            IE: (empresa.inscricaoEstadual || '').replace(/\D/g, ''),
            CRT: empresa.regimeTributario || '1',
        };

        // DEST
        let dest: NFeDest | undefined;
        if (dto.destinatario) {
            const d = dto.destinatario;
            dest = {
                CNPJ: d.cnpj?.replace(/\D/g, ''),
                CPF: d.cpf?.replace(/\D/g, ''),
                xNome: d.nome,
                enderDest: d.logradouro ? {
                    xLgr: d.logradouro,
                    nro: d.numero || 'S/N',
                    xBairro: d.bairro || '',
                    cMun: d.codigoMunicipio || '',
                    xMun: d.municipio || '',
                    UF: d.uf || '',
                    CEP: (d.cep || '').replace(/\D/g, ''),
                } : undefined,
                indIEDest: d.ie ? '1' : '9',
                IE: d.ie?.replace(/\D/g, ''),
                email: d.email,
            };
        }

        // DET
        const det: NFeDet[] = dto.produtos.map((p, index) => ({
            nItem: index + 1,
            prod: {
                cProd: p.codigo,
                cEAN: p.ean || 'SEM GTIN',
                xProd: p.descricao,
                NCM: p.ncm.replace(/\D/g, ''),
                CFOP: p.cfop,
                uCom: p.unidade,
                qCom: p.quantidade.toFixed(4),
                vUnCom: p.valorUnitario.toFixed(10),
                vProd: (p.quantidade * p.valorUnitario).toFixed(2),
                cEANTrib: p.ean || 'SEM GTIN',
                uTrib: p.unidade,
                qTrib: p.quantidade.toFixed(4),
                vUnTrib: p.valorUnitario.toFixed(10),
                vDesc: p.desconto?.toFixed(2),
                vFrete: p.frete?.toFixed(2),
                indTot: '1',
            },
            imposto: {
                ICMS: {
                    orig: '0',
                    CSOSN: '102',
                },
                PIS: { CST: '07' },
                COFINS: { CST: '07' },
            },
        }));

        // TOTAL
        const totalProd = dto.produtos.reduce((sum, p) => sum + p.quantidade * p.valorUnitario, 0);
        const totalDesc = dto.produtos.reduce((sum, p) => sum + (p.desconto || 0), 0);
        const totalFrete = dto.produtos.reduce((sum, p) => sum + (p.frete || 0), 0);

        const total: NFeTotal = {
            ICMSTot: {
                vBC: '0.00',
                vICMS: '0.00',
                vICMSDeson: '0.00',
                vFCP: '0.00',
                vBCST: '0.00',
                vST: '0.00',
                vFCPST: '0.00',
                vFCPSTRet: '0.00',
                vProd: totalProd.toFixed(2),
                vFrete: totalFrete.toFixed(2),
                vSeg: '0.00',
                vDesc: totalDesc.toFixed(2),
                vII: '0.00',
                vIPI: '0.00',
                vIPIDevol: '0.00',
                vPIS: '0.00',
                vCOFINS: '0.00',
                vOutro: '0.00',
                vNF: (totalProd - totalDesc + totalFrete).toFixed(2),
            },
        };

        // TRANSP
        const transp: NFeTransp = { modFrete: '9' };

        // PAG
        const pag: NFePag = {
            detPag: dto.pagamentos.map(p => ({
                tPag: p.forma,
                vPag: p.valor.toFixed(2),
            })),
        };

        return {
            ide,
            emit,
            dest,
            det,
            total,
            transp,
            pag,
            infAdic: dto.informacoesComplementares
                ? { infCpl: dto.informacoesComplementares }
                : undefined,
        };
    }

    /**
     * Get next NFe number for company
     */
    private async getNextNFeNumber(companyId: string): Promise<string> {
        const lastNota = await this.prisma.notaFiscal.findFirst({
            where: { empresaId: companyId, tipo: 'NFE' },
            orderBy: { createdAt: 'desc' },
        });

        // Parse last number and increment
        const lastNum = lastNota ? parseInt(lastNota.numero, 10) || 0 : 0;
        return (lastNum + 1).toString();
    }

    /**
     * Calculate total from products
     */
    private calculateTotal(produtos: any[]): number {
        return produtos.reduce((sum, p) => {
            const valor = p.quantidade * p.valorUnitario;
            const desconto = p.desconto || 0;
            const frete = p.frete || 0;
            return sum + valor - desconto + frete;
        }, 0);
    }

    /**
     * Get UF code from state abbreviation
     */
    private getUFCode(uf: string): string {
        const codes: Record<string, string> = {
            AC: '12', AL: '27', AP: '16', AM: '13', BA: '29',
            CE: '23', DF: '53', ES: '32', GO: '52', MA: '21',
            MT: '51', MS: '50', MG: '31', PA: '15', PB: '25',
            PR: '41', PE: '26', PI: '22', RJ: '33', RN: '24',
            RS: '43', RO: '11', RR: '14', SC: '42', SP: '35',
            SE: '28', TO: '17',
        };
        return codes[uf.toUpperCase()] || '43';
    }
}
