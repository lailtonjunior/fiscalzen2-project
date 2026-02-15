import { Controller, Get, Post, Body, Param, Delete, Put, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TagsService } from './tags.service';
import { Prisma } from '@prisma/client';

interface AuthenticatedRequest {
    user: {
        empresaId: string;
    }
}

@ApiTags('Tags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tags')
export class TagsController {
    constructor(private readonly tagsService: TagsService) { }

    @Post()
    @ApiOperation({ summary: 'Criar nova tag' })
    create(@Request() req: AuthenticatedRequest, @Body() data: { nome: string; cor?: string }) {
        return this.tagsService.create(req.user.empresaId, data);
    }

    @Get()
    @ApiOperation({ summary: 'Listar tags da empresa' })
    findAll(@Request() req: AuthenticatedRequest) {
        return this.tagsService.findAll(req.user.empresaId);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Atualizar tag' })
    update(@Request() req: AuthenticatedRequest, @Param('id') id: string, @Body() data: { nome?: string; cor?: string }) {
        return this.tagsService.update(req.user.empresaId, id, data);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Remover tag' })
    remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
        return this.tagsService.remove(req.user.empresaId, id);
    }
}
