import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
    @ApiProperty({ example: 'João Silva', description: 'Nome completo do usuário' })
    @IsString()
    @IsNotEmpty({ message: 'O nome é obrigatório.' })
    name: string;

    @ApiProperty({ example: 'joao@empresa.com', description: 'Email do usuário' })
    @IsEmail({}, { message: 'Por favor, forneça um email válido.' })
    @IsNotEmpty({ message: 'O email é obrigatório.' })
    email: string;

    @ApiProperty({ example: 'senha123', description: 'Senha (min. 6 caracteres)' })
    @IsString()
    @IsNotEmpty({ message: 'A senha é obrigatória.' })
    @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres.' })
    password: string;

    @ApiProperty({ example: 'Minha Empresa Ltda', description: 'Nome da empresa (opcional)', required: false })
    @IsString()
    @IsOptional()
    companyName?: string;

    @ApiProperty({ example: '12345678000199', description: 'CNPJ da empresa (opcional)', required: false })
    @IsString()
    @IsOptional()
    cnpj?: string;
}
