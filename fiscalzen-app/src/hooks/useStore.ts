import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  Empresa, 
  Usuario, 
  NotaFiscal, 
  FiltroNotas, 
  Notificacao,
  DashboardStats,
  Tag
} from '@/types'
import { 
  mockEmpresa, 
  mockUsuarios, 
  mockNotasFiscais, 
  mockNotificacoes,
  mockDashboardStats,
  mockTags
} from '@/data/mockData'

// Auth Store
interface AuthState {
  isAuthenticated: boolean
  user: Usuario | null
  empresa: Empresa | null
  login: (email: string, _password: string) => Promise<boolean>
  logout: () => void
  setUser: (user: Usuario) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: true,
      user: mockUsuarios[0],
      empresa: mockEmpresa,
      login: async (email: string) => {
        const user = mockUsuarios.find(u => u.email === email)
        if (user) {
          set({ isAuthenticated: true, user, empresa: mockEmpresa })
          return true
        }
        return false
      },
      logout: () => {
        set({ isAuthenticated: false, user: null, empresa: null })
      },
      setUser: (user: Usuario) => {
        set({ user })
      }
    }),
    {
      name: 'auth-storage'
    }
  )
)

// Notas Fiscais Store
interface NotasState {
  notas: NotaFiscal[]
  notaSelecionada: NotaFiscal | null
  filtros: FiltroNotas
  notasSelecionadas: string[]
  loading: boolean
  setNotas: (notas: NotaFiscal[]) => void
  setNotaSelecionada: (nota: NotaFiscal | null) => void
  setFiltros: (filtros: FiltroNotas) => void
  toggleNotaSelecionada: (id: string) => void
  selecionarTodas: (ids: string[]) => void
  limparSelecao: () => void
  filtrarNotas: () => NotaFiscal[]
  atualizarStatusManifestacao: (id: string, status: string) => void
  adicionarTag: (notaId: string, tag: string) => void
  removerTag: (notaId: string, tag: string) => void
}

export const useNotasStore = create<NotasState>((set, get) => ({
  notas: mockNotasFiscais,
  notaSelecionada: null,
  filtros: {},
  notasSelecionadas: [],
  loading: false,
  setNotas: (notas) => set({ notas }),
  setNotaSelecionada: (nota) => set({ notaSelecionada: nota }),
  setFiltros: (filtros) => set({ filtros }),
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
    const { notas, filtros } = get()
    return notas.filter((nota) => {
      if (filtros.periodoInicio && new Date(nota.dataEmissao) < new Date(filtros.periodoInicio)) return false
      if (filtros.periodoFim && new Date(nota.dataEmissao) > new Date(filtros.periodoFim)) return false
      if (filtros.tipo?.length && !filtros.tipo.includes(nota.tipo)) return false
      if (filtros.statusSefaz?.length && !filtros.statusSefaz.includes(nota.statusSefaz)) return false
      if (filtros.statusManifestacao?.length && !filtros.statusManifestacao.includes(nota.statusManifestacao)) return false
      if (filtros.emitenteCnpj && !nota.emitenteCnpj.includes(filtros.emitenteCnpj)) return false
      if (filtros.emitenteNome && !nota.emitenteNome.toLowerCase().includes(filtros.emitenteNome.toLowerCase())) return false
      if (filtros.valorMinimo && nota.valorTotal < filtros.valorMinimo) return false
      if (filtros.valorMaximo && nota.valorTotal > filtros.valorMaximo) return false
      if (filtros.chaveAcesso && !nota.chaveAcesso.includes(filtros.chaveAcesso)) return false
      if (filtros.numero && !nota.numero.includes(filtros.numero)) return false
      if (filtros.tags?.length && !filtros.tags.some(tag => nota.tags?.includes(tag))) return false
      return true
    })
  },
  atualizarStatusManifestacao: (id, status) => {
    set((state) => ({
      notas: state.notas.map(n => 
        n.id === id ? { ...n, statusManifestacao: status as any, updatedAt: new Date().toISOString() } : n
      )
    }))
  },
  adicionarTag: (notaId, tag) => {
    set((state) => ({
      notas: state.notas.map(n => 
        n.id === notaId ? { ...n, tags: [...(n.tags || []), tag] } : n
      )
    }))
  },
  removerTag: (notaId, tag) => {
    set((state) => ({
      notas: state.notas.map(n => 
        n.id === notaId ? { ...n, tags: n.tags?.filter(t => t !== tag) } : n
      )
    }))
  }
}))

// Notificações Store
interface NotificacoesState {
  notificacoes: Notificacao[]
  unreadCount: number
  addNotificacao: (notificacao: Notificacao) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotificacao: (id: string) => void
}

export const useNotificacoesStore = create<NotificacoesState>((set) => ({
  notificacoes: mockNotificacoes,
  unreadCount: mockNotificacoes.filter(n => !n.lida).length,
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

// Dashboard Store
interface DashboardState {
  stats: DashboardStats
  periodo: '7d' | '30d' | '90d' | '1y'
  setPeriodo: (periodo: '7d' | '30d' | '90d' | '1y') => void
  refreshStats: () => Promise<void>
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: mockDashboardStats,
  periodo: '30d',
  setPeriodo: (periodo) => set({ periodo }),
  refreshStats: async () => {
    set({ stats: mockDashboardStats })
  }
}))

// UI Store
interface UIState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'light',
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme })
    }),
    {
      name: 'ui-storage'
    }
  )
)

// Tags Store
interface TagsState {
  tags: Tag[]
  addTag: (tag: Omit<Tag, 'id' | 'createdAt'>) => void
  updateTag: (id: string, updates: Partial<Tag>) => void
  removeTag: (id: string) => void
}

export const useTagsStore = create<TagsState>((set) => ({
  tags: mockTags,
  addTag: (tag) => {
    const newTag: Tag = {
      ...tag,
      id: String(Date.now()),
      createdAt: new Date().toISOString()
    }
    set((state) => ({ tags: [...state.tags, newTag] }))
  },
  updateTag: (id, updates) => {
    set((state) => ({
      tags: state.tags.map(t => t.id === id ? { ...t, ...updates } : t)
    }))
  },
  removeTag: (id) => {
    set((state) => ({
      tags: state.tags.filter(t => t.id !== id)
    }))
  }
}))
