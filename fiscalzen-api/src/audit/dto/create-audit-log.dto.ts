import { IsString, IsOptional } from 'class-validator';

export class CreateAuditLogDto {
    @IsString()
    acao: string;

    @IsString()
    entidade: string;

    @IsString()
    @IsOptional()
    entidadeId?: string;

    @IsOptional()
    dados?: Record<string, any>;

    @IsString()
    @IsOptional()
    usuarioId?: string;

    @IsString()
    empresaId: string;

    @IsString()
    @IsOptional()
    ipOrigem?: string;

    @IsString()
    @IsOptional()
    userAgent?: string;
}
