import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/useAuthStore'
import { useUIStore } from '@/stores/useUIStore'
import { useNotificacoesStore } from '@/stores/useNotificacoesStore'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  Building2,
  Users,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  LogOut,
  BarChart3,
  Tags,
  History,
  Shield,
  FileSpreadsheet,
  CreditCard,
  HelpCircle
} from 'lucide-react'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  badge?: number
  children?: { label: string; href: string }[]
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard
  },
  {
    label: 'Notas Fiscais',
    href: '/notas-fiscais',
    icon: FileText,
    children: [
      { label: 'Todas as Notas', href: '/notas-fiscais' },
      { label: 'Pendentes', href: '/notas-fiscais?status=pendente' },
      { label: 'Manifestação', href: '/notas-fiscais?manifestacao=pendente' }
    ]
  },
  {
    label: 'Manifestação',
    href: '/manifestacao',
    icon: ClipboardCheck
  },
  {
    label: 'Relatórios',
    href: '/relatorios',
    icon: BarChart3
  },
  {
    label: 'SPED Fiscal',
    href: '/sped',
    icon: FileSpreadsheet
  },
  {
    label: 'Fornecedores',
    href: '/fornecedores',
    icon: Building2
  },
  {
    label: 'Tags',
    href: '/tags',
    icon: Tags
  },
  {
    label: 'Histórico',
    href: '/historico',
    icon: History
  },
  {
    label: 'Notificações',
    href: '/notificacoes',
    icon: Bell,
    badge: 0 // Will be updated from store
  }
]

const adminItems: NavItem[] = [
  {
    label: 'Usuários',
    href: '/usuarios',
    icon: Users
  },
  {
    label: 'Empresa',
    href: '/empresa',
    icon: Building2
  },
  {
    label: 'Integrações',
    href: '/integracoes',
    icon: Shield
  },
  {
    label: 'Assinatura',
    href: '/assinatura',
    icon: CreditCard
  },
  {
    label: 'Configurações',
    href: '/configuracoes',
    icon: Settings
  }
]

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const { user, logout, empresa } = useAuthStore()
  const { unreadCount } = useNotificacoesStore()
  const location = useLocation()

  const isActive = (href: string) => {
    if (href === '/') return location.pathname === '/'
    return location.pathname.startsWith(href.split('?')[0])
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out',
          sidebarOpen ? 'w-64' : 'w-16'
        )}
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
          {sidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-semibold text-sm text-sidebar-foreground">NFe Master</span>
                <span className="text-xs text-sidebar-foreground/60 truncate max-w-[120px]">
                  {empresa?.nomeFantasia || empresa?.razaoSocial}
                </span>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center mx-auto">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(
              'h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent',
              !sidebarOpen && 'hidden'
            )}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 h-[calc(100vh-8rem)]">
          <div className="p-2 space-y-1">
            {navItems.map((item) => (
              <NavItemComponent
                key={item.href}
                item={item}
                isActive={isActive(item.href)}
                sidebarOpen={sidebarOpen}
                badge={item.label === 'Notificações' ? unreadCount : item.badge}
              />
            ))}

            {user?.perfil === 'admin' && (
              <>
                <Separator className="my-4 bg-sidebar-border" />
                <div className={cn('px-3 py-2', !sidebarOpen && 'hidden')}>
                  <span className="text-xs font-medium text-sidebar-foreground/60 uppercase tracking-wider">
                    Administração
                  </span>
                </div>
                {adminItems.map((item) => (
                  <NavItemComponent
                    key={item.href}
                    item={item}
                    isActive={isActive(item.href)}
                    sidebarOpen={sidebarOpen}
                  />
                ))}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-2 border-t border-sidebar-border bg-sidebar">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  'w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground',
                  !sidebarOpen && 'justify-center px-2'
                )}
                onClick={logout}
              >
                <LogOut className="h-4 w-4 shrink-0" />
                {sidebarOpen && <span className="ml-2">Sair</span>}
              </Button>
            </TooltipTrigger>
            {!sidebarOpen && (
              <TooltipContent side="right">
                <p>Sair</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>

        {/* Toggle button when collapsed */}
        {!sidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        )}
      </aside>
    </TooltipProvider>
  )
}

function NavItemComponent({
  item,
  isActive,
  sidebarOpen,
  badge
}: {
  item: NavItem
  isActive: boolean
  sidebarOpen: boolean
  badge?: number
}) {
  const Icon = item.icon

  if (!sidebarOpen) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <NavLink
            to={item.href}
            className={cn(
              'flex items-center justify-center h-10 w-10 rounded-md transition-colors',
              isActive
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            <Icon className="h-5 w-5" />
            {badge ? (
              <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                {badge > 9 ? '9+' : badge}
              </span>
            ) : null}
          </NavLink>
        </TooltipTrigger>
        <TooltipContent side="right">
          <p>{item.label}</p>
        </TooltipContent>
      </Tooltip>
    )
  }

  return (
    <NavLink
      to={item.href}
      className={cn(
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-sidebar-primary text-sidebar-primary-foreground'
          : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="flex-1">{item.label}</span>
      {badge ? (
        <Badge variant="destructive" className="h-5 min-w-5 px-1 text-[10px]">
          {badge > 99 ? '99+' : badge}
        </Badge>
      ) : null}
    </NavLink>
  )
}
