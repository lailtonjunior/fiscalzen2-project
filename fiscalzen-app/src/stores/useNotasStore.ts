import { create } from 'zustand'
import type { NotaFiscal } from '@/types'
import { notasFiscaisService, type NotasFiscaisFilters } from '@/services/notas-fiscais.service'

interface NotasState {
    notas: NotaFiscal[]
    notaSelecionada: NotaFiscal | null
    filtros: NotasFiscaisFilters
    notasSelecionadas: string[]
    loading: boolean
    error: string | null
    meta: { total: number; hasMore: boolean; nextCursor: string | null }
    fetchNotas: (filters?: NotasFiscaisFilters) => Promise<void>
    fetchMore: () => Promise<void>
    fetchNota: (id: string) => Promise<void>
    setNotaSelecionada: (nota: NotaFiscal | null) => void
    setFiltros: (filtros: Partial<NotasFiscaisFilters>) => void
    toggleNotaSelecionada: (id: string) => void
    selecionarTodas: (ids: string[]) => void
    limparSelecao: () => void
}

export const useNotasStore = create<NotasState>((set, get) => ({
    notas: [],
    notaSelecionada: null,
    filtros: { take: 20 },
    notasSelecionadas: [],
    loading: false,
    error: null,
    meta: { total: 0, hasMore: false, nextCursor: null },

    fetchNotas: async (filters) => {
        const currentFilters = filters ?? get().filtros
        set({ loading: true, error: null, filtros: currentFilters })
        try {
            const result = await notasFiscaisService.getNotas(currentFilters)
            set({
                notas: result.data,
                meta: result.meta,
                loading: false,
            })
        } catch (err: any) {
            set({
                error: err?.response?.data?.message || 'Falha ao carregar notas fiscais',
                loading: false,
            })
        }
    },

    fetchMore: async () => {
        const { meta, filtros, notas } = get()
        if (!meta.hasMore || !meta.nextCursor) return
        set({ loading: true })
        try {
            const result = await notasFiscaisService.getNotas({
                ...filtros,
                cursor: meta.nextCursor,
            })
            set({
                notas: [...notas, ...result.data],
                meta: result.meta,
                loading: false,
            })
        } catch (err: any) {
            set({
                error: err?.response?.data?.message || 'Falha ao carregar mais notas',
                loading: false,
            })
        }
    },

    fetchNota: async (id) => {
        set({ loading: true, error: null })
        try {
            const nota = await notasFiscaisService.getNota(id)
            set({ notaSelecionada: nota, loading: false })
        } catch (err: any) {
            set({
                error: err?.response?.data?.message || 'Falha ao carregar nota',
                loading: false,
            })
        }
    },

    setNotaSelecionada: (nota) => set({ notaSelecionada: nota }),
    setFiltros: (filtros) => {
        const merged = { ...get().filtros, ...filtros }
        set({ filtros: merged })
    },
    toggleNotaSelecionada: (id) => {
        set((state) => {
            const isSelected = state.notasSelecionadas.includes(id)
            return {
                notasSelecionadas: isSelected
                    ? state.notasSelecionadas.filter(i => i !== id)
                    : [...state.notasSelecionadas, id],
            }
        })
    },
    selecionarTodas: (ids) => set({ notasSelecionadas: ids }),
    limparSelecao: () => set({ notasSelecionadas: [] }),
}))
