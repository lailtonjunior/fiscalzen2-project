import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FiltroNotificacoesDto } from './dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class NotificacoesService {
    private readonly logger = new Logger(NotificacoesService.name);

    constructor(private readonly prisma: PrismaService) { }

    async findAll(filters: FiltroNotificacoesDto, empresaId: string) {
        const { cursor, take = 20, lida, tipo } = filters;

        const where: Prisma.NotificacaoWhereInput = { empresaId };
        if (lida !== undefined) where.lida = lida;
        if (tipo) where.tipo = tipo;

        const items = await this.prisma.notificacao.findMany({
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
                total: await this.prisma.notificacao.count({ where }),
                hasMore,
                nextCursor: hasMore ? data[data.length - 1].id : null,
            },
        };
    }

    async getUnreadCount(empresaId: string, usuarioId?: string) {
        const where: Prisma.NotificacaoWhereInput = { empresaId, lida: false };
        if (usuarioId) where.usuarioId = usuarioId;
        return { count: await this.prisma.notificacao.count({ where }) };
    }

    async markAsRead(id: string, empresaId: string) {
        const notif = await this.prisma.notificacao.findFirst({
            where: { id, empresaId },
        });
        if (!notif) throw new NotFoundException('Notificação não encontrada');

        return this.prisma.notificacao.update({
            where: { id },
            data: { lida: true },
        });
    }

    async markAllAsRead(empresaId: string, usuarioId?: string) {
        const where: Prisma.NotificacaoWhereInput = { empresaId, lida: false };
        if (usuarioId) where.usuarioId = usuarioId;

        const result = await this.prisma.notificacao.updateMany({
            where,
            data: { lida: true },
        });

        return { updated: result.count };
    }

    async create(data: {
        tipo: string;
        titulo: string;
        mensagem: string;
        empresaId: string;
        usuarioId?: string;
        dadosExtra?: any;
    }) {
        return this.prisma.notificacao.create({ data });
    }

    async remove(id: string, empresaId: string) {
        const notif = await this.prisma.notificacao.findFirst({
            where: { id, empresaId },
        });
        if (!notif) throw new NotFoundException('Notificação não encontrada');

        return this.prisma.notificacao.delete({ where: { id } });
    }
}
