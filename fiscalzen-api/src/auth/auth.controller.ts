import { Controller, Post, Body, UseGuards, Get, Request, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Public()
    @Throttle({ short: { ttl: 60000, limit: 5 } })
    @ApiOperation({ summary: 'Login de usuário', description: 'Retorna token JWT para acesso.' })
    @ApiResponse({ status: 200, description: 'Login realizado com sucesso.' })
    @ApiResponse({ status: 401, description: 'Credenciais inválidas.' })
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Credenciais inválidas');
        }
        return this.authService.login(user); // authService.login expects user object, not dto
    }

    @Public()
    @ApiOperation({ summary: 'Registro de novo usuário', description: 'Cria usuário e empresa associada.' })
    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @ApiBearerAuth()
    @ApiOperation({ summary: 'Perfil do usuário', description: 'Retorna dados do usuário autenticado.' })
    @Get('profile')
    async getProfile(@Request() req: any) {
        return this.authService.getProfile(req.user.userId);
    }
}
