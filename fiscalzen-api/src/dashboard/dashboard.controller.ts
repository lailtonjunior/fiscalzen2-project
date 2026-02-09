import { Controller, Get, UseGuards } from '@nestjs/common';
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
    async getTimeline() {
        return this.dashboardService.getTimeline();
    }

    @Get('integrity')
    @ApiOperation({ summary: 'Verificar integridade do sistema' })
    @ApiResponse({ status: 200, description: 'Status de saúde dos serviços.' })
    async getIntegrity() {
        return this.dashboardService.getIntegrity();
    }
}
