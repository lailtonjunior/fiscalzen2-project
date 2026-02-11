import {
    Controller,
    Get,
    Patch,
    Delete,
    Param,
    Query,
    Request,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { NotificacoesService } from './notificacoes.service';
import { FiltroNotificacoesDto } from './dto';

interface AuthenticatedRequest extends Request {
    user: { sub: string; email: string; empresaId: string };
}

@Controller('notificacoes')
export class NotificacoesController {
    constructor(private readonly service: NotificacoesService) { }

    @Get()
    async findAll(
        @Request() req: AuthenticatedRequest,
        @Query() filters: FiltroNotificacoesDto,
    ) {
        return this.service.findAll(filters, req.user.empresaId);
    }

    @Get('count')
    async getUnreadCount(@Request() req: AuthenticatedRequest) {
        return this.service.getUnreadCount(req.user.empresaId, req.user.sub);
    }

    @Patch(':id/ler')
    async markAsRead(
        @Request() req: AuthenticatedRequest,
        @Param('id') id: string,
    ) {
        return this.service.markAsRead(id, req.user.empresaId);
    }

    @Patch('ler-todas')
    @HttpCode(HttpStatus.OK)
    async markAllAsRead(@Request() req: AuthenticatedRequest) {
        return this.service.markAllAsRead(req.user.empresaId, req.user.sub);
    }

    @Delete(':id')
    async remove(
        @Request() req: AuthenticatedRequest,
        @Param('id') id: string,
    ) {
        return this.service.remove(id, req.user.empresaId);
    }
}
