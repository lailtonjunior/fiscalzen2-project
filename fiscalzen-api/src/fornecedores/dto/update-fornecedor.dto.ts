import { PartialType } from '@nestjs/mapped-types';
import { CreateFornecedorDto } from './create-fornecedor.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateFornecedorDto extends PartialType(CreateFornecedorDto) {
    @IsBoolean()
    @IsOptional()
    ativo?: boolean;
}
