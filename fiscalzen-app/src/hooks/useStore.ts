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
import { dashboardService, type DashboardTimelineItem, type DashboardIntegrity } from '@/services/dashboard.service'

// --- Internal Mock Data ---

const mockEmpresa: Empresa = {
  id: '1',
  cnpj: '12.345.678/0001-90',
  razaoSocial: 'DEMO EMPRESA LTDA',
  nomeFantasia: 'Demo Empresa',
  inscricaoEstadual: '123456789',
  inscricaoMunicipal: '987654321',
  endereco: {
    logradouro: 'Rua das Flores',
    numero: '123',
    complemento: 'Sala 456',
    bairro: 'Centro',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01001-000'
  },
  certificado: {
    id: 'cert1',
    nome: 'Certificado A1',
    validoDe: '2024-01-01',
    validoAte: '2025-01-01',
    emissor: 'Serasa',
    serial: '1234567890',
    ultimoUso: '2024-12-15T10:30:00Z'
  },
  ambienteSefaz: 'producao',
  ativo: true,
  dataCadastro: '2024-01-15',
  limiteNotas: 10000,
  notasUtilizadas: 3456
};

const mockUsuarios: Usuario[] = [
  {
    id: '1',
    empresaId: '1',
    nome: 'Administrador Master',
    email: 'admin@demoempresa.com',
    telefone: '(11) 99999-9999',
    cargo: 'Diretor',
    perfil: 'admin',
    ativo: true,
    ultimoAcesso: '2024-12-15T10:30:00Z',
    createdAt: '2024-01-15',
    permissoes: ['*']
  },
  {
    id: '2',
    empresaId: '1',
    nome: 'Maria Contadora',
    email: 'contabilidade@demoempresa.com',
    telefone: '(11) 98888-8888',
    cargo: 'Contadora',
    perfil: 'contador',
    ativo: true,
    ultimoAcesso: '2024-12-14T16:45:00Z',
    createdAt: '2024-02-01',
    permissoes: ['notas.visualizar', 'notas.download', 'relatorios.visualizar', 'sped.conferir']
  }
];

