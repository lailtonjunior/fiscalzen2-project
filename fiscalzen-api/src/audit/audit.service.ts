import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuditLogDto, FiltroAuditDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuditService {
    private readonly logger = new Logger(AuditService.name);

    constructor(private readonly prisma: PrismaService) { }

    async log(dto: CreateAuditLogDto) {
        try {
            await this.prisma.auditLog.create({ data: dto });
        } catch (error) {
            this.logger.error(`Failed to create audit log: ${error.message}`, error.stack);
        }
    }

    async findAll(filters: FiltroAuditDto, empresaId: string) {
        const { cursor, take = 20, acao, entidade, usuarioId, periodoInicio, periodoFim } = filters;

        const where: Prisma.AuditLogWhereInput = { empresaId };
        if (acao) where.acao = acao;
        if (entidade) where.entidade = entidade;
        if (usuarioId) where.usuarioId = usuarioId;
        if (periodoInicio || periodoFim) {
            where.createdAt = {};
            if (periodoInicio) where.createdAt.gte = new Date(periodoInicio);
            if (periodoFim) where.createdAt.lte = new Date(periodoFim);
        }

        const items = await this.prisma.auditLog.findMany({
            where,
            take: take + 1,
            ...(cursor && { cursor: { id: cursor }, skip: 1 }),
            orderBy: { createdAt: 'desc' },
        });

        const hasMore = items.length > take;
        const data = hasMore ? items.slice(0, take) : items;

        return {
            data,
            meta: {
                total: await this.prisma.auditLog.count({ where }),
                hasMore,
                nextCursor: hasMore ? data[data.length - 1].id : null,
            },
        };
    }
}
