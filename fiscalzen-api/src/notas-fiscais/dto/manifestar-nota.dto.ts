import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum TipoManifestacao {
    CIENCIA = 'ciencia',
    CONFIRMACAO = 'confirmacao',
    DESCONHECIMENTO = 'desconhecimento',
    NAO_REALIZADA = 'nao_realizada',
}

export class ManifestarNotaDto {
    @IsEnum(TipoManifestacao)
    tipo: TipoManifestacao;

    @IsOptional()
    @IsString()
    @MaxLength(500)
    justificativa?: string;
}
