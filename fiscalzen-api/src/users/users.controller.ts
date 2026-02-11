import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import type { CreateUserDto, UpdateUserDto } from './users.service';

import { RolesGuard, Roles } from '../auth/roles.guard';

interface AuthenticatedRequest {
    user: { sub: string; email: string };
}

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @ApiOperation({ summary: 'List users for current company' })
    async listUsers(@Request() req: AuthenticatedRequest) {
        const currentUser = await this.usersService.findById(req.user.sub);
        if (!currentUser) {
            return [];
        }
        return this.usersService.findByCompany(currentUser.empresaId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get user by ID' })
    async getUser(@Param('id') id: string) {
        return this.usersService.findById(id);
    }

    @Post()
    @ApiOperation({ summary: 'Create new user (invite)' })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['email', 'nome', 'senha'],
            properties: {
                email: { type: 'string' },
                nome: { type: 'string' },
                senha: { type: 'string' },
                cargo: { type: 'string' },
                perfil: { type: 'string', enum: ['admin', 'contador', 'operador'] },
            },
        },
    })
    @Roles('admin')
    async createUser(
        @Request() req: AuthenticatedRequest,
        @Body() dto: Omit<CreateUserDto, 'empresaId'>,
    ) {
        const currentUser = await this.usersService.findById(req.user.sub);
        if (!currentUser) {
            throw new Error('Usuário não encontrado');
        }
        return this.usersService.create({
            ...dto,
            empresaId: currentUser.empresaId,
        });
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update user (name, role, status)' })
    async updateUser(
        @Request() req: AuthenticatedRequest,
        @Param('id') id: string,
        @Body() dto: UpdateUserDto,
    ) {
        return this.usersService.update(id, dto, req.user.sub);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    @ApiOperation({ summary: 'Deactivate user' })
    @Roles('admin')
    async deactivateUser(
        @Request() req: AuthenticatedRequest,
        @Param('id') id: string,
    ) {
        await this.usersService.deactivate(id, req.user.sub);
    }
}
