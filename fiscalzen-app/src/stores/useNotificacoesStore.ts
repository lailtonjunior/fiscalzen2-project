import { create } from 'zustand'
import { notificacoesService, type Notificacao } from '@/services/notificacoes.service'

interface NotificacoesState {
    notificacoes: Notificacao[]
    unreadCount: number
    loading: boolean
    error: string | null
    fetchNotificacoes: (lida?: boolean) => Promise<void>
    fetchUnreadCount: () => Promise<void>
    markAsRead: (id: string) => Promise<void>
    markAllAsRead: () => Promise<void>
    removeNotificacao: (id: string) => Promise<void>
}

export const useNotificacoesStore = create<NotificacoesState>((set, get) => ({
    notificacoes: [],
    unreadCount: 0,
    loading: false,
    error: null,

    fetchNotificacoes: async (lida) => {
        set({ loading: true, error: null })
        try {
            const result = await notificacoesService.getAll({ lida, take: 50 })
            set({ notificacoes: result.data, loading: false })
        } catch (err: any) {
            set({
                error: err?.response?.data?.message || 'Falha ao carregar notificações',
                loading: false,
            })
        }
    },

    fetchUnreadCount: async () => {
        try {
            const { count } = await notificacoesService.getUnreadCount()
            set({ unreadCount: count })
        } catch {
            // silent fail for count
        }
    },

    markAsRead: async (id) => {
        try {
            await notificacoesService.markAsRead(id)
            set((state) => ({
                notificacoes: state.notificacoes.map(n =>
                    n.id === id ? { ...n, lida: true } : n,
                ),
                unreadCount: Math.max(0, state.unreadCount - 1),
            }))
        } catch (err: any) {
            throw err
        }
    },

    markAllAsRead: async () => {
        try {
            await notificacoesService.markAllAsRead()
            set((state) => ({
                notificacoes: state.notificacoes.map(n => ({ ...n, lida: true })),
                unreadCount: 0,
            }))
        } catch (err: any) {
            throw err
        }
    },

    removeNotificacao: async (id) => {
        try {
            await notificacoesService.remove(id)
            set((state) => {
                const notificacao = state.notificacoes.find(n => n.id === id)
                return {
                    notificacoes: state.notificacoes.filter(n => n.id !== id),
                    unreadCount: notificacao && !notificacao.lida
                        ? Math.max(0, state.unreadCount - 1)
                        : state.unreadCount,
                }
            })
        } catch (err: any) {
            throw err
        }
    },
}))
