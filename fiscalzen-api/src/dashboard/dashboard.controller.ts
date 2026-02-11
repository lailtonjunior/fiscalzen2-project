import { Controller, Get, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('timeline')
    @ApiOperation({ summary: 'Obter linha do tempo de eventos' })
    @ApiResponse({ status: 200, description: 'Lista de eventos recentes.' })
    async getTimeline(@Request() req: any) {
        return this.dashboardService.getTimeline(req.user.empresaId);
    }

    @Get('integrity')
    @ApiOperation({ summary: 'Verificar integridade do sistema' })
    @ApiResponse({ status: 200, description: 'Status de saúde dos serviços.' })
    async getIntegrity(@Request() req: any) {
        return this.dashboardService.getIntegrity(req.user.empresaId);
    }
}
