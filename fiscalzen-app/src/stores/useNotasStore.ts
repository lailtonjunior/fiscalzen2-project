import { create } from 'zustand'
import type { NotaFiscal, FiltroNotas } from '@/types'
import { notasService } from '@/services/notas.service'
import { toast } from 'sonner'

interface NotasState {
    notas: NotaFiscal[]
    notaSelecionada: NotaFiscal | null
    filtros: FiltroNotas
    notasSelecionadas: string[]
    loading: boolean
    fetchNotas: () => Promise<void> // New method to fetch
    setNotas: (notas: NotaFiscal[]) => void
    setNotaSelecionada: (nota: NotaFiscal | null) => void
    setFiltros: (filtros: FiltroNotas) => void
    toggleNotaSelecionada: (id: string) => void
    selecionarTodas: (ids: string[]) => void
    limparSelecao: () => void
    filtrarNotas: () => NotaFiscal[] // Client-side filter for now
    atualizarStatusManifestacao: (id: string, status: string) => Promise<void>
    adicionarTag: (notaId: string, tag: string) => void
    removerTag: (notaId: string, tag: string) => void
    sincronizar: () => Promise<void>
}

export const useNotasStore = create<NotasState>((set, get) => ({
    notas: [],
    notaSelecionada: null,
    filtros: {},
    notasSelecionadas: [],
    loading: false,

    fetchNotas: async () => {
        set({ loading: true })
        try {
            const response = await notasService.getAll(get().filtros)
            set({ notas: response.data, loading: false })
        } catch (error) {
            toast.error('Erro ao buscar notas fiscais')
            set({ loading: false })
        }
    },

    setNotas: (notas) => set({ notas }),
    setNotaSelecionada: (nota) => set({ notaSelecionada: nota }),
    setFiltros: (filtros) => {
        set({ filtros })
        // Trigger fetch when filters change? Or keep it manual? 
        // For now manual or in useEffect in component
        get().fetchNotas()
    },

    toggleNotaSelecionada: (id) => {
        const { notasSelecionadas } = get()
        if (notasSelecionadas.includes(id)) {
            set({ notasSelecionadas: notasSelecionadas.filter(nid => nid !== id) })
        } else {
            set({ notasSelecionadas: [...notasSelecionadas, id] })
        }
    },
    selecionarTodas: (ids) => set({ notasSelecionadas: ids }),
    limparSelecao: () => set({ notasSelecionadas: [] }),

    filtrarNotas: () => {
        // Legacy client-side filter method - kept for compatibility if needed
        // But mostly we depend on server filtering now
        const { notas, filtros } = get()
        return notas.filter((nota) => {
            // ... (Simplified logic, rely on backend mostly)
            // If backend returns all, we can filter here.
            // Assuming backend returns filtered list if params passed.
            return true;
        })
    },

    atualizarStatusManifestacao: async (id, status) => {
        try {
            await notasService.manifestar(id, status) // Assuming API takes ID (chave)
            set((state) => ({
                notas: state.notas.map(n =>
                    n.id === id ? { ...n, statusManifestacao: status as any, updatedAt: new Date().toISOString() } : n
                )
            }))
            toast.success(`Manifestação ${status} realizada`)
        } catch (error) {
            toast.error('Erro ao manifestar nota')
        }
    },

    adicionarTag: (notaId, tag) => {
        // TODO: persist to backend
        set((state) => ({
            notas: state.notas.map(n =>
                n.id === notaId ? { ...n, tags: [...(n.tags || []), tag] } : n
            )
        }))
    },

    removerTag: (notaId, tag) => {
        // TODO: persist to backend
        set((state) => ({
            notas: state.notas.map(n =>
                n.id === notaId ? { ...n, tags: n.tags?.filter(t => t !== tag) } : n
            )
        }))
    },

    sincronizar: async () => {
        set({ loading: true })
        try {
            const response = await notasService.sync()

            if (response.data && response.data.success === false) {
                const msg = response.data.message || 'Erro ao sincronizar com Sefaz';
                toast.error(msg);
            } else {
                toast.success(response.data?.message || 'Sincronização realizada com sucesso')
                await get().fetchNotas()
            }
        } catch (error: any) {
            console.error('Erro sync:', error);
            const data = error.response?.data;
            let msg = 'Erro ao sincronizar notas';

            if (data) {
                if (typeof data === 'string') msg = data;
                else if (typeof data.message === 'string') msg = data.message;
                else if (typeof data.error === 'string') msg = data.error;
                else if (typeof data.message === 'object') msg = JSON.stringify(data.message);
                else msg = JSON.stringify(data);
            }

            toast.error(msg);
        } finally {
            set({ loading: false })
        }
    }
}))
