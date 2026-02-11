import { create } from 'zustand'
import { tagsService, type TagWithCount } from '@/services/tags.service'

interface TagsState {
    tags: TagWithCount[]
    loading: boolean
    error: string | null
    fetchTags: () => Promise<void>
    addTag: (nome: string, cor: string) => Promise<void>
    updateTag: (id: string, updates: { nome?: string; cor?: string }) => Promise<void>
    removeTag: (id: string) => Promise<void>
}

export const useTagsStore = create<TagsState>((set, get) => ({
    tags: [],
    loading: false,
    error: null,
    fetchTags: async () => {
        set({ loading: true, error: null })
        try {
            const tags = await tagsService.getTags()
            set({ tags, loading: false })
        } catch (err: any) {
            set({
                error: err?.response?.data?.message || 'Falha ao carregar tags',
                loading: false,
            })
        }
    },
    addTag: async (nome, cor) => {
        try {
            await tagsService.createTag({ nome, cor })
            await get().fetchTags()
        } catch (err: any) {
            throw err
        }
    },
    updateTag: async (id, updates) => {
        try {
            await tagsService.updateTag(id, updates)
            await get().fetchTags()
        } catch (err: any) {
            throw err
        }
    },
    removeTag: async (id) => {
        try {
            await tagsService.deleteTag(id)
            set((state) => ({ tags: state.tags.filter(t => t.id !== id) }))
        } catch (err: any) {
            throw err
        }
    },
}))
