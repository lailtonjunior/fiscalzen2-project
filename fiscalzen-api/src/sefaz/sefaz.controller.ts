import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { SefazService } from './sefaz.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

interface AuthenticatedRequest {
    user: { userId: string; email: string; empresaId: string };
}

@ApiTags('sefaz')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sefaz')
export class SefazController {
    constructor(private readonly sefazService: SefazService) { }

    @Get('status')
    async checkStatus(@Query('uf') uf: string, @Request() req: AuthenticatedRequest) {
        return this.sefazService.checkStatus(uf || 'RS', req.user.empresaId);
    }
}
