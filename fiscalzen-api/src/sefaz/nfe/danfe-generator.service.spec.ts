import { Test, TestingModule } from '@nestjs/testing';
import { DanfeGeneratorService } from './danfe-generator.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

// Import DanfeData interface (or define inline if not exported)
interface DanfeData {
    chaveAcesso: string;
    numero: string;
    serie: string;
    dataEmissao: Date;
    dataAutorizacao?: Date;
    protocolo?: string;
    emitente: {
        cnpj: string;
        razaoSocial: string;
        nomeFantasia?: string;
        endereco: string;
        ie?: string;
    };
    destinatario?: {
        cnpjCpf?: string;
        nome?: string;
        endereco?: string;
        ie?: string;
    };
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
    transporte?: {
        modalidade: string;
        transportador?: string;
    };
    informacoesAdicionais?: string;
}

// Mock PrismaService
const mockPrismaService = {
    notaFiscal: {
        findFirst: jest.fn(),
    },
};

describe('DanfeGeneratorService', () => {
    let service: DanfeGeneratorService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DanfeGeneratorService,
                { provide: PrismaService, useValue: mockPrismaService },
            ],
        }).compile();

        service = module.get<DanfeGeneratorService>(DanfeGeneratorService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('generate', () => {
        const mockDanfeData: DanfeData = {
            chaveAcesso: '43260212345678000190550010000000011123456789',
            numero: '1',
            serie: '1',
            dataEmissao: new Date('2026-02-08T12:00:00'),
            dataAutorizacao: new Date('2026-02-08T12:01:00'),
            protocolo: '143260000000001',
            emitente: {
                cnpj: '12.345.678/0001-90',
                razaoSocial: 'EMPRESA TESTE LTDA',
                nomeFantasia: 'TESTE',
                endereco: 'RUA TESTE, 100, CENTRO, PORTO ALEGRE, RS',
                ie: '1234567890',
            },
            destinatario: {
                cnpjCpf: '98.765.432/0001-99',
                nome: 'EMPRESA DESTINO LTDA',
                endereco: 'RUA DESTINO, 200, BAIRRO, PORTO ALEGRE, RS',
                ie: '0987654321',
            },
            produtos: [
                {
                    codigo: '001',
                    descricao: 'PRODUTO TESTE A',
                    ncm: '12345678',
                    cfop: '5102',
                    unidade: 'UN',
                    quantidade: 10,
                    valorUnitario: 100,
                    valorTotal: 1000,
                },
            ],
            totais: {
                valorProdutos: 1000,
                valorFrete: 0,
                valorSeguro: 0,
                valorDesconto: 0,
                valorOutras: 0,
                valorIPI: 0,
                valorTotal: 1000,
                valorICMS: 0,
            },
            transporte: {
                modalidade: '9',
                transportador: 'Sem frete',
            },
            informacoesAdicionais: 'Documento emitido por ME optante pelo Simples Nacional.',
        };

        it('should generate PDF buffer', async () => {
            const pdfBuffer = await service.generate(mockDanfeData);

            expect(pdfBuffer).toBeInstanceOf(Buffer);
            expect(pdfBuffer.length).toBeGreaterThan(0);
        });

        it('should generate valid PDF with header', async () => {
            const pdfBuffer = await service.generate(mockDanfeData);

            // PDF magic number check
            const pdfHeader = pdfBuffer.toString('utf8', 0, 4);
            expect(pdfHeader).toBe('%PDF');
        });

        it('should handle missing destinatario', async () => {
            const dataWithoutDest: DanfeData = {
                ...mockDanfeData,
                destinatario: undefined,
            };

            const pdfBuffer = await service.generate(dataWithoutDest);

            expect(pdfBuffer).toBeInstanceOf(Buffer);
            expect(pdfBuffer.length).toBeGreaterThan(0);
        });

        it('should handle empty produtos array', async () => {
            const dataNoProducts: DanfeData = {
                ...mockDanfeData,
                produtos: [],
            };

            const pdfBuffer = await service.generate(dataNoProducts);

            expect(pdfBuffer).toBeInstanceOf(Buffer);
        });

        it('should handle missing protocolo', async () => {
            const dataNoProtocol: DanfeData = {
                ...mockDanfeData,
                protocolo: undefined,
                dataAutorizacao: undefined,
            };

            const pdfBuffer = await service.generate(dataNoProtocol);

            expect(pdfBuffer).toBeInstanceOf(Buffer);
        });

        it('should handle multiple products', async () => {
            const dataMultiProducts: DanfeData = {
                ...mockDanfeData,
                produtos: [
                    { codigo: '001', descricao: 'PROD A', ncm: '12345678', cfop: '5102', unidade: 'UN', quantidade: 1, valorUnitario: 10, valorTotal: 10 },
                    { codigo: '002', descricao: 'PROD B', ncm: '87654321', cfop: '5102', unidade: 'UN', quantidade: 2, valorUnitario: 20, valorTotal: 40 },
                    { codigo: '003', descricao: 'PROD C', ncm: '11111111', cfop: '5102', unidade: 'KG', quantidade: 5, valorUnitario: 5, valorTotal: 25 },
                ],
                totais: {
                    ...mockDanfeData.totais,
                    valorProdutos: 75,
                    valorTotal: 75,
                },
            };

            const pdfBuffer = await service.generate(dataMultiProducts);

            expect(pdfBuffer).toBeInstanceOf(Buffer);
            expect(pdfBuffer.length).toBeGreaterThan(0);
        });
    });

    describe('generateFromChave', () => {
        it('should throw NotFoundException when NFe not found', async () => {
            mockPrismaService.notaFiscal.findFirst.mockResolvedValue(null);

            await expect(
                service.generateFromChave('12345678901234567890123456789012345678901234', 'company-id'),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException for non-authorized NFe', async () => {
            mockPrismaService.notaFiscal.findFirst.mockResolvedValue({
                id: '1',
                chaveAcesso: '12345678901234567890123456789012345678901234',
                statusSefaz: 'pendente',
                numero: '1',
                serie: '1',
                dataEmissao: new Date(),
                emitenteCnpj: '12345678000190',
                emitenteNome: 'TESTE',
                valorTotal: 100,
                empresa: null,
            });

            await expect(
                service.generateFromChave('12345678901234567890123456789012345678901234', 'company-id'),
            ).rejects.toThrow(BadRequestException);
        });

        it('should generate PDF for authorized NFe', async () => {
            mockPrismaService.notaFiscal.findFirst.mockResolvedValue({
                id: '1',
                chaveAcesso: '12345678901234567890123456789012345678901234',
                statusSefaz: 'autorizada',
                numero: '1',
                serie: '1',
                dataEmissao: new Date(),
                dataAutorizacao: new Date(),
                emitenteCnpj: '12345678000190',
                emitenteNome: 'EMPRESA TESTE',
                valorTotal: 1000,
                valorProdutos: 1000,
                valorIcms: 0,
                empresa: {
                    nomeFantasia: 'TESTE',
                    inscricaoEstadual: '123',
                    logradouro: 'RUA',
                    numero: '100',
                    bairro: 'CENTRO',
                    municipio: 'POA',
                    uf: 'RS',
                },
            });

            const pdfBuffer = await service.generateFromChave(
                '12345678901234567890123456789012345678901234',
                'company-id',
            );

            expect(pdfBuffer).toBeInstanceOf(Buffer);
            expect(pdfBuffer.length).toBeGreaterThan(0);
            expect(pdfBuffer.toString('utf8', 0, 4)).toBe('%PDF');
        });
    });

    describe('formatting utilities', () => {
        it('formatCnpj should format CNPJ correctly', () => {
            const formatted = service.formatCnpj('12345678000190');
            expect(formatted).toBe('12.345.678/0001-90');
        });

        it('formatCnpj should return already formatted CNPJ', () => {
            const formatted = service.formatCnpj('12.345.678/0001-90');
            expect(formatted).toContain('.');
        });

        it('formatChaveAcesso should format with spaces', () => {
            const chave = '43260212345678000190550010000000011123456789';
            const formatted = service.formatChaveAcesso(chave);
            expect(formatted).toContain(' ');
        });

        it('formatDate should format date correctly', () => {
            const date = new Date('2026-02-08T12:00:00');
            const formatted = service.formatDate(date);
            expect(formatted).toContain('08');
            expect(formatted).toContain('02');
            expect(formatted).toContain('2026');
        });

        it('formatDate should handle null', () => {
            const formatted = service.formatDate(null);
            expect(formatted).toBe('-');
        });

        it('formatCurrency should format currency correctly', () => {
            const formatted = service.formatCurrency(1234.56);
            expect(formatted).toContain('1');
            expect(formatted).toContain('234');
        });
    });
});
