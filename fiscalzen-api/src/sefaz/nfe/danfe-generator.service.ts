import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const PdfPrinterLib = require('pdfmake/js/Printer');
// Console logs already added in PdfGeneratorService, adding here just in case this service loads first
const PdfPrinter = PdfPrinterLib.default || PdfPrinterLib;
const printer: any = PdfPrinter;
import { TDocumentDefinitions, Content, TableCell, TFontDictionary } from 'pdfmake/interfaces';
import { PrismaService } from '../../prisma/prisma.service';
import * as bwipjs from 'bwip-js';

// Standard fonts for pdfmake
const fonts: TFontDictionary = {
    Helvetica: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique',
    },
};

export interface DanfeData {
    chaveAcesso: string;
    numero: string;
    serie: string;
    dataEmissao: Date;
    dataAutorizacao?: Date;
    protocolo?: string;

    // Emitente
    emitente: {
        cnpj: string;
        razaoSocial: string;
        nomeFantasia?: string;
        endereco: string;
        ie?: string;
    };

    // Destinatário
    destinatario?: {
        cnpjCpf: string;
        nome: string;
        endereco: string;
        ie?: string;
    };

    // Produtos
    produtos: Array<{
        codigo: string;
        descricao: string;
        ncm: string;
        cfop: string;
        unidade: string;
        quantidade: number;
        valorUnitario: number;
        valorTotal: number;
    }>;

    // Totais
    totais: {
        valorProdutos: number;
        valorFrete: number;
        valorSeguro: number;
        valorDesconto: number;
        valorOutras: number;
        valorIPI: number;
        valorTotal: number;
        valorICMS?: number;
    };

    // Transporte
    transporte?: {
        modalidade: string;
        transportador?: string;
    };

    // Informações adicionais
    informacoesAdicionais?: string;
}

@Injectable()
export class DanfeGeneratorService {
    private readonly logger = new Logger(DanfeGeneratorService.name);
    private readonly printer: any;

    constructor(private readonly prisma: PrismaService) {
        this.printer = new PdfPrinter(fonts);
    }

    /**
     * Generate DANFE PDF from chave de acesso
     */
    async generateFromChave(chaveAcesso: string, empresaId: string): Promise<Buffer> {
        const nota = await this.prisma.notaFiscal.findFirst({
            where: {
                chaveAcesso,
                empresaId,
            },
            include: {
                empresa: true,
            },
        });

        if (!nota) {
            throw new NotFoundException('Nota fiscal não encontrada');
        }

        if (nota.statusSefaz !== 'autorizada') {
            throw new BadRequestException('Nota fiscal não autorizada - DANFE não disponível');
        }

        // Build DANFE data from nota
        const danfeData: DanfeData = {
            chaveAcesso: nota.chaveAcesso,
            numero: nota.numero,
            serie: nota.serie,
            dataEmissao: nota.dataEmissao,
            dataAutorizacao: nota.dataAutorizacao || undefined,

            emitente: {
                cnpj: this.formatCnpj(nota.emitenteCnpj),
                razaoSocial: nota.emitenteNome,
                nomeFantasia: nota.empresa?.nomeFantasia || undefined,
                endereco: this.buildEnderecoEmitente(nota.empresa),
                ie: nota.empresa?.inscricaoEstadual || undefined,
            },

            produtos: [], // Would be populated from XML content

            totais: {
                valorProdutos: Number(nota.valorProdutos) || Number(nota.valorTotal),
                valorFrete: 0,
                valorSeguro: 0,
                valorDesconto: 0,
                valorOutras: 0,
                valorIPI: 0,
                valorTotal: Number(nota.valorTotal),
                valorICMS: Number(nota.valorIcms) || 0,
            },
        };

        return this.generate(danfeData);
    }

