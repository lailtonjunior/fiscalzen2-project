import { Injectable } from '@nestjs/common';

@Injectable()
export class DashboardService {
    async getTimeline() {
        // Mock data for initial frontend integration
        return [
            { id: 1, type: 'NFE_RECEIVED', message: 'Nota Fiscal recebida de Google Brasil', date: new Date().toISOString() },
            { id: 2, type: 'TAX_CALCULATED', message: 'Impostos calculados para o mês atual', date: new Date(Date.now() - 86400000).toISOString() },
            { id: 3, type: 'ALERT', message: 'Inconsistência detectada em NF-e 4590', date: new Date(Date.now() - 172800000).toISOString() },
        ];
    }

    async getIntegrity() {
        // Mock data for integrity check
        return {
            status: 'HEALTHY',
            checks: [
                { name: 'Database', status: 'OK', latency: '2ms' },
                { name: 'Sefaz Connection', status: 'OK', latency: '150ms' },
                { name: 'Certificate', status: 'VALID', expires: '2026-12-31' },
            ],
            lastCheck: new Date().toISOString(),
        };
    }
}
