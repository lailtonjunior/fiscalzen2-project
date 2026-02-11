import { api } from './api';
import type { DashboardStats } from '@/types';

export interface DashboardTimelineItem {
    id: number;
    type: string;
    message: string;
    date: string;
}

export interface DashboardIntegrity {
    status: string;
    checks: { name: string; status: string; latency?: string }[];
    lastCheck: string;
}

export const dashboardService = {
    getStats: async (periodo: string = '30d'): Promise<DashboardStats> => {
        return api.get<any, DashboardStats>(`/dashboard/stats?periodo=${periodo}`);
    },

    getTimeline: async (): Promise<DashboardTimelineItem[]> => {
        return api.get<any, DashboardTimelineItem[]>('/dashboard/timeline');
    },

    getIntegrity: async (): Promise<DashboardIntegrity> => {
        return api.get<any, DashboardIntegrity>('/dashboard/integrity');
    },
};