const mockNotasFiscais: NotaFiscal[] = [
  {
    id: '1',
    empresaId: '1',
    chaveAcesso: '35241212345678000190550010000001231234567890',
    tipo: 'NFe',
    numero: '123',
    serie: '1',
    dataEmissao: '2024-12-10T08:30:00Z',
    dataAutorizacao: '2024-12-10T08:31:15Z',
    dataEntradaSaida: '2024-12-12T10:00:00Z',
    valorTotal: 15450.00,
    valorProdutos: 12500.00,
    valorIcms: 2790.00,
    valorIpi: 0,
    valorFrete: 450.00,
    emitenteCnpj: '98.765.432/0001-10',
    emitenteNome: 'FORNECEDOR ABC LTDA',
    emitenteIe: '987654321',
    emitenteCidade: 'São Paulo',
    emitenteUf: 'SP',
    destinatarioCnpjCpf: '12.345.678/0001-90',
    destinatarioNome: 'DEMO EMPRESA LTDA',
    destinatarioIe: '123456789',
    statusSefaz: 'autorizada',
    statusManifestacao: 'confirmada',
    protocoloAutorizacao: '135241234567890',
    naturezaOperacao: 'Venda de Mercadoria',
    cfop: '5102',
    createdAt: '2024-12-10T08:35:00Z',
    updatedAt: '2024-12-10T14:20:00Z',
    dataDownload: '2024-12-10T08:35:00Z',
    tags: ['Importante', 'Pago']
  },
  {
    id: '2',
    empresaId: '1',
    chaveAcesso: '35241298765432100010550020000004569876543210',
    tipo: 'NFe',
    numero: '456',
    serie: '2',
    dataEmissao: '2024-12-11T14:20:00Z',
    dataAutorizacao: '2024-12-11T14:21:30Z',
    valorTotal: 8750.50,
    valorProdutos: 7500.00,
    valorIcms: 1125.50,
    valorFrete: 125.00,
    emitenteCnpj: '55.444.333/0001-22',
    emitenteNome: 'DISTRIBUIDORA XYZ S/A',
    emitenteIe: '456789123',
    emitenteCidade: 'Rio de Janeiro',
    emitenteUf: 'RJ',
    destinatarioCnpjCpf: '12.345.678/0001-90',
    destinatarioNome: 'DEMO EMPRESA LTDA',
    destinatarioIe: '123456789',
    statusSefaz: 'autorizada',
    statusManifestacao: 'ciencia',
    protocoloAutorizacao: '135241234567891',
    naturezaOperacao: 'Venda de Mercadoria',
    cfop: '6102',
    createdAt: '2024-12-11T14:25:00Z',
    updatedAt: '2024-12-11T16:00:00Z',
    dataDownload: '2024-12-11T14:25:00Z',
    tags: ['Conferir']
  },
  {
    id: '3',
    empresaId: '1',
    chaveAcesso: '35241211122233344455550030000007891112223344',
    tipo: 'NFe',
    numero: '789',
    serie: '3',
    dataEmissao: '2024-12-12T09:00:00Z',
    dataAutorizacao: '2024-12-12T09:01:45Z',
    valorTotal: 32100.00,
    valorProdutos: 28000.00,
    valorIcms: 4100.00,
    emitenteCnpj: '77.888.999/0001-33',
    emitenteNome: 'INDUSTRIA BRASIL LTDA',
    emitenteIe: '789123456',
    emitenteCidade: 'Belo Horizonte',
    emitenteUf: 'MG',
    destinatarioCnpjCpf: '12.345.678/0001-90',
    destinatarioNome: 'DEMO EMPRESA LTDA',
    destinatarioIe: '123456789',
    statusSefaz: 'autorizada',
    statusManifestacao: 'pendente',
    protocoloAutorizacao: '135241234567892',
    naturezaOperacao: 'Venda de Mercadoria',
    cfop: '5102',
    createdAt: '2024-12-12T09:05:00Z',
    updatedAt: '2024-12-12T09:05:00Z',
    dataDownload: '2024-12-12T09:05:00Z'
  },
  {
    id: '4',
    empresaId: '1',
    chaveAcesso: '35241255566677788899990040000001235556667788',
    tipo: 'CTe',
    numero: '100',
    serie: '1',
    dataEmissao: '2024-12-13T11:30:00Z',
    dataAutorizacao: '2024-12-13T11:32:00Z',
    valorTotal: 1250.00,
    valorFrete: 1250.00,
    emitenteCnpj: '22.333.444/0001-55',
    emitenteNome: 'TRANSPORTADORA RAPIDO LTDA',
    emitenteIe: '321654987',
    emitenteCidade: 'Curitiba',
    emitenteUf: 'PR',
    destinatarioCnpjCpf: '12.345.678/0001-90',
    destinatarioNome: 'DEMO EMPRESA LTDA',
    destinatarioIe: '123456789',
    statusSefaz: 'autorizada',
    statusManifestacao: 'pendente',
    protocoloAutorizacao: '135241234567893',
    naturezaOperacao: 'Transporte',
    createdAt: '2024-12-13T11:35:00Z',
    updatedAt: '2024-12-13T11:35:00Z',
    dataDownload: '2024-12-13T11:35:00Z'
  }
];

const mockDasboardStats: DashboardStats = {
  totalNotas: 3456,
  totalNotasMes: 287,
  notasPendentesManifestacao: 42,
  notasManifestadas: 3380,
  valorTotalNotas: 12547890.50,
  valorTotalMes: 987654.32,
  fornecedoresAtivos: 156,
  downloadsRealizados: 8923
};

const mockNotificacoes: Notificacao[] = [
  {
    id: '1',
    empresaId: '1',
    tipo: 'info',
    titulo: 'Novas notas disponíveis',
    mensagem: 'Foram encontradas 5 novas notas fiscais na SEFAZ.',
    lida: false,
    link: '/notas-fiscais?status=pendente',
    createdAt: '2024-12-15T08:00:00Z'
  },
  {
    id: '2',
    empresaId: '1',
    tipo: 'warning',
    titulo: 'Manifestações pendentes',
    mensagem: 'Você possui 42 notas aguardando manifestação. Prazo: 180 dias.',
    lida: false,
    link: '/notas-fiscais?manifestacao=pendente',
    createdAt: '2024-12-14T18:00:00Z'
  },
  {
    id: '3',
    empresaId: '1',
    usuarioId: '3',
    tipo: 'success',
    titulo: 'Manifestação realizada',
    mensagem: 'A nota 123 foi confirmada com sucesso.',
    lida: true,
    createdAt: '2024-12-10T14:25:00Z'
  }
];

