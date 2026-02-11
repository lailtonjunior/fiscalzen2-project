import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Param,
    Query,
    Body,
    Request,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { FornecedoresService } from './fornecedores.service';
import { CreateFornecedorDto, UpdateFornecedorDto, FiltroFornecedoresDto } from './dto';

interface AuthenticatedRequest extends Request {
    user: { sub: string; email: string; empresaId: string };
}

@Controller('fornecedores')
export class FornecedoresController {
    constructor(private readonly service: FornecedoresService) { }

    @Get()
    async findAll(
        @Request() req: AuthenticatedRequest,
        @Query() filters: FiltroFornecedoresDto,
    ) {
        return this.service.findAll(filters, req.user.empresaId);
    }

    @Get(':id')
    async findOne(
        @Request() req: AuthenticatedRequest,
        @Param('id') id: string,
    ) {
        return this.service.findOne(id, req.user.empresaId);
    }

    @Post()
    async create(
        @Request() req: AuthenticatedRequest,
        @Body() dto: CreateFornecedorDto,
    ) {
        return this.service.create(dto, req.user.empresaId);
    }

    @Post('sync')
    @HttpCode(HttpStatus.OK)
    async syncFromNotas(@Request() req: AuthenticatedRequest) {
        return this.service.syncFromNotas(req.user.empresaId);
    }

    @Patch(':id')
    async update(
        @Request() req: AuthenticatedRequest,
        @Param('id') id: string,
        @Body() dto: UpdateFornecedorDto,
    ) {
        return this.service.update(id, dto, req.user.empresaId);
    }

    @Delete(':id')
    async softDelete(
        @Request() req: AuthenticatedRequest,
        @Param('id') id: string,
    ) {
        return this.service.softDelete(id, req.user.empresaId);
    }
}
