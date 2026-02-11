import { IsString, IsOptional, MaxLength, Matches } from 'class-validator';

export class CreateTagDto {
    @IsString()
    @MaxLength(50)
    nome: string;

    @IsOptional()
    @IsString()
    @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'Cor deve ser um hex válido (ex: #ff0000)' })
    cor?: string = '#000000';
}

export class UpdateTagDto {
    @IsOptional()
    @IsString()
    @MaxLength(50)
    nome?: string;

    @IsOptional()
    @IsString()
    @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'Cor deve ser um hex válido (ex: #ff0000)' })
    cor?: string;
}
