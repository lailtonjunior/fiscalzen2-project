import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Usuario } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export interface CreateUserDto {
    email: string;
    nome: string;
    senha: string;
    cargo?: string;
    perfil?: 'admin' | 'contador' | 'operador';
    empresaId: string;
}

export interface UpdateUserDto {
    nome?: string;
    cargo?: string;
    perfil?: 'admin' | 'contador' | 'operador';
    ativo?: boolean;
}

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);

    constructor(private readonly prisma: PrismaService) { }

    async findOne(email: string): Promise<Usuario | null> {
        return this.prisma.usuario.findUnique({
            where: { email },
        });
    }

    async findById(id: string): Promise<Usuario | null> {
        return this.prisma.usuario.findUnique({
            where: { id },
            include: { empresa: true },
        });
    }

    async findByCompany(empresaId: string): Promise<Usuario[]> {
        return this.prisma.usuario.findMany({
            where: { empresaId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async create(data: CreateUserDto): Promise<Usuario> {
        const hashedPassword = await bcrypt.hash(data.senha, 10);

        return this.prisma.usuario.create({
            data: {
                email: data.email,
                nome: data.nome,
                senhaHash: hashedPassword,
                cargo: data.cargo,
                perfil: data.perfil || 'operador',
                empresa: { connect: { id: data.empresaId } },
            },
        });
    }

    /**
     * Create user with raw Prisma input (for registration with nested company creation)
     */
    async createWithPrismaInput(data: Prisma.UsuarioCreateInput): Promise<Usuario> {
        return this.prisma.usuario.create({ data });
    }

    async update(
        id: string,
        data: UpdateUserDto,
        requesterId: string,
    ): Promise<Usuario> {
        const user = await this.prisma.usuario.findUnique({ where: { id } });

        if (!user) {
            throw new NotFoundException('Usuário não encontrado');
        }

        const requester = await this.prisma.usuario.findUnique({
            where: { id: requesterId },
        });

        if (!requester) {
            throw new ForbiddenException('Acesso negado');
        }

        if (requester.perfil !== 'admin' && requesterId !== id) {
            throw new ForbiddenException('Somente administradores podem editar outros usuários');
        }

        if (requester.perfil !== 'admin' && data.perfil === 'admin') {
            throw new ForbiddenException('Somente administradores podem conceder permissões de admin');
        }

        return this.prisma.usuario.update({
            where: { id },
            data,
        });
    }

    async deactivate(id: string, requesterId: string): Promise<Usuario> {
        const requester = await this.prisma.usuario.findUnique({
            where: { id: requesterId },
        });

        if (!requester || requester.perfil !== 'admin') {
            throw new ForbiddenException('Somente administradores podem desativar usuários');
        }

        if (id === requesterId) {
            throw new ForbiddenException('Você não pode desativar sua própria conta');
        }

        return this.prisma.usuario.update({
            where: { id },
            data: { ativo: false },
        });
    }

    async updateLastAccess(id: string): Promise<void> {
        await this.prisma.usuario.update({
            where: { id },
            data: { ultimoAcesso: new Date() },
        });
    }
}
