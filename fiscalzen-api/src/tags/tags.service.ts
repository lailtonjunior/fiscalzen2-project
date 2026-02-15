import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TagsService {
    constructor(private prisma: PrismaService) { }

    async create(empresaId: string, data: { nome: string; cor?: string }) {
        return this.prisma.tag.create({
            data: {
                ...data,
                empresaId,
            },
        });
    }

    async findAll(empresaId: string) {
        return this.prisma.tag.findMany({
            where: { empresaId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async update(empresaId: string, id: string, data: { nome?: string; cor?: string }) {
        // Verify ownership
        const tag = await this.prisma.tag.findFirst({ where: { id, empresaId } });
        if (!tag) {
            throw new NotFoundException('Tag não encontrada');
        }

        return this.prisma.tag.update({
            where: { id },
            data,
        });
    }

    async remove(empresaId: string, id: string) {
        // Verify ownership
        const tag = await this.prisma.tag.findFirst({ where: { id, empresaId } });
        if (!tag) {
            throw new NotFoundException('Tag não encontrada');
        }

        return this.prisma.tag.delete({
            where: { id },
        });
    }
}
