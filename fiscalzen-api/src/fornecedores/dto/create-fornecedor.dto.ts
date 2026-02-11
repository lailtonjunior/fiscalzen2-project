import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { IsCnpj } from '../../common/validators/cnpj.validator';

export class CreateFornecedorDto {
    @IsString()
    @IsNotEmpty()
    @IsCnpj()
    cnpj: string;

    @IsString()
    @IsNotEmpty()
    razaoSocial: string;

    @IsString()
    @IsOptional()
    nomeFantasia?: string;

    @IsString()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    telefone?: string;

    @IsString()
    @IsOptional()
    observacoes?: string;
}
