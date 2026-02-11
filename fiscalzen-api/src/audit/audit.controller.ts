import { Controller, Get, Query, Request } from '@nestjs/common';
import { AuditService } from './audit.service';
import { FiltroAuditDto } from './dto';

interface AuthenticatedRequest extends Request {
    user: { sub: string; email: string; empresaId: string };
}

@Controller('historico')
export class AuditController {
    constructor(private readonly service: AuditService) { }

    @Get()
    async findAll(
        @Request() req: AuthenticatedRequest,
        @Query() filters: FiltroAuditDto,
    ) {
        return this.service.findAll(filters, req.user.empresaId);
    }
}