const mockTags: Tag[] = [
  { id: '1', empresaId: '1', nome: 'Importante', cor: '#ef4444', createdAt: '2024-01-01' },
  { id: '2', empresaId: '1', nome: 'Pago', cor: '#22c55e', createdAt: '2024-01-01' },
  { id: '3', empresaId: '1', nome: 'Conferir', cor: '#f59e0b', createdAt: '2024-01-01' },
  { id: '4', empresaId: '1', nome: 'Divergência', cor: '#8b5cf6', createdAt: '2024-01-01' },
  { id: '5', empresaId: '1', nome: 'Cancelada', cor: '#6b7280', createdAt: '2024-01-01' },
  { id: '6', empresaId: '1', nome: 'Ativo', cor: '#3b82f6', createdAt: '2024-01-01' },
  { id: '7', empresaId: '1', nome: 'Frete', cor: '#ec4899', createdAt: '2024-01-01' },
  { id: '8', empresaId: '1', nome: 'Desacordo', cor: '#f97316', createdAt: '2024-01-01' },
  { id: '9', empresaId: '1', nome: 'Material de Escritório', cor: '#14b8a6', createdAt: '2024-01-01' }
];

const mockGraficoNotasPorMes = {
  labels: ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  datasets: [
    { label: 'NFe', data: [245, 289, 312, 298, 267, 287], color: '#3b82f6' },
    { label: 'CTe', data: [45, 52, 48, 61, 55, 49], color: '#8b5cf6' }
  ]
};

const mockGraficoValorPorMes = {
  labels: ['Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
  datasets: [
    { label: 'Valor Total (R$)', data: [1850000, 2100000, 1950000, 2300000, 2150000, 987654], color: '#22c55e' }
  ]
};

const mockGraficoStatusManifestacao = {
  labels: ['Confirmada', 'Ciência', 'Pendente', 'Desconhecida', 'Não Realizada', 'Desacordo'],
  datasets: [
    { label: 'Quantidade', data: [2890, 340, 42, 15, 8, 5], color: '#3b82f6' }
  ]
};

// --- Stores ---

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
  minicharts: {
    notasPorMes: any
    valorPorMes: any
    statusManifestacao: any
  }
  timeline: DashboardTimelineItem[]
  integrity: DashboardIntegrity | null
  periodo: '7d' | '30d' | '90d' | '1y'
  isLoading: boolean
  error: string | null
  setPeriodo: (periodo: '7d' | '30d' | '90d' | '1y') => void
  refreshStats: () => Promise<void>
}

export const useDashboardStore = create<DashboardState>((set) => ({
  stats: mockDasboardStats,
  minicharts: {
    notasPorMes: mockGraficoNotasPorMes,
    valorPorMes: mockGraficoValorPorMes,
    statusManifestacao: mockGraficoStatusManifestacao
  },
  timeline: [],
  integrity: null,
  periodo: '30d',
  isLoading: false,
  error: null,
  setPeriodo: (periodo) => set({ periodo }),
  refreshStats: async () => {
    set({ isLoading: true, error: null })
    try {
      const [timeline, integrity] = await Promise.all([
        dashboardService.getTimeline(),
        dashboardService.getIntegrity()
      ])

      // Simulate API delay for smoother UX (remove in prod if real API is fast)
      await new Promise(resolve => setTimeout(resolve, 800))

      set({
        timeline,
        integrity,
        // In a real app, we would fetch stats and charts here too
        stats: mockDasboardStats,
        isLoading: false
      })
    } catch (error: any) {
      set({
        error: 'Falha ao carregar dados do dashboard',
        isLoading: false
      })
      console.error('ashboard Error:', error)
    }
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
