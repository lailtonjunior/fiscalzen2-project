import { IsOptional, IsString, IsInt, IsDateString, IsArray, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class FiltroNotasDto {
    @IsOptional()
    @IsString()
    cursor?: string;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    take?: number = 20;

    @IsOptional()
    @IsString()
    tipo?: string; // NFe, CTe

    @IsOptional()
    @IsString()
    statusSefaz?: string;

    @IsOptional()
    @IsString()
    statusManifestacao?: string;

    @IsOptional()
    @IsString()
    emitenteCnpj?: string;

    @IsOptional()
    @IsString()
    emitenteNome?: string;

    @IsOptional()
    @IsDateString()
    periodoInicio?: string;

    @IsOptional()
    @IsDateString()
    periodoFim?: string;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
}
