import { create } from 'zustand'
import type { Tag } from '@/types'
import { tagsService } from '@/services/tags.service'
import { toast } from 'sonner'

interface TagsState {
    tags: Tag[]
    loading: boolean
    fetchTags: () => Promise<void>
    addTag: (tag: Omit<Tag, 'id' | 'createdAt'>) => Promise<void>
    updateTag: (id: string, updates: Partial<Tag>) => Promise<void>
    removeTag: (id: string) => Promise<void>
}

export const useTagsStore = create<TagsState>((set) => ({
    tags: [],
    loading: false,

    fetchTags: async () => {
        set({ loading: true })
        try {
            const response = await tagsService.getAll()
            set({ tags: response.data, loading: false })
        } catch (error) {
            toast.error('Erro ao carregar tags')
            set({ loading: false })
        }
    },

    addTag: async (tagData) => {
        try {
            const response = await tagsService.create(tagData)
            set((state) => ({ tags: [response.data, ...state.tags] }))
            toast.success('Tag criada com sucesso')
        } catch (error) {
            toast.error('Erro ao criar tag')
        }
    },

    updateTag: async (id, updates) => {
        try {
            const response = await tagsService.update(id, updates)
            set((state) => ({
                tags: state.tags.map(t => t.id === id ? response.data : t)
            }))
            toast.success('Tag atualizada')
        } catch (error) {
            toast.error('Erro ao atualizar tag')
        }
    },

    removeTag: async (id) => {
        try {
            await tagsService.delete(id)
            set((state) => ({
                tags: state.tags.filter(t => t.id !== id)
            }))
            toast.success('Tag removida')
        } catch (error) {
            toast.error('Erro ao remover tag')
        }
    }
}))
