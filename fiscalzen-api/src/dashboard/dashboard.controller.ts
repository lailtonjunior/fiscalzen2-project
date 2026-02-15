import { Controller, Get, UseGuards, Request } from '@nestjs/common';

import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
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
    async getIntegrity() {
        return this.dashboardService.getIntegrity();
    }

    @Get('stats')
    @ApiOperation({ summary: 'Obter estatísticas do dashboard' })
    @ApiResponse({ status: 200, description: 'Estatísticas para gráficos e cards.' })
    async getStats(@Request() req: any) {
        return this.dashboardService.getStats(req.user.empresaId);
    }

}
