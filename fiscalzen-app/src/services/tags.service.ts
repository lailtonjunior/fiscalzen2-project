import { api } from './api'
import type { Tag } from '@/types'

export interface CreateTagDto {
    nome: string
    cor?: string
}

export interface UpdateTagDto {
    nome?: string
    cor?: string
}

export interface TagWithCount extends Tag {
    _count?: { notasFiscais: number }
}

export const tagsService = {
    getTags: async (): Promise<TagWithCount[]> => {
        return api.get<any, TagWithCount[]>('/tags')
    },

    createTag: async (dto: CreateTagDto): Promise<Tag> => {
        return api.post<any, Tag>('/tags', dto)
    },

    updateTag: async (id: string, dto: UpdateTagDto): Promise<Tag> => {
        return api.patch<any, Tag>(`/tags/${id}`, dto)
    },

    deleteTag: async (id: string): Promise<Tag> => {
        return api.delete<any, Tag>(`/tags/${id}`)
    },
}
