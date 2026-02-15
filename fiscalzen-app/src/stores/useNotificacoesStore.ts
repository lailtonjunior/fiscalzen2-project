import { create } from 'zustand'
import type { Notificacao } from '@/types'
import { notificationsService } from '@/services/notifications.service'

interface NotificacoesState {
    notificacoes: Notificacao[]
    unreadCount: number
    loading: boolean
    fetchNotificacoes: () => Promise<void>
    addNotificacao: (notificacao: Notificacao) => void
    markAsRead: (id: string) => void
    markAllAsRead: () => void
    removeNotificacao: (id: string) => void
}

export const useNotificacoesStore = create<NotificacoesState>((set, get) => ({
    notificacoes: [],
    unreadCount: 0,
    loading: false,

    fetchNotificacoes: async () => {
        set({ loading: true })
        try {
            const data = await notificationsService.getAll()
            set({
                notificacoes: data,
                unreadCount: data.filter(n => !n.lida).length,
                loading: false
            })
        } catch (error) {
            console.error('Failed to fetch notifications', error)
            set({ loading: false })
        }
    },

    addNotificacao: (notificacao) => {
        set((state) => ({
            notificacoes: [notificacao, ...state.notificacoes],
            unreadCount: state.unreadCount + 1
        }))
    },

    markAsRead: (id) => {
        set((state) => {
            const notificacao = state.notificacoes.find(n => n.id === id)
            if (notificacao && !notificacao.lida) {
                // Optimistic update
                notificationsService.markAsRead(id).catch(console.error)

                return {
                    notificacoes: state.notificacoes.map(n =>
                        n.id === id ? { ...n, lida: true } : n
                    ),
                    unreadCount: Math.max(0, state.unreadCount - 1)
                }
            }
            return state
        })
    },

    markAllAsRead: () => {
        set((state) => ({
            notificacoes: state.notificacoes.map(n => ({ ...n, lida: true })),
            unreadCount: 0
        }))
    },

    removeNotificacao: (id) => {
        set((state) => {
            const notificacao = state.notificacoes.find(n => n.id === id)
            return {
                notificacoes: state.notificacoes.filter(n => n.id !== id),
                unreadCount: notificacao && !notificacao.lida
                    ? Math.max(0, state.unreadCount - 1)
                    : state.unreadCount
            }
        })
    }
}))
