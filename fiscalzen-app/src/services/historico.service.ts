import { api } from './api'

export interface AuditLog {
    id: string
    acao: string
    entidade: string
    entidadeId?: string
    dados?: Record<string, any>
    usuarioId?: string
    empresaId: string
    ipOrigem?: string
    userAgent?: string
    createdAt: string
}

export interface HistoricoFilters {
    cursor?: string
    take?: number
    acao?: string
    entidade?: string
    usuarioId?: string
    periodoInicio?: string
    periodoFim?: string
}

interface PaginatedResponse<T> {
    data: T[]
    meta: { total: number; hasMore: boolean; nextCursor: string | null }
}

export const historicoService = {
    getAll: async (filters?: HistoricoFilters): Promise<PaginatedResponse<AuditLog>> => {
        return api.get<any, PaginatedResponse<AuditLog>>('/historico', { params: filters })
    },
}