    /**
     * Generate DANFE PDF from data
     */
    async generate(data: DanfeData): Promise<Buffer> {
        try {
            // Generate barcode image
            const barcodeImage = await this.generateBarcode(data.chaveAcesso);

            const docDefinition = this.buildDocument(data, barcodeImage);
            const pdfDoc = this.printer.createPdfKitDocument(docDefinition);

            return new Promise((resolve, reject) => {
                const chunks: Buffer[] = [];

                pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
                pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
                pdfDoc.on('error', reject);

                pdfDoc.end();
            });
        } catch (error) {
            this.logger.error('Failed to generate DANFE:', error.message);
            throw new BadRequestException(`Falha ao gerar DANFE: ${error.message}`);
        }
    }

    /**
     * Build the DANFE document definition
     */
    private buildDocument(data: DanfeData, barcodeImage: string): TDocumentDefinitions {
        return {
            pageSize: 'A4',
            pageMargins: [20, 20, 20, 20],
            defaultStyle: {
                font: 'Helvetica',
                fontSize: 8,
            },
            content: [
                this.buildHeader(data, barcodeImage),
                this.buildEmitenteSection(data),
                this.buildDestinatarioSection(data),
                this.buildProdutosSection(data),
                this.buildTotaisSection(data),
                this.buildTransporteSection(data),
                this.buildInfoAdicionalSection(data),
            ],
        };
    }

    /**
     * Build header section with barcode
     */
    private buildHeader(data: DanfeData, barcodeImage: string): Content {
        return {
            table: {
                widths: ['*', 150, '*'],
                body: [
                    [
                        {
                            stack: [
                                { text: 'DANFE', style: 'headerTitle', fontSize: 18, bold: true },
                                { text: 'Documento Auxiliar da Nota Fiscal Eletrônica', fontSize: 7 },
                                { text: `0 - ENTRADA`, margin: [0, 5, 0, 0] },
                                { text: `1 - SAÍDA`, fontSize: 8 },
                            ],
                            alignment: 'center',
                            margin: [0, 10, 0, 10],
                        },
                        {
                            image: barcodeImage,
                            width: 140,
                            height: 40,
                            alignment: 'center',
                            margin: [0, 5, 0, 5],
                        },
                        {
                            stack: [
                                { text: 'NF-e', fontSize: 12, bold: true },
                                { text: `Nº ${data.numero.padStart(9, '0')}`, fontSize: 10 },
                                { text: `Série ${data.serie}`, fontSize: 10 },
                                { text: `Folha 1/1`, fontSize: 8 },
                            ],
                            alignment: 'center',
                            margin: [0, 10, 0, 10],
                        },
                    ],
                    [
                        {
                            colSpan: 3,
                            stack: [
                                { text: 'CHAVE DE ACESSO', fontSize: 6, bold: true },
                                { text: this.formatChaveAcesso(data.chaveAcesso), fontSize: 9, alignment: 'center' },
                            ],
                            margin: [0, 5, 0, 5],
                        },
                        {},
                        {},
                    ],
                    [
                        {
                            colSpan: 3,
                            stack: [
                                { text: 'PROTOCOLO DE AUTORIZAÇÃO DE USO', fontSize: 6, bold: true },
                                {
                                    text: data.protocolo
                                        ? `${data.protocolo} - ${this.formatDate(data.dataAutorizacao)}`
                                        : 'Aguardando autorização',
                                    fontSize: 9,
                                    alignment: 'center',
                                },
                            ],
                            margin: [0, 5, 0, 5],
                        },
                        {},
                        {},
                    ],
                ],
            },
            margin: [0, 0, 0, 10],
        };
    }

