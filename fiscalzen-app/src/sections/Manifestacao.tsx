import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotasStore } from '@/stores/useNotasStore'

import { cn, formatCurrency, formatDate, formatCNPJCPF, getStatusLabel } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  XCircle,
  FileText,
  AlertOctagon,
  ArrowRight,
  RefreshCw,
  Info,
  CheckSquare,
  Clock
} from 'lucide-react'

export function Manifestacao() {
  const navigate = useNavigate()
  const { notas, atualizarStatusManifestacao, notasSelecionadas, toggleNotaSelecionada, limparSelecao } = useNotasStore()

  const [showManifestacaoDialog, setShowManifestacaoDialog] = useState(false)
  const [selectedNotaId, setSelectedNotaId] = useState<string | null>(null)
  const [manifestacaoTipo, setManifestacaoTipo] = useState<string>('')
  const [justificativa, setJustificativa] = useState('')
  const [batchMode, setBatchMode] = useState(false)

  // Get notas pendentes
  const notasPendentes = notas.filter(n => n.statusManifestacao === 'pendente')

  // Get notas manifestadas recentemente
  const notasManifestadas = notas
    .filter(n => n.statusManifestacao !== 'pendente')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10)

  // Stats
  const stats = {
    pendentes: notasPendentes.length,
    ciencia: notas.filter(n => n.statusManifestacao === 'ciencia').length,
    confirmadas: notas.filter(n => n.statusManifestacao === 'confirmada').length,
    desconhecidas: notas.filter(n => n.statusManifestacao === 'desconhecida').length,
    naoRealizadas: notas.filter(n => n.statusManifestacao === 'nao_realizada').length,
    desacordo: notas.filter(n => n.statusManifestacao === 'desacordo').length,
  }

  const handleManifestacao = (notaId: string, tipo: string, batch: boolean = false) => {
    setSelectedNotaId(notaId)
    setManifestacaoTipo(tipo)
    setBatchMode(batch)
    setJustificativa('')
    setShowManifestacaoDialog(true)
  }

  const confirmManifestacao = () => {
    if (batchMode && notasSelecionadas.length > 0) {
      notasSelecionadas.forEach(id => {
        atualizarStatusManifestacao(id, manifestacaoTipo)
      })
      limparSelecao()
    } else if (selectedNotaId) {
      atualizarStatusManifestacao(selectedNotaId, manifestacaoTipo)
    }
    setShowManifestacaoDialog(false)
    setJustificativa('')
  }

  const getManifestacaoIcon = (tipo: string) => {
    switch (tipo) {
      case 'ciencia':
        return <HelpCircle className="h-5 w-5 text-blue-500" />
      case 'confirmada':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'desconhecida':
        return <AlertTriangle className="h-5 w-5 text-purple-500" />
      case 'nao_realizada':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'desacordo':
        return <AlertOctagon className="h-5 w-5 text-orange-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getManifestacaoDescription = (tipo: string) => {
    switch (tipo) {
      case 'ciencia':
        return 'Você tomou ciência da emissão da nota fiscal, mas ainda não confirmou a operação.'
      case 'confirmada':
        return 'Você confirmou a realização da operação descrita na nota fiscal.'
      case 'desconhecida':
        return 'Você não reconhece esta operação e desconhece a nota fiscal emitida.'
      case 'nao_realizada':
        return 'Você informa que a operação descrita na nota não foi realizada.'
      case 'desacordo':
        return 'Você informa que há divergências na operação de transporte (CTe).'
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manifestação do Destinatário</h1>
          <p className="text-muted-foreground">
            Gerencie as manifestações das notas fiscais emitidas contra seu CNPJ
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/notas-fiscais')}>
          <ArrowRight className="mr-2 h-4 w-4" />
          Voltar às Notas
        </Button>
      </div>

      {/* Info Alert */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Sobre a Manifestação do Destinatário</h4>
              <p className="text-sm text-blue-800 mt-1">
                A manifestação do destinatário é obrigatória para notas fiscais emitidas contra seu CNPJ.
                Você tem até <strong>180 dias</strong> a partir da data de emissão para realizar a manifestação.
                Após este prazo, a nota não poderá mais ser manifestada.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <StatCard
          title="Pendentes"
          value={stats.pendentes}
          icon={Clock}
          color="text-yellow-600"
          bgColor="bg-yellow-100"
        />
        <StatCard
          title="Ciência"
          value={stats.ciencia}
          icon={HelpCircle}
          color="text-blue-600"
          bgColor="bg-blue-100"
        />
        <StatCard
          title="Confirmadas"
          value={stats.confirmadas}
          icon={CheckCircle}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <StatCard
          title="Desconhecidas"
          value={stats.desconhecidas}
          icon={AlertTriangle}
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
        <StatCard
          title="Não Realizadas"
          value={stats.naoRealizadas}
          icon={XCircle}
          color="text-red-600"
          bgColor="bg-red-100"
        />
        <StatCard
          title="Desacordo"
          value={stats.desacordo}
          icon={AlertOctagon}
          color="text-orange-600"
          bgColor="bg-orange-100"
        />
      </div>

      {/* Quick Actions */}
      {stats.pendentes > 0 && (
        <Card className="border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Ações Rápidas
            </CardTitle>
            <CardDescription>
              Você possui {stats.pendentes} nota(s) pendente(s) de manifestação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => {
                  const primeiraPendente = notasPendentes[0]
                  if (primeiraPendente) {
                    handleManifestacao(primeiraPendente.id, 'ciencia')
                  }
                }}
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                Dar Ciência da Primeira
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const primeiraPendente = notasPendentes[0]
                  if (primeiraPendente) {
                    handleManifestacao(primeiraPendente.id, 'confirmada')
                  }
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirmar Operação
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate('/notas-fiscais?manifestacao=pendente')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Ver Todas Pendentes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Notas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            Notas Pendentes de Manifestação
            {stats.pendentes > 0 && (
              <Badge variant="destructive">{stats.pendentes}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Notas fiscais que ainda não foram manifestadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {notasPendentes.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
              <h4 className="font-medium text-lg">Todas as notas foram manifestadas!</h4>
              <p className="text-muted-foreground">
                Não há notas pendentes de manifestação no momento.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Número</TableHead>
                  <TableHead>Emitente</TableHead>
                  <TableHead>Data Emissão</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Dias Restantes</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notasPendentes.slice(0, 5).map((nota) => {
                  const diasRestantes = Math.max(0, 180 - Math.floor(
                    (new Date().getTime() - new Date(nota.dataEmissao).getTime()) / (1000 * 60 * 60 * 24)
                  ))
                  return (
                    <TableRow key={nota.id}>
                      <TableCell>
                        <Badge variant="outline">{getStatusLabel(nota.tipo)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{nota.numero}</div>
                        <div className="text-xs text-muted-foreground">Série {nota.serie}</div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{nota.emitenteNome}</div>
                        <div className="text-xs text-muted-foreground">{formatCNPJCPF(nota.emitenteCnpj)}</div>
                      </TableCell>
                      <TableCell>{formatDate(nota.dataEmissao)}</TableCell>
                      <TableCell>{formatCurrency(nota.valorTotal)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={diasRestantes < 30 ? 'destructive' : diasRestantes < 60 ? 'default' : 'secondary'}
                        >
                          {diasRestantes} dias
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleManifestacao(nota.id, 'ciencia')}
                          >
                            <HelpCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleManifestacao(nota.id, 'confirmada')}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
          {notasPendentes.length > 5 && (
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={() => navigate('/notas-fiscais?manifestacao=pendente')}>
                Ver todas as {notasPendentes.length} notas pendentes
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recently Manifested */}
      <Card>
        <CardHeader>
          <CardTitle>Manifestações Recentes</CardTitle>
          <CardDescription>
            Últimas notas manifestadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Número</TableHead>
                <TableHead>Emitente</TableHead>
                <TableHead>Manifestação</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notasManifestadas.map((nota) => (
                <TableRow key={nota.id}>
                  <TableCell>
                    <Badge variant="outline">{getStatusLabel(nota.tipo)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{nota.numero}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{nota.emitenteNome}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getManifestacaoIcon(nota.statusManifestacao)}
                      <span>{getStatusLabel(nota.statusManifestacao)}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(nota.updatedAt)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(nota.valorTotal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Manifestacao Dialog */}
      <Dialog open={showManifestacaoDialog} onOpenChange={setShowManifestacaoDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getManifestacaoIcon(manifestacaoTipo)}
              Confirmar Manifestação
            </DialogTitle>
            <DialogDescription>
              {getManifestacaoDescription(manifestacaoTipo)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {batchMode && (
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">
                  Modo em lote: {notasSelecionadas.length} nota(s) selecionada(s)
                </p>
              </div>
            )}

            {(manifestacaoTipo === 'desconhecida' || manifestacaoTipo === 'nao_realizada' || manifestacaoTipo === 'desacordo') && (
              <div className="space-y-2">
                <Label htmlFor="justificativa">Justificativa (obrigatória)</Label>
                <Textarea
                  id="justificativa"
                  placeholder="Informe o motivo da manifestação..."
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  A justificativa é obrigatória para este tipo de manifestação.
                </p>
              </div>
            )}

            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">Atenção</h4>
                  <p className="text-sm text-yellow-800">
                    Após confirmada, a manifestação não poderá ser alterada.
                    Certifique-se de que as informações estão corretas antes de prosseguir.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManifestacaoDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={confirmManifestacao}
              disabled={
                (manifestacaoTipo === 'desconhecida' || manifestacaoTipo === 'nao_realizada' || manifestacaoTipo === 'desacordo') &&
                !justificativa.trim()
              }
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirmar Manifestação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface StatCardProps {
  title: string
  value: number
  icon: React.ElementType
  color: string
  bgColor: string
}

function StatCard({ title, value, icon: Icon, color, bgColor }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className={cn("text-2xl font-bold", color)}>{value}</p>
          </div>
          <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", bgColor)}>
            <Icon className={cn("h-5 w-5", color)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
