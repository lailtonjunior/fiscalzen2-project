import { create } from 'zustand'
import type { DashboardStats } from '@/types'
import { dashboardService, type DashboardTimelineItem, type DashboardIntegrity } from '@/services/dashboard.service'

const emptyStats: DashboardStats = {
    totalNotas: 0,
    totalNotasMes: 0,
    notasPendentesManifestacao: 0,
    notasManifestadas: 0,
    valorTotalNotas: 0,
    valorTotalMes: 0,
    fornecedoresAtivos: 0,
    downloadsRealizados: 0,
}

interface DashboardState {
    stats: DashboardStats
    timeline: DashboardTimelineItem[]
    integrity: DashboardIntegrity | null
    periodo: '7d' | '30d' | '90d' | '1y'
    isLoading: boolean
    error: string | null
    setPeriodo: (periodo: '7d' | '30d' | '90d' | '1y') => void
    refreshStats: () => Promise<void>
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
    stats: emptyStats,
    timeline: [],
    integrity: null,
    periodo: '30d',
    isLoading: false,
    error: null,
    setPeriodo: (periodo) => {
        set({ periodo })
        get().refreshStats()
    },
    refreshStats: async () => {
        set({ isLoading: true, error: null })
        try {
            const periodo = get().periodo
            const [stats, timeline, integrity] = await Promise.all([
                dashboardService.getStats(periodo),
                dashboardService.getTimeline(),
                dashboardService.getIntegrity(),
            ])
            set({ stats, timeline, integrity, isLoading: false })
        } catch (error: any) {
            set({
                error: 'Falha ao carregar dados do dashboard',
                isLoading: false,
            })
            console.error('Dashboard Error:', error)
        }
    },
}))
