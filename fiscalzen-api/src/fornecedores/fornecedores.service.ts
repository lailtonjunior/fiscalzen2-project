import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFornecedorDto, UpdateFornecedorDto, FiltroFornecedoresDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class FornecedoresService {
    private readonly logger = new Logger(FornecedoresService.name);

    constructor(private readonly prisma: PrismaService) { }

    async findAll(filters: FiltroFornecedoresDto, empresaId: string) {
        const { cursor, take = 20, cnpj, nome, ativo } = filters;

        const where: Prisma.FornecedorWhereInput = { empresaId };

        if (cnpj) where.cnpj = { contains: cnpj };
        if (nome) {
            where.OR = [
                { razaoSocial: { contains: nome, mode: 'insensitive' } },
                { nomeFantasia: { contains: nome, mode: 'insensitive' } },
            ];
        }
        if (ativo !== undefined) where.ativo = ativo;

        const items = await this.prisma.fornecedor.findMany({
            where,
            take: take + 1,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
            orderBy: { razaoSocial: 'asc' },
        });

        const hasMore = items.length > take;
        const data = hasMore ? items.slice(0, take) : items;

        return {
            data,
            meta: {
                total: await this.prisma.fornecedor.count({ where }),
                hasMore,
                nextCursor: hasMore ? data[data.length - 1].id : null,
            },
        };
    }

    async findOne(id: string, empresaId: string) {
        const fornecedor = await this.prisma.fornecedor.findFirst({
            where: { id, empresaId },
        });

        if (!fornecedor) {
            throw new NotFoundException('Fornecedor não encontrado');
        }

        const notas = await this.prisma.notaFiscal.findMany({
            where: { emitenteCnpj: fornecedor.cnpj, empresaId },
            orderBy: { dataEmissao: 'desc' },
            take: 10,
        });

        const stats = await this.prisma.notaFiscal.aggregate({
            where: { emitenteCnpj: fornecedor.cnpj, empresaId },
            _count: true,
            _sum: { valorTotal: true },
        });

        return {
            ...fornecedor,
            notas,
            stats: {
                totalNotas: stats._count,
                valorTotal: stats._sum.valorTotal,
            },
        };
    }

    async create(dto: CreateFornecedorDto, empresaId: string) {
        return this.prisma.fornecedor.create({
            data: { ...dto, empresaId },
        });
    }

    async syncFromNotas(empresaId: string) {
        const emitentes = await this.prisma.notaFiscal.findMany({
            where: { empresaId },
            distinct: ['emitenteCnpj'],
            select: { emitenteCnpj: true, emitenteNome: true },
        });

        let created = 0;
        let skipped = 0;

        for (const emitente of emitentes) {
            try {
                await this.prisma.fornecedor.upsert({
                    where: {
                        empresaId_cnpj: {
                            empresaId,
                            cnpj: emitente.emitenteCnpj,
                        },
                    },
                    create: {
                        cnpj: emitente.emitenteCnpj,
                        razaoSocial: emitente.emitenteNome,
                        empresaId,
                    },
                    update: {},
                });
                created++;
            } catch (error) {
                skipped++;
                this.logger.warn(`Skipped emitente ${emitente.emitenteCnpj}: ${error.message}`);
            }
        }

        return {
            message: `Sincronização concluída: ${created} fornecedores processados, ${skipped} ignorados`,
            total: emitentes.length,
            created,
            skipped,
        };
    }

    async update(id: string, dto: UpdateFornecedorDto, empresaId: string) {
        await this.ensureExists(id, empresaId);
        return this.prisma.fornecedor.update({
            where: { id },
            data: dto,
        });
    }

    async softDelete(id: string, empresaId: string) {
        await this.ensureExists(id, empresaId);
        return this.prisma.fornecedor.update({
            where: { id },
            data: { ativo: false },
        });
    }

    private async ensureExists(id: string, empresaId: string) {
        const fornecedor = await this.prisma.fornecedor.findFirst({
            where: { id, empresaId },
        });
        if (!fornecedor) {
            throw new NotFoundException('Fornecedor não encontrado');
        }
        return fornecedor;
    }
}
