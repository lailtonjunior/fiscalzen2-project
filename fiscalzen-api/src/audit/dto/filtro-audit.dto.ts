import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FiltroAuditDto {
    @IsOptional()
    @IsString()
    cursor?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    take?: number = 20;

    @IsOptional()
    @IsString()
    acao?: string;

    @IsOptional()
    @IsString()
    entidade?: string;

    @IsOptional()
    @IsString()
    usuarioId?: string;

    @IsOptional()
    @IsString()
    periodoInicio?: string;

    @IsOptional()
    @IsString()
    periodoFim?: string;
}
