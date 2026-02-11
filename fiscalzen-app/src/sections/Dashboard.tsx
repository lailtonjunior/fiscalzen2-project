import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { useDashboardStore } from '@/stores/useDashboardStore'
import { useNotasStore } from '@/stores/useNotasStore'
import { cn, formatCurrency, formatDate, getStatusLabel } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileText,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Building2,
  DollarSign,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Activity
} from 'lucide-react'


export function Dashboard() {
  const navigate = useNavigate()
  const { stats, integrity, isLoading, error, periodo, setPeriodo, refreshStats } = useDashboardStore()
  const { notas, fetchNotas } = useNotasStore()
  const { empresa } = useAuthStore()

  useEffect(() => {
    refreshStats()
    fetchNotas({ take: 20, statusManifestacao: undefined })
  }, [])

  useEffect(() => {
    refreshStats()
  }, [periodo])

  // Get recent notas
  const notasRecentes = notas
    .sort((a, b) => new Date(b.dataEmissao).getTime() - new Date(a.dataEmissao).getTime())
    .slice(0, 5)

  // Get notas pendentes manifestacao
  const notasPendentes = notas
    .filter(n => n.statusManifestacao === 'pendente')
    .slice(0, 5)

  // Calculate usage percentage
  const notasUtilizadas = (empresa as any)?.notasUtilizadas ?? 0
  const limiteNotas = (empresa as any)?.limiteNotas ?? 1
  const usagePercent = empresa ? (notasUtilizadas / limiteNotas) * 100 : 0

  if (isLoading && stats.totalNotas === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-[400px]" />
          <Skeleton className="h-[400px]" />
        </div>
      </div>
    )
  }

  if (error && stats.totalNotas === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <AlertCircle className="h-16 w-16 mb-4 text-red-400" />
        <p className="text-lg font-medium">Falha ao carregar dashboard</p>
        <p className="text-sm mb-4">{error}</p>
        <Button onClick={() => refreshStats()}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral das suas notas fiscais e atividades
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={periodo} onValueChange={(v) => setPeriodo(v as any)}>
            <TabsList>
              <TabsTrigger value="7d">7 dias</TabsTrigger>
              <TabsTrigger value="30d">30 dias</TabsTrigger>
              <TabsTrigger value="90d">90 dias</TabsTrigger>
              <TabsTrigger value="1y">1 ano</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="icon" onClick={() => refreshStats()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Integrity Alert (Real Data) */}
      {integrity && integrity.status !== 'HEALTHY' && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Atenção! </strong>
          <span className="block sm:inline">Problema detectado na integridade do sistema.</span>
        </div>
      )}

      {integrity && integrity.status === 'HEALTHY' && (
        <div className="flex items-center gap-2 text-sm text-green-600 mb-2">
          <Activity className="h-4 w-4" />
          Sistema Operacional - Última verificação: {new Date(integrity.lastCheck).toLocaleTimeString()}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Notas"
          value={stats.totalNotas.toLocaleString('pt-BR')}
          description={`${stats.totalNotasMes} este mês`}
          trend={+12}
          icon={FileText}
          trendLabel="vs. mês anterior"
        />
        <StatCard
          title="Valor Total"
          value={formatCurrency(stats.valorTotalNotas)}
          description={formatCurrency(stats.valorTotalMes) + ' este mês'}
          trend={+8}
          icon={DollarSign}
          trendLabel="vs. mês anterior"
        />
        <StatCard
          title="Pendentes Manifestação"
          value={stats.notasPendentesManifestacao.toString()}
          description={`de ${stats.totalNotas} notas`}
          trend={-5}
          icon={AlertTriangle}
          trendLabel="vs. mês anterior"
          alert={stats.notasPendentesManifestacao > 20}
        />
        <StatCard
          title="Fornecedores Ativos"
          value={stats.fornecedoresAtivos.toString()}
          description={`${stats.downloadsRealizados.toLocaleString('pt-BR')} downloads`}
          trend={+3}
          icon={Building2}
          trendLabel="novos este mês"
        />
      </div>

      {/* Summary Cards Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Status Manifestação Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Manifestações</CardTitle>
            <CardDescription>Resumo do status das manifestações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Manifestadas</span>
              <span className="font-medium text-green-600">{stats.notasManifestadas.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Pendentes</span>
              <span className="font-medium text-yellow-600">{stats.notasPendentesManifestacao.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Downloads</span>
              <span className="font-medium">{stats.downloadsRealizados?.toLocaleString('pt-BR') ?? 0}</span>
            </div>
          </CardContent>
        </Card>

        {/* Valores Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Valores</CardTitle>
            <CardDescription>Totais acumulados e do mês</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total acumulado</span>
              <span className="font-medium">{formatCurrency(stats.valorTotalNotas)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Este mês</span>
              <span className="font-medium text-green-600">{formatCurrency(stats.valorTotalMes)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Plano Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Uso do Plano</CardTitle>
            <CardDescription>Notas fiscais do período</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Utilizado</span>
              <span className="font-medium">
                {notasUtilizadas.toLocaleString('pt-BR')} / {limiteNotas.toLocaleString('pt-BR')}
              </span>
            </div>
            <Progress value={usagePercent} className="h-2" />
            <p className="text-xs text-muted-foreground">
              {usagePercent.toFixed(1)}% do limite utilizado
            </p>
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Plano atual</span>
                <Badge variant="secondary">Business</Badge>
              </div>
              <Button variant="outline" className="w-full" size="sm">
                Fazer Upgrade
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Notas Recentes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Notas Recentes</CardTitle>
              <CardDescription>Últimas notas fiscais recebidas</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/notas-fiscais')}>
              Ver todas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notasRecentes.map((nota) => (
                <div
                  key={nota.id}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/notas-fiscais/${nota.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      nota.tipo === 'NFe' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                    )}>
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{nota.emitenteNome}</p>
                      <p className="text-xs text-muted-foreground">
                        {nota.tipo} {nota.numero} - {formatDate(nota.dataEmissao)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatCurrency(nota.valorTotal)}</p>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        nota.statusManifestacao === 'confirmada' && 'border-green-500 text-green-600',
                        nota.statusManifestacao === 'pendente' && 'border-yellow-500 text-yellow-600',
                        nota.statusManifestacao === 'desconhecida' && 'border-purple-500 text-purple-600'
                      )}
                    >
                      {getStatusLabel(nota.statusManifestacao)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pendentes Manifestação */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Pendentes Manifestação
                {notasPendentes.length > 0 && (
                  <Badge variant="destructive">{notasPendentes.length}</Badge>
                )}
              </CardTitle>
              <CardDescription>Notas aguardando manifestação do destinatário</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/notas-fiscais?manifestacao=pendente')}>
              Ver todas
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {notasPendentes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mb-2 text-green-500" />
                <p className="text-sm font-medium">Todas as notas manifestadas!</p>
                <p className="text-xs">Não há notas pendentes de manifestação.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notasPendentes.map((nota) => (
                  <div
                    key={nota.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-yellow-200 bg-yellow-50/50 hover:bg-yellow-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/notas-fiscais/${nota.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center">
                        <AlertCircle className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{nota.emitenteNome}</p>
                        <p className="text-xs text-muted-foreground">
                          {nota.tipo} {nota.numero} - {formatDate(nota.dataEmissao)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-sm">{formatCurrency(nota.valorTotal)}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-7"
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/manifestacao?nota=${nota.id}`)
                        }}
                      >
                        Manifestar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: string
  description: string
  trend: number
  icon: React.ElementType
  trendLabel: string
  alert?: boolean
}

function StatCard({ title, value, description, trend, icon: Icon, trendLabel, alert }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={cn(
              "text-2xl font-bold mt-1",
              alert && "text-red-600"
            )}>
              {value}
            </p>
          </div>
          <div className={cn(
            "h-12 w-12 rounded-lg flex items-center justify-center",
            alert ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary"
          )}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <Badge
            variant={trend >= 0 ? 'default' : 'destructive'}
            className="h-5 text-xs"
          >
            {trend >= 0 ? '+' : ''}{trend}%
          </Badge>
          <span className="text-xs text-muted-foreground">{trendLabel}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">{description}</p>
      </CardContent>
    </Card>
  )
}
