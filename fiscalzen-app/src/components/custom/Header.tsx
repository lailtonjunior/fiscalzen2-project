import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, useNotificacoesStore } from '@/hooks/useStore'
import { cn, formatCNPJ } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Bell,
  Search,
  User,
  Settings,
  LogOut,
  Building2,
  HelpCircle,
  Check,
  CheckCheck,
  FileText,
  AlertTriangle,
  Info,
  X
} from 'lucide-react'
import type { Notificacao } from '@/types'

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const navigate = useNavigate()
  const { user, empresa, logout } = useAuthStore()
  const { notificacoes, unreadCount, markAsRead, markAllAsRead, removeNotificacao } = useNotificacoesStore()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/notas-fiscais?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  const getNotificacaoIcon = (tipo: Notificacao['tipo']) => {
    switch (tipo) {
      case 'success':
        return <div className="w-2 h-2 rounded-full bg-green-500" />
      case 'warning':
        return <div className="w-2 h-2 rounded-full bg-yellow-500" />
      case 'error':
        return <div className="w-2 h-2 rounded-full bg-red-500" />
      default:
        return <div className="w-2 h-2 rounded-full bg-blue-500" />
    }
  }

  const recentNotificacoes = notificacoes.slice(0, 5)

  return (
    <header
      className={cn(
        'sticky top-0 z-30 h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      <div className="flex h-full items-center justify-between px-4 gap-4">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar notas fiscais, fornecedores, chaves de acesso..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </form>

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="end">
              <div className="flex items-center justify-between p-4 border-b">
                <h4 className="font-semibold">Notificações</h4>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={markAllAsRead}
                    className="h-auto py-1 px-2 text-xs"
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Marcar todas como lidas
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[300px]">
                {recentNotificacoes.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                    <Bell className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma notificação</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {recentNotificacoes.map((notif) => (
                      <div
                        key={notif.id}
                        className={cn(
                          'p-4 hover:bg-muted/50 transition-colors group relative',
                          !notif.lida && 'bg-muted/30'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {getNotificacaoIcon(notif.tipo)}
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              'text-sm font-medium',
                              !notif.lida && 'text-foreground'
                            )}>
                              {notif.titulo}
                            </p>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {notif.mensagem}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(notif.createdAt).toLocaleDateString('pt-BR', {
                                day: '2-digit',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notif.lida && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => markAsRead(notif.id)}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => removeNotificacao(notif.id)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              <div className="p-2 border-t">
                <Button
                  variant="ghost"
                  className="w-full text-sm"
                  onClick={() => navigate('/notificacoes')}
                >
                  Ver todas as notificações
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Help */}
          <Button variant="ghost" size="icon" onClick={() => navigate('/ajuda')}>
            <HelpCircle className="h-5 w-5" />
          </Button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {user?.nome?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.nome}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <Badge variant="secondary" className="w-fit mt-1">
                    {user?.perfil === 'admin' && 'Administrador'}
                    {user?.perfil === 'contador' && 'Contador'}
                    {user?.perfil === 'operador' && 'Operador'}
                    {user?.perfil === 'visualizador' && 'Visualizador'}
                    {user?.perfil === 'gerente' && 'Gerente'}
                  </Badge>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/perfil')}>
                <User className="mr-2 h-4 w-4" />
                Meu Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/empresa')}>
                <Building2 className="mr-2 h-4 w-4" />
                Dados da Empresa
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/configuracoes')}>
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
