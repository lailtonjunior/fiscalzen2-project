import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ example: 'usuario@empresa.com', description: 'Email do usuário' })
    @IsEmail({}, { message: 'Por favor, forneça um email válido.' })
    @IsNotEmpty({ message: 'O email é obrigatório.' })
    email: string;

    @ApiProperty({ example: '123456', description: 'Senha do usuário (min. 6 caracteres)' })
    @IsString()
    @IsNotEmpty({ message: 'A senha é obrigatória.' })
    @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres.' })
    password: string;
}
