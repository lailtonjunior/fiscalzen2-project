import { create } from 'zustand'
import type { DashboardStats } from '@/types'
import { dashboardService, type DashboardTimelineItem, type DashboardIntegrity } from '@/services/dashboard.service'
import api from '@/services/api' // We might need direct api access for stats if not in service

// Helper to fetch stats since it wasn't in original dashboardService
const fetchDashboardStats = async () => {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data;
}

interface DashboardState {
    stats: DashboardStats | null
    minicharts: {
        notasPorMes: any
        valorPorMes: any
        statusManifestacao: any
    }
    timeline: DashboardTimelineItem[]
    integrity: DashboardIntegrity | null
    periodo: '7d' | '30d' | '90d' | '1y'
    isLoading: boolean
    error: string | null
    setPeriodo: (periodo: '7d' | '30d' | '90d' | '1y') => void
    refreshStats: () => Promise<void>
}

// Initial empty stats
const initialStats: DashboardStats = {
    totalNotas: 0,
    totalNotasMes: 0,
    notasPendentesManifestacao: 0,
    notasManifestadas: 0,
    valorTotalNotas: 0,
    valorTotalMes: 0,
    fornecedoresAtivos: 0,
    downloadsRealizados: 0
}

export const useDashboardStore = create<DashboardState>((set) => ({
    stats: initialStats,
    minicharts: {
        notasPorMes: {
            labels: [],
            datasets: [
                { label: 'NFe', data: [], color: '#3b82f6' },
                { label: 'CTe', data: [], color: '#8b5cf6' }
            ]
        },
        valorPorMes: {
            labels: [],
            datasets: [
                { label: 'Valor', data: [], color: '#22c55e' }
            ]
        },
        statusManifestacao: {
            labels: [],
            datasets: [
                { label: 'Qtd', data: [], color: '#3b82f6' }
            ]
        }
    },
    timeline: [],
    integrity: null,
    periodo: '30d',
    isLoading: false,
    error: null,
    setPeriodo: (periodo) => set({ periodo }),
    refreshStats: async () => {
        set({ isLoading: true, error: null })
        try {
            const [timeline, integrity, stats] = await Promise.all([
                dashboardService.getTimeline(),
                dashboardService.getIntegrity(),
                fetchDashboardStats()
            ])

            set({
                timeline,
                integrity,
                stats,
                // Keep mock charts for now as backend doesn't support them yet
                minicharts: {
                    notasPorMes: {
                        labels: ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                        datasets: [
                            { label: 'NFe', data: [0, 0, 0, 0, 0, 0], color: '#3b82f6' },
                            { label: 'CTe', data: [0, 0, 0, 0, 0, 0], color: '#8b5cf6' }
                        ]
                    },
                    valorPorMes: {
                        labels: ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
                        datasets: [{ label: 'Valor', data: [0, 0, 0, 0, 0, 0], color: '#22c55e' }]
                    },
                    statusManifestacao: {
                        labels: ['Confirmada', 'Pendente'],
                        datasets: [{ label: 'Qtd', data: [stats.notasManifestadas, stats.notasPendentesManifestacao], color: '#3b82f6' }]
                    }
                },
                isLoading: false
            })
        } catch (error: any) {
            if (error.response?.status === 401) {
                set({ isLoading: false, error: 'Sessão expirada' })
                return
            }
            set({
                error: 'Falha ao carregar dados do dashboard',
                isLoading: false
            })
            console.error('Dashboard Error:', error)
        }
    }
}))
