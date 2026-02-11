import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from './audit.service';

const ROUTE_ENTITY_MAP: Record<string, string> = {
    'notas-fiscais': 'NotaFiscal',
    'fornecedores': 'Fornecedor',
    'notificacoes': 'Notificacao',
    'tags': 'Tag',
    'users': 'Usuario',
    'companies': 'Empresa',
    'auth': 'Auth',
};

const METHOD_ACTION_MAP: Record<string, string> = {
    POST: 'CREATE',
    PATCH: 'UPDATE',
    PUT: 'UPDATE',
    DELETE: 'DELETE',
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
    private readonly logger = new Logger(AuditInterceptor.name);

    constructor(private readonly auditService: AuditService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const method = request.method;

        if (!METHOD_ACTION_MAP[method]) {
            return next.handle();
        }

        const user = request.user;
        if (!user?.empresaId) {
            return next.handle();
        }

        const path = request.route?.path || request.url;
        const segments = path.replace(/^\/api\/v1\//, '').split('/').filter(Boolean);
        const resource = segments[0] || 'unknown';
        const entidade = ROUTE_ENTITY_MAP[resource] || resource;

        const paramId = request.params?.id;
        let acao = METHOD_ACTION_MAP[method];

        if (path.includes('/manifestar')) acao = 'MANIFESTAR';
        if (path.includes('/importar')) acao = 'IMPORT_XML';
        if (path.includes('/sync')) acao = 'SYNC';
        if (path.includes('/login')) acao = 'LOGIN';

        return next.handle().pipe(
            tap({
                next: () => {
                    this.auditService.log({
                        acao,
                        entidade,
                        entidadeId: paramId,
                        dados: method === 'DELETE' ? undefined : { body: this.sanitize(request.body) },
                        usuarioId: user.sub,
                        empresaId: user.empresaId,
                        ipOrigem: request.ip || request.headers['x-forwarded-for'],
                        userAgent: request.headers['user-agent'],
                    });
                },
                error: () => {
                    // Don't log failed requests
                },
            }),
        );
    }

    private sanitize(body: any): any {
        if (!body) return undefined;
        const sanitized = { ...body };
        delete sanitized.senha;
        delete sanitized.password;
        delete sanitized.senhaHash;
        delete sanitized.token;
        return sanitized;
    }
}
