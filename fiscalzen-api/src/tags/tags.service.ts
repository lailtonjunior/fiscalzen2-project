import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TagsService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(empresaId: string) {
        return this.prisma.tag.findMany({
            where: { empresaId },
            orderBy: { nome: 'asc' },
            include: {
                _count: { select: { notasFiscais: true } },
            },
        });
    }

    async create(empresaId: string, nome: string, cor: string) {
        try {
            return await this.prisma.tag.create({
                data: { nome, cor, empresaId },
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException(`Tag "${nome}" já existe nesta empresa`);
            }
            throw error;
        }
    }

    async update(id: string, empresaId: string, data: { nome?: string; cor?: string }) {
        const tag = await this.prisma.tag.findFirst({
            where: { id, empresaId },
        });

        if (!tag) {
            throw new NotFoundException('Tag não encontrada');
        }

        try {
            return await this.prisma.tag.update({
                where: { id },
                data,
            });
        } catch (error) {
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                throw new ConflictException(`Tag "${data.nome}" já existe nesta empresa`);
            }
            throw error;
        }
    }

    async remove(id: string, empresaId: string) {
        const tag = await this.prisma.tag.findFirst({
            where: { id, empresaId },
        });

        if (!tag) {
            throw new NotFoundException('Tag não encontrada');
        }

        return this.prisma.tag.delete({ where: { id } });
    }
}
