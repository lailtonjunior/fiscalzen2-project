import { Test, TestingModule } from '@nestjs/testing';
import { TagsService } from './tags.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

const mockPrisma = {
    tag: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
};

describe('TagsService', () => {
    let service: TagsService;

    beforeEach(async () => {
        jest.clearAllMocks();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TagsService,
                { provide: PrismaService, useValue: mockPrisma },
            ],
        }).compile();

        service = module.get<TagsService>(TagsService);
    });

    describe('findAll', () => {
        it('should return all tags for empresa with nota count', async () => {
            const mockTags = [
                { id: 'tag-1', nome: 'Urgente', cor: '#ff0000', _count: { notasFiscais: 5 } },
                { id: 'tag-2', nome: 'Pago', cor: '#00ff00', _count: { notasFiscais: 3 } },
            ];
            mockPrisma.tag.findMany.mockResolvedValue(mockTags);

            const result = await service.findAll('emp-1');

            expect(result).toHaveLength(2);
            expect(mockPrisma.tag.findMany).toHaveBeenCalledWith({
                where: { empresaId: 'emp-1' },
                orderBy: { nome: 'asc' },
                include: { _count: { select: { notasFiscais: true } } },
            });
        });
    });

    describe('create', () => {
        it('should create a tag with nome and cor', async () => {
            mockPrisma.tag.create.mockResolvedValue({
                id: 'tag-1',
                nome: 'Urgente',
                cor: '#ff0000',
                empresaId: 'emp-1',
            });

            const result = await service.create('emp-1', 'Urgente', '#ff0000');

            expect(result.nome).toBe('Urgente');
            expect(mockPrisma.tag.create).toHaveBeenCalledWith({
                data: { nome: 'Urgente', cor: '#ff0000', empresaId: 'emp-1' },
            });
        });

        it('should throw ConflictException for duplicate tag name', async () => {
            const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
                code: 'P2002',
                clientVersion: '5.0.0',
            });
            mockPrisma.tag.create.mockRejectedValue(prismaError);

            await expect(service.create('emp-1', 'Urgente', '#ff0000'))
                .rejects.toThrow(ConflictException);
        });
    });

    describe('update', () => {
        it('should update tag nome and cor', async () => {
            mockPrisma.tag.findFirst.mockResolvedValue({ id: 'tag-1' });
            mockPrisma.tag.update.mockResolvedValue({
                id: 'tag-1',
                nome: 'Updated',
                cor: '#0000ff',
            });

            const result = await service.update('tag-1', 'emp-1', { nome: 'Updated', cor: '#0000ff' });

            expect(result.nome).toBe('Updated');
        });

        it('should throw NotFoundException when tag not found', async () => {
            mockPrisma.tag.findFirst.mockResolvedValue(null);

            await expect(service.update('not-exists', 'emp-1', { nome: 'X' }))
                .rejects.toThrow(NotFoundException);
        });

        it('should throw ConflictException for duplicate name on update', async () => {
            mockPrisma.tag.findFirst.mockResolvedValue({ id: 'tag-1' });
            const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
                code: 'P2002',
                clientVersion: '5.0.0',
            });
            mockPrisma.tag.update.mockRejectedValue(prismaError);

            await expect(service.update('tag-1', 'emp-1', { nome: 'Duplicate' }))
                .rejects.toThrow(ConflictException);
        });
    });

    describe('remove', () => {
        it('should delete tag', async () => {
            mockPrisma.tag.findFirst.mockResolvedValue({ id: 'tag-1' });
            mockPrisma.tag.delete.mockResolvedValue({ id: 'tag-1' });

            const result = await service.remove('tag-1', 'emp-1');

            expect(result.id).toBe('tag-1');
            expect(mockPrisma.tag.delete).toHaveBeenCalledWith({ where: { id: 'tag-1' } });
        });

        it('should throw NotFoundException when tag not found', async () => {
            mockPrisma.tag.findFirst.mockResolvedValue(null);

            await expect(service.remove('not-exists', 'emp-1'))
                .rejects.toThrow(NotFoundException);
        });
    });
});
