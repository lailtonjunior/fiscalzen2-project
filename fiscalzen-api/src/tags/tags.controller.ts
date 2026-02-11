import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Body,
    Request,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import { CreateTagDto, UpdateTagDto } from './dto';

interface AuthenticatedRequest extends Request {
    user: { sub: string; email: string; empresaId: string };
}

@Controller('tags')
export class TagsController {
    constructor(private readonly service: TagsService) { }

    @Get()
    async findAll(@Request() req: AuthenticatedRequest) {
        return this.service.findAll(req.user.empresaId);
    }

    @Post()
    async create(
        @Request() req: AuthenticatedRequest,
        @Body() dto: CreateTagDto,
    ) {
        return this.service.create(req.user.empresaId, dto.nome, dto.cor ?? '#000000');
    }

    @Patch(':id')
    async update(
        @Request() req: AuthenticatedRequest,
        @Param('id') id: string,
        @Body() dto: UpdateTagDto,
    ) {
        return this.service.update(id, req.user.empresaId, dto);
    }

    @Delete(':id')
    async remove(
        @Request() req: AuthenticatedRequest,
        @Param('id') id: string,
    ) {
        return this.service.remove(id, req.user.empresaId);
    }
}