    /**
     * Build emitente section
     */
    private buildEmitenteSection(data: DanfeData): Content {
        return {
            table: {
                widths: ['*'],
                body: [
                    [{ text: 'IDENTIFICAÇÃO DO EMITENTE', fontSize: 7, bold: true, fillColor: '#eeeeee' }],
                    [
                        {
                            stack: [
                                { text: data.emitente.razaoSocial, fontSize: 10, bold: true },
                                data.emitente.nomeFantasia ? { text: data.emitente.nomeFantasia, fontSize: 8 } : '',
                                { text: data.emitente.endereco, fontSize: 8 },
                                {
                                    columns: [
                                        { text: `CNPJ: ${data.emitente.cnpj}`, width: '50%', fontSize: 8 },
                                        { text: `IE: ${data.emitente.ie || ''}`, width: '50%', fontSize: 8 },
                                    ],
                                },
                            ],
                            margin: [5, 5, 5, 5],
                        },
                    ],
                ],
            },
            margin: [0, 0, 0, 5],
        };
    }

    /**
     * Build destinatário section
     */
    private buildDestinatarioSection(data: DanfeData): Content {
        if (!data.destinatario) {
            return {
                table: {
                    widths: ['*'],
                    body: [
                        [{ text: 'DESTINATÁRIO/REMETENTE', fontSize: 7, bold: true, fillColor: '#eeeeee' }],
                        [{ text: 'Consumidor não identificado', margin: [5, 5, 5, 5] }],
                    ],
                },
                margin: [0, 0, 0, 5],
            };
        }

        return {
            table: {
                widths: ['*'],
                body: [
                    [{ text: 'DESTINATÁRIO/REMETENTE', fontSize: 7, bold: true, fillColor: '#eeeeee' }],
                    [
                        {
                            stack: [
                                { text: data.destinatario.nome, fontSize: 10, bold: true },
                                { text: data.destinatario.endereco, fontSize: 8 },
                                {
                                    columns: [
                                        { text: `CNPJ/CPF: ${data.destinatario.cnpjCpf}`, width: '50%', fontSize: 8 },
                                        { text: `IE: ${data.destinatario.ie || ''}`, width: '50%', fontSize: 8 },
                                    ],
                                },
                            ],
                            margin: [5, 5, 5, 5],
                        },
                    ],
                ],
            },
            margin: [0, 0, 0, 5],
        };
    }

    /**
     * Build produtos table
     */
    private buildProdutosSection(data: DanfeData): any {
        const headerRow: TableCell[] = [
            { text: 'CÓDIGO', bold: true, fontSize: 6, alignment: 'center' },
            { text: 'DESCRIÇÃO', bold: true, fontSize: 6, alignment: 'center' },
            { text: 'NCM', bold: true, fontSize: 6, alignment: 'center' },
            { text: 'CFOP', bold: true, fontSize: 6, alignment: 'center' },
            { text: 'UN', bold: true, fontSize: 6, alignment: 'center' },
            { text: 'QTD', bold: true, fontSize: 6, alignment: 'center' },
            { text: 'V.UNIT', bold: true, fontSize: 6, alignment: 'center' },
            { text: 'V.TOTAL', bold: true, fontSize: 6, alignment: 'center' },
        ];

        const productRows = data.produtos.length > 0
            ? data.produtos.map((p) => [
                { text: p.codigo, fontSize: 7 },
                { text: p.descricao, fontSize: 7 },
                { text: p.ncm, fontSize: 7, alignment: 'center' },
                { text: p.cfop, fontSize: 7, alignment: 'center' },
                { text: p.unidade, fontSize: 7, alignment: 'center' },
                { text: p.quantidade.toFixed(2), fontSize: 7, alignment: 'right' },
                { text: this.formatCurrency(p.valorUnitario), fontSize: 7, alignment: 'right' },
                { text: this.formatCurrency(p.valorTotal), fontSize: 7, alignment: 'right' },
            ])
            : [[{ text: 'Produtos não disponíveis - consulte XML original', colSpan: 8, alignment: 'center', fontSize: 8 }, {}, {}, {}, {}, {}, {}, {}]];

        return {
            table: {
                headerRows: 1,
                widths: [50, '*', 50, 30, 25, 40, 50, 50],
                body: [headerRow, ...productRows],
            },
            margin: [0, 0, 0, 5],
        };
    }

