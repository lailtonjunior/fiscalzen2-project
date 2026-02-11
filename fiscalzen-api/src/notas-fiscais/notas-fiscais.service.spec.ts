import { Test, TestingModule } from '@nestjs/testing';
import { NotasFiscaisService } from './notas-fiscais.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../common/storage';
import { NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';

const mockPrisma = {
    notaFiscal: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
    },
    manifestacao: {
        create: jest.fn(),
        findMany: jest.fn(),
    },
    tag: {
        findMany: jest.fn(),
    },
    $transaction: jest.fn(),
};

const mockStorage = {
    upload: jest.fn(),
    download: jest.fn(),
};

describe('NotasFiscaisService', () => {
    let service: NotasFiscaisService;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NotasFiscaisService,
                { provide: PrismaService, useValue: mockPrisma },
                { provide: StorageService, useValue: mockStorage },
            ],
        }).compile();

        service = module.get<NotasFiscaisService>(NotasFiscaisService);
    });

    describe('findAll', () => {
        const empresaId = 'emp-1';

        it('should return paginated results with cursor metadata', async () => {
            const mockNotas = Array.from({ length: 3 }, (_, i) => ({
                id: `nota-${i}`,
                chaveAcesso: `chave-${i}`,
                tags: [],
            }));

            mockPrisma.notaFiscal.findMany.mockResolvedValue(mockNotas);
            mockPrisma.notaFiscal.count.mockResolvedValue(10);

            const result = await service.findAll({ take: 20 }, empresaId);

            expect(result.data).toHaveLength(3);
            expect(result.meta.total).toBe(10);
            expect(result.meta.hasMore).toBe(false);
            expect(result.meta.nextCursor).toBeNull();
        });

        it('should set hasMore=true when data exceeds take', async () => {
            const mockNotas = Array.from({ length: 4 }, (_, i) => ({
                id: `nota-${i}`,
                chaveAcesso: `chave-${i}`,
                tags: [],
            }));

            mockPrisma.notaFiscal.findMany.mockResolvedValue(mockNotas);
            mockPrisma.notaFiscal.count.mockResolvedValue(100);

            const result = await service.findAll({ take: 3 }, empresaId);

            expect(result.data).toHaveLength(3);
            expect(result.meta.hasMore).toBe(true);
            expect(result.meta.nextCursor).toBe('nota-2');
        });

        it('should apply cursor-based pagination with skip:1', async () => {
            mockPrisma.notaFiscal.findMany.mockResolvedValue([]);
            mockPrisma.notaFiscal.count.mockResolvedValue(0);

            await service.findAll({ cursor: 'cursor-id', take: 10 }, empresaId);

            expect(mockPrisma.notaFiscal.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    cursor: { id: 'cursor-id' },
                    skip: 1,
                    take: 11,
                }),
            );
        });

        it('should build dynamic where with all filters', async () => {
            mockPrisma.notaFiscal.findMany.mockResolvedValue([]);
            mockPrisma.notaFiscal.count.mockResolvedValue(0);

            await service.findAll(
                {
                    tipo: 'NFe',
                    statusSefaz: 'autorizada',
                    statusManifestacao: 'pendente',
                    emitenteCnpj: '12345',
                    periodoInicio: '2025-01-01',
                    periodoFim: '2025-12-31',
                    tags: ['urgente'],
                },
                empresaId,
            );

            const whereArg = mockPrisma.notaFiscal.findMany.mock.calls[0][0].where;
            expect(whereArg.empresaId).toBe(empresaId);
            expect(whereArg.tipo).toBe('NFe');
            expect(whereArg.statusSefaz).toBe('autorizada');
            expect(whereArg.statusManifestacao).toBe('pendente');
            expect(whereArg.emitenteCnpj).toEqual({ contains: '12345' });
            expect(whereArg.dataEmissao.gte).toBeInstanceOf(Date);
            expect(whereArg.dataEmissao.lte).toBeInstanceOf(Date);
            expect(whereArg.tags).toEqual({ some: { nome: { in: ['urgente'] } } });
        });
    });

    describe('findOne', () => {
        it('should return nota with manifestações and tags', async () => {
            const mockNota = { id: 'nota-1', tags: [], manifestacoes: [] };
            mockPrisma.notaFiscal.findFirst.mockResolvedValue(mockNota);

            const result = await service.findOne('nota-1', 'emp-1');

            expect(result).toEqual(mockNota);
            expect(mockPrisma.notaFiscal.findFirst).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'nota-1', empresaId: 'emp-1' },
                }),
            );
        });

        it('should throw NotFoundException when nota not found', async () => {
            mockPrisma.notaFiscal.findFirst.mockResolvedValue(null);

            await expect(service.findOne('not-exists', 'emp-1'))
                .rejects.toThrow(NotFoundException);
        });
    });

    describe('importXml', () => {
        const validXml = `
            <nfeProc>
                <NFe>
                    <infNFe>
                        <chNFe>12345678901234567890123456789012345678901234</chNFe>
                        <nNF>123</nNF>
                        <serie>1</serie>
                        <dhEmi>2025-01-01T00:00:00-03:00</dhEmi>
                        <CNPJ>12345678000100</CNPJ>
                        <xNome>Empresa Test</xNome>
                        <vNF>1000.00</vNF>
                        <vProd>900.00</vProd>
                        <vICMS>180.00</vICMS>
                    </infNFe>
                </NFe>
            </nfeProc>`;

        it('should parse XML, save to storage, and create record', async () => {
            mockPrisma.notaFiscal.findUnique.mockResolvedValue(null);
            mockStorage.upload.mockResolvedValue({ key: 'xml/emp-1/chave.xml' });
            mockPrisma.notaFiscal.create.mockResolvedValue({ id: 'nota-1', chaveAcesso: '12345678901234567890123456789012345678901234' });

            const result = await service.importXml(Buffer.from(validXml), 'test.xml', 'emp-1');

            expect(mockStorage.upload).toHaveBeenCalledWith(
                expect.stringContaining('xml/emp-1/'),
                expect.any(Buffer),
                'text/xml',
            );
            expect(mockPrisma.notaFiscal.create).toHaveBeenCalled();
            expect(result.chaveAcesso).toBe('12345678901234567890123456789012345678901234');
        });

        it('should throw ConflictException for duplicate chaveAcesso', async () => {
            mockPrisma.notaFiscal.findUnique.mockResolvedValue({ id: 'existing' });

            await expect(service.importXml(Buffer.from(validXml), 'test.xml', 'emp-1'))
                .rejects.toThrow(ConflictException);
        });

        it('should throw BadRequestException for invalid XML', async () => {
            await expect(service.importXml(Buffer.from('<invalid>no chave</invalid>'), 'bad.xml', 'emp-1'))
                .rejects.toThrow(BadRequestException);
        });
    });

    describe('downloadXml', () => {
        it('should return XML from xmlConteudo field if available', async () => {
            mockPrisma.notaFiscal.findFirst.mockResolvedValue({
                chaveAcesso: 'chave-1',
                xmlConteudo: '<NFe>content</NFe>',
            });

            const result = await service.downloadXml('nota-1', 'emp-1');

            expect(result.chaveAcesso).toBe('chave-1');
            expect(result.buffer.toString()).toBe('<NFe>content</NFe>');
            expect(mockStorage.download).not.toHaveBeenCalled();
        });

        it('should fallback to MinIO storage when xmlConteudo is null', async () => {
            mockPrisma.notaFiscal.findFirst.mockResolvedValue({
                chaveAcesso: 'chave-1',
                xmlConteudo: null,
            });
            mockStorage.download.mockResolvedValue(Buffer.from('<NFe>from-minio</NFe>'));

            const result = await service.downloadXml('nota-1', 'emp-1');

            expect(mockStorage.download).toHaveBeenCalledWith('xml/emp-1/chave-1.xml');
            expect(result.buffer.toString()).toBe('<NFe>from-minio</NFe>');
        });

        it('should throw NotFoundException when nota not found', async () => {
            mockPrisma.notaFiscal.findFirst.mockResolvedValue(null);

            await expect(service.downloadXml('not-exists', 'emp-1'))
                .rejects.toThrow(NotFoundException);
        });
    });

    describe('softDelete', () => {
        it('should update statusSefaz to inativa', async () => {
            mockPrisma.notaFiscal.findFirst.mockResolvedValue({ id: 'nota-1' });
            mockPrisma.notaFiscal.update.mockResolvedValue({ id: 'nota-1', statusSefaz: 'inativa' });

            const result = await service.softDelete('nota-1', 'emp-1');

            expect(result.statusSefaz).toBe('inativa');
            expect(mockPrisma.notaFiscal.update).toHaveBeenCalledWith({
                where: { id: 'nota-1' },
                data: { statusSefaz: 'inativa' },
            });
        });

        it('should throw NotFoundException when nota not found', async () => {
            mockPrisma.notaFiscal.findFirst.mockResolvedValue(null);

            await expect(service.softDelete('not-exists', 'emp-1'))
                .rejects.toThrow(NotFoundException);
        });
    });

    describe('manifestar', () => {
        it('should create manifestação and update nota status in transaction', async () => {
            mockPrisma.notaFiscal.findFirst.mockResolvedValue({ id: 'nota-1' });
            mockPrisma.$transaction.mockImplementation(async (cb) => {
                const tx = {
                    manifestacao: { create: jest.fn().mockResolvedValue({ id: 'man-1', tipo: 'ciencia' }) },
                    notaFiscal: { update: jest.fn().mockResolvedValue({}) },
                };
                return cb(tx);
            });

            const result = await service.manifestar('nota-1', 'emp-1', 'user-1', 'ciencia', 'Confirmado');

            expect(result.tipo).toBe('ciencia');
        });

        it('should throw NotFoundException when nota not found', async () => {
            mockPrisma.notaFiscal.findFirst.mockResolvedValue(null);

            await expect(service.manifestar('not-exists', 'emp-1', 'user-1', 'ciencia'))
                .rejects.toThrow(NotFoundException);
        });
    });

    describe('assignTags', () => {
        it('should connect tags to nota', async () => {
            mockPrisma.notaFiscal.findFirst.mockResolvedValue({ id: 'nota-1' });
            mockPrisma.tag.findMany.mockResolvedValue([{ id: 'tag-1' }, { id: 'tag-2' }]);
            mockPrisma.notaFiscal.update.mockResolvedValue({
                id: 'nota-1',
                tags: [{ id: 'tag-1' }, { id: 'tag-2' }],
            });

            const result = await service.assignTags('nota-1', 'emp-1', ['tag-1', 'tag-2']);

            expect(result.tags).toHaveLength(2);
            expect(mockPrisma.notaFiscal.update).toHaveBeenCalledWith({
                where: { id: 'nota-1' },
                data: { tags: { connect: [{ id: 'tag-1' }, { id: 'tag-2' }] } },
                include: { tags: true },
            });
        });

        it('should throw BadRequestException when tags do not belong to empresa', async () => {
            mockPrisma.notaFiscal.findFirst.mockResolvedValue({ id: 'nota-1' });
            mockPrisma.tag.findMany.mockResolvedValue([{ id: 'tag-1' }]); // only 1 of 2 found

            await expect(service.assignTags('nota-1', 'emp-1', ['tag-1', 'tag-invalid']))
                .rejects.toThrow(BadRequestException);
        });
    });

    describe('removeTag', () => {
        it('should disconnect tag from nota', async () => {
            mockPrisma.notaFiscal.findFirst.mockResolvedValue({ id: 'nota-1' });
            mockPrisma.notaFiscal.update.mockResolvedValue({ id: 'nota-1', tags: [] });

            const result = await service.removeTag('nota-1', 'emp-1', 'tag-1');

            expect(mockPrisma.notaFiscal.update).toHaveBeenCalledWith({
                where: { id: 'nota-1' },
                data: { tags: { disconnect: { id: 'tag-1' } } },
                include: { tags: true },
            });
        });
    });
});
