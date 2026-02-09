import { IsString, IsOptional, IsEnum, Length, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCompanyDto {
    @ApiPropertyOptional({ description: 'Razão Social da empresa' })
    @IsOptional()
    @IsString()
    razaoSocial?: string;

    @ApiPropertyOptional({ description: 'Nome Fantasia' })
    @IsOptional()
    @IsString()
    nomeFantasia?: string;

    @ApiPropertyOptional({ description: 'Inscrição Estadual' })
    @IsOptional()
    @IsString()
    inscricaoEstadual?: string;

    @ApiPropertyOptional({ description: 'Logradouro' })
    @IsOptional()
    @IsString()
    logradouro?: string;

    @ApiPropertyOptional({ description: 'Número' })
    @IsOptional()
    @IsString()
    numero?: string;

    @ApiPropertyOptional({ description: 'Complemento' })
    @IsOptional()
    @IsString()
    complemento?: string;

    @ApiPropertyOptional({ description: 'Bairro' })
    @IsOptional()
    @IsString()
    bairro?: string;

    @ApiPropertyOptional({ description: 'Cidade' })
    @IsOptional()
    @IsString()
    cidade?: string;

    @ApiPropertyOptional({ description: 'Estado (UF)' })
    @IsOptional()
    @IsString()
    @Length(2, 2)
    estado?: string;

    @ApiPropertyOptional({ description: 'CEP' })
    @IsOptional()
    @IsString()
    @Matches(/^\d{5}-?\d{3}$/, { message: 'CEP inválido' })
    cep?: string;

    @ApiPropertyOptional({ description: 'Ambiente SEFAZ', enum: ['producao', 'homologacao'] })
    @IsOptional()
    @IsEnum(['producao', 'homologacao'])
    ambienteSefaz?: 'producao' | 'homologacao';
}

export class CompanyResponseDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    cnpj: string;

    @ApiProperty()
    razaoSocial: string;

    @ApiPropertyOptional()
    nomeFantasia?: string;

    @ApiPropertyOptional()
    inscricaoEstadual?: string;

    @ApiPropertyOptional()
    logradouro?: string;

    @ApiPropertyOptional()
    numero?: string;

    @ApiPropertyOptional()
    complemento?: string;

    @ApiPropertyOptional()
    bairro?: string;

    @ApiPropertyOptional()
    cidade?: string;

    @ApiPropertyOptional()
    estado?: string;

    @ApiPropertyOptional()
    cep?: string;

    @ApiProperty()
    ambienteSefaz: string;

    @ApiProperty()
    ativo: boolean;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    // Certificate metadata (optional)
    @ApiPropertyOptional()
    certificateExpiry?: Date;

    @ApiPropertyOptional()
    certificateIssuer?: string;
}
