import { api } from './api'

export interface Notificacao {
    id: string
    tipo: string
    titulo: string
    mensagem: string
    lida: boolean
    dadosExtra?: Record<string, any>
    usuarioId?: string
    empresaId: string
    createdAt: string
}

export interface NotificacoesFilters {
    cursor?: string
    take?: number
    lida?: boolean
    tipo?: string
}

interface PaginatedResponse<T> {
    data: T[]
    meta: { total: number; hasMore: boolean; nextCursor: string | null }
}

export const notificacoesService = {
    getAll: async (filters?: NotificacoesFilters): Promise<PaginatedResponse<Notificacao>> => {
        return api.get<any, PaginatedResponse<Notificacao>>('/notificacoes', { params: filters })
    },

    getUnreadCount: async (): Promise<{ count: number }> => {
        return api.get<any, { count: number }>('/notificacoes/count')
    },

    markAsRead: async (id: string): Promise<Notificacao> => {
        return api.patch<any, Notificacao>(`/notificacoes/${id}/ler`)
    },

    markAllAsRead: async (): Promise<{ updated: number }> => {
        return api.patch<any, { updated: number }>('/notificacoes/ler-todas')
    },

    remove: async (id: string): Promise<Notificacao> => {
        return api.delete<any, Notificacao>(`/notificacoes/${id}`)
    },
}
