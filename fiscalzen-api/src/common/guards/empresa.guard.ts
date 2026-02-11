import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../auth/public.decorator';

@Injectable()
export class EmpresaGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) return true;

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user?.empresaId) {
            throw new ForbiddenException(
                'Token JWT não contém empresa associada. Faça login novamente.',
            );
        }

        request.empresaId = user.empresaId;
        return true;
    }
}
