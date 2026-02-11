import { api } from './api'
import type { NotaFiscal } from '@/types'

export interface NotasFiscaisFilters {
    cursor?: string
    take?: number
    tipo?: string
    statusSefaz?: string
    statusManifestacao?: string
    emitenteCnpj?: string
    emitenteNome?: string
    periodoInicio?: string
    periodoFim?: string
    tags?: string[]
}

export interface PaginatedResponse<T> {
    data: T[]
    meta: {
        total: number
        hasMore: boolean
        nextCursor: string | null
    }
}

export interface ManifestarDto {
    tipo: 'ciencia' | 'confirmacao' | 'desconhecimento' | 'nao_realizada'
    justificativa?: string
}

export const notasFiscaisService = {
    getNotas: async (filters: NotasFiscaisFilters = {}): Promise<PaginatedResponse<NotaFiscal>> => {
        const params = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== '' && value !== null) {
                if (Array.isArray(value)) {
                    value.forEach(v => params.append(key, v))
                } else {
                    params.set(key, String(value))
                }
            }
        })
        return api.get<any, PaginatedResponse<NotaFiscal>>(`/notas-fiscais?${params.toString()}`)
    },

    getNota: async (id: string): Promise<NotaFiscal> => {
        return api.get<any, NotaFiscal>(`/notas-fiscais/${id}`)
    },

    downloadXml: async (id: string): Promise<Blob> => {
        const response = await api.get(`/notas-fiscais/${id}/xml`, {
            responseType: 'blob',
        })
        return response as unknown as Blob
    },

    importXml: async (
        file: File,
        onProgress?: (percent: number) => void,
    ): Promise<NotaFiscal> => {
        const formData = new FormData()
        formData.append('file', file)
        return api.post<any, NotaFiscal>('/notas-fiscais/importar', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (event) => {
                if (event.total && onProgress) {
                    onProgress(Math.round((event.loaded * 100) / event.total))
                }
            },
        })
    },

    importLote: async (
        files: File[],
        onProgress?: (percent: number) => void,
    ): Promise<{ message: string; jobIds: string[] }> => {
        const formData = new FormData()
        files.forEach(f => formData.append('files', f))
        return api.post<any, { message: string; jobIds: string[] }>('/notas-fiscais/importar-lote', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (event) => {
                if (event.total && onProgress) {
                    onProgress(Math.round((event.loaded * 100) / event.total))
                }
            },
        })
    },

    softDelete: async (id: string): Promise<NotaFiscal> => {
        return api.delete<any, NotaFiscal>(`/notas-fiscais/${id}`)
    },

    // --- Manifestação ---
    manifestar: async (id: string, dto: ManifestarDto) => {
        return api.post(`/notas-fiscais/${id}/manifestar`, dto)
    },

    getManifestacoes: async (id: string) => {
        return api.get(`/notas-fiscais/${id}/manifestacoes`)
    },

    // --- Tags M2M ---
    assignTags: async (id: string, tagIds: string[]): Promise<NotaFiscal> => {
        return api.post<any, NotaFiscal>(`/notas-fiscais/${id}/tags`, { tagIds })
    },

    removeTag: async (id: string, tagId: string): Promise<NotaFiscal> => {
        return api.delete<any, NotaFiscal>(`/notas-fiscais/${id}/tags/${tagId}`)
    },
}