    /**
     * Build totais section
     */
    private buildTotaisSection(data: DanfeData): Content {
        const { totais: t } = data;

        return {
            table: {
                widths: ['*', '*', '*', '*', '*', '*'],
                body: [
                    [
                        { text: 'CÁLCULO DO IMPOSTO', colSpan: 6, bold: true, fontSize: 7, fillColor: '#eeeeee' },
                        {},
                        {},
                        {},
                        {},
                        {},
                    ],
                    [
                        { stack: [{ text: 'BASE CÁLC. ICMS', fontSize: 6 }, { text: this.formatCurrency(t.valorICMS || 0) }] },
                        { stack: [{ text: 'VALOR ICMS', fontSize: 6 }, { text: this.formatCurrency(t.valorICMS || 0) }] },
                        { stack: [{ text: 'VALOR FRETE', fontSize: 6 }, { text: this.formatCurrency(t.valorFrete) }] },
                        { stack: [{ text: 'VALOR SEGURO', fontSize: 6 }, { text: this.formatCurrency(t.valorSeguro) }] },
                        { stack: [{ text: 'DESCONTO', fontSize: 6 }, { text: this.formatCurrency(t.valorDesconto) }] },
                        { stack: [{ text: 'VALOR TOTAL NF', fontSize: 6, bold: true }, { text: this.formatCurrency(t.valorTotal), bold: true }] },
                    ],
                ],
            },
            margin: [0, 0, 0, 5],
        };
    }

    /**
     * Build transporte section
     */
    private buildTransporteSection(data: DanfeData): Content {
        return {
            table: {
                widths: ['*'],
                body: [
                    [{ text: 'TRANSPORTADOR / VOLUMES TRANSPORTADOS', fontSize: 7, bold: true, fillColor: '#eeeeee' }],
                    [
                        {
                            text: data.transporte?.transportador || 'Sem frete / Retirada própria',
                            margin: [5, 5, 5, 5],
                            fontSize: 8,
                        },
                    ],
                ],
            },
            margin: [0, 0, 0, 5],
        };
    }

    /**
     * Build informações adicionais section
     */
    private buildInfoAdicionalSection(data: DanfeData): Content {
        return {
            table: {
                widths: ['*'],
                body: [
                    [{ text: 'DADOS ADICIONAIS', fontSize: 7, bold: true, fillColor: '#eeeeee' }],
                    [
                        {
                            text: data.informacoesAdicionais || 'Documento emitido por ME ou EPP optante pelo Simples Nacional.',
                            margin: [5, 5, 5, 5],
                            fontSize: 7,
                        },
                    ],
                ],
            },
        };
    }

    /**
     * Generate barcode image as base64 data URL
     */
    private async generateBarcode(chaveAcesso: string): Promise<string> {
        try {
            const png = await bwipjs.toBuffer({
                bcid: 'code128',
                text: chaveAcesso,
                scale: 2,
                height: 10,
                includetext: false,
            });

            return `data:image/png;base64,${png.toString('base64')}`;
        } catch (error) {
            this.logger.warn('Failed to generate barcode, using placeholder');
            // Return a minimal 1x1 transparent PNG as fallback
            return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        }
    }

    // Utility methods

    private formatCnpj(cnpj: string): string {
        const clean = cnpj.replace(/\D/g, '');
        return clean.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
    }

    private formatChaveAcesso(chave: string): string {
        return chave.replace(/(\d{4})/g, '$1 ').trim();
    }

    private formatDate(date?: Date | null): string {
        if (!date) return '';
        return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR');
    }

    private formatCurrency(value: number): string {
        return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    private buildEnderecoEmitente(empresa: any): string {
        if (!empresa) return '';
        const parts = [
            empresa.logradouro,
            empresa.numero,
            empresa.bairro,
            empresa.municipio,
            empresa.uf,
        ].filter(Boolean);
        return parts.join(', ');
    }
}
