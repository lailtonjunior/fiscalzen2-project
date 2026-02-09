import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';

export const ROLES_KEY = 'roles';

export const Roles = (...roles: string[]) => {
    return (target: any, key?: string | symbol, descriptor?: PropertyDescriptor) => {
        Reflect.defineMetadata(ROLES_KEY, roles, descriptor?.value || target);
    };
};

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly prisma: PrismaService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(
            ROLES_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const userId = request.user?.sub;

        if (!userId) {
            throw new ForbiddenException('Usuário não autenticado');
        }

        const user = await this.prisma.usuario.findUnique({
            where: { id: userId },
        });

        if (!user || !user.ativo) {
            throw new ForbiddenException('Usuário não encontrado ou inativo');
        }

        if (!requiredRoles.includes(user.perfil)) {
            throw new ForbiddenException(
                `Acesso negado. Requer uma das permissões: ${requiredRoles.join(', ')}`,
            );
        }

        return true;
    }
}
