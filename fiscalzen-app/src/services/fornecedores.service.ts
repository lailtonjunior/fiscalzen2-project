import { api } from './api'

export interface Fornecedor {
    id: string
    cnpj: string
    razaoSocial: string
    nomeFantasia?: string
    email?: string
    telefone?: string
    observacoes?: string
    ativo: boolean
    createdAt: string
    updatedAt: string
}

export interface FornecedorDetail extends Fornecedor {
    notas: any[]
    stats: { totalNotas: number; valorTotal: number }
}

export interface FornecedoresFilters {
    cursor?: string
    take?: number
    cnpj?: string
    nome?: string
    ativo?: boolean
}

export interface CreateFornecedorDto {
    cnpj: string
    razaoSocial: string
    nomeFantasia?: string
    email?: string
    telefone?: string
    observacoes?: string
}

export interface UpdateFornecedorDto extends Partial<CreateFornecedorDto> {
    ativo?: boolean
}

interface PaginatedResponse<T> {
    data: T[]
    meta: { total: number; hasMore: boolean; nextCursor: string | null }
}

export const fornecedoresService = {
    getAll: async (filters?: FornecedoresFilters): Promise<PaginatedResponse<Fornecedor>> => {
        return api.get<any, PaginatedResponse<Fornecedor>>('/fornecedores', { params: filters })
    },

    getOne: async (id: string): Promise<FornecedorDetail> => {
        return api.get<any, FornecedorDetail>(`/fornecedores/${id}`)
    },

    create: async (dto: CreateFornecedorDto): Promise<Fornecedor> => {
        return api.post<any, Fornecedor>('/fornecedores', dto)
    },

    update: async (id: string, dto: UpdateFornecedorDto): Promise<Fornecedor> => {
        return api.patch<any, Fornecedor>(`/fornecedores/${id}`, dto)
    },

    remove: async (id: string): Promise<Fornecedor> => {
        return api.delete<any, Fornecedor>(`/fornecedores/${id}`)
    },

    sync: async (): Promise<{ message: string; total: number; created: number; skipped: number }> => {
        return api.post<any, any>('/fornecedores/sync')
    },
}
