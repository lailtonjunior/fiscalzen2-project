import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useNotasStore } from '@/stores/useNotasStore'
import { useTagsStore } from '@/stores/useTagsStore'
import { notasFiscaisService } from '@/services/notas-fiscais.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, Search, Filter, Download, FileText, MoreHorizontal, Eye, CheckCircle, XCircle, HelpCircle, Tag, Trash2, FileSpreadsheet, FileDown, RefreshCw } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { DateRange } from 'react-day-picker'
import { cn, formatCurrency, formatDate, formatCNPJCPF, formatChaveAcesso, getStatusLabel, getStatusColor, downloadFile } from '@/lib/utils'
import { toast } from 'sonner'
import type { NotaFiscal } from '@/types'
import type { ManifestarDto } from '@/services/notas-fiscais.service'

export function NotasFiscais() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const {
    notas,
    filtros,
    setFiltros,
    notasSelecionadas,
    toggleNotaSelecionada,
    selecionarTodas,
    limparSelecao,
    fetchNotas,
    fetchMore,
    loading,
    error,
    meta,
  } = useNotasStore()
  const { tags, fetchTags } = useTagsStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date()
  })
  const [selectedNota, setSelectedNota] = useState<NotaFiscal | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showManifestacaoDialog, setShowManifestacaoDialog] = useState(false)
  const [showDownloadDialog, setShowDownloadDialog] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  // Initial fetch
  useEffect(() => {
    fetchNotas()
    fetchTags()
  }, [])

  // Apply URL params on mount
  useEffect(() => {
    const statusParam = searchParams.get('status')
    const manifestacaoParam = searchParams.get('manifestacao')
    const searchParam = searchParams.get('search')
    const newFilters: Record<string, any> = {}
    if (statusParam) newFilters.statusSefaz = statusParam
    if (manifestacaoParam) newFilters.statusManifestacao = manifestacaoParam
    if (searchParam) { setSearchQuery(searchParam); newFilters.emitenteNome = searchParam }
    if (Object.keys(newFilters).length > 0) fetchNotas(newFilters)
  }, [searchParams])

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchQuery) {
        fetchNotas({ ...filtros, emitenteNome: searchQuery })
      } else if (filtros.emitenteNome) {
        const { emitenteNome, ...rest } = filtros as any
        fetchNotas(rest)
      }
    }, 400)
    return () => clearTimeout(timeout)
  }, [searchQuery])

  // Refetch on date range change
  useEffect(() => {
    if (dateRange?.from || dateRange?.to) {
      fetchNotas({
        ...filtros,
        periodoInicio: dateRange?.from?.toISOString(),
        periodoFim: dateRange?.to?.toISOString(),
      })
    }
  }, [dateRange])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      selecionarTodas(notas.map(n => n.id))
    } else {
      limparSelecao()
    }
  }

  const handleDownload = async (nota: NotaFiscal, tipo: 'xml' | 'pdf' | 'ambos') => {
    setActionLoading(true)
    try {
      if (tipo === 'xml' || tipo === 'ambos') {
        const blob = await notasFiscaisService.downloadXml(nota.id)
        downloadFile(blob, `${nota.chaveAcesso}-nfe.xml`)
      }
      if (tipo === 'pdf' || tipo === 'ambos') {
        // PDF download — uses same endpoint for now
        const blob = await notasFiscaisService.downloadXml(nota.id)
        downloadFile(blob, `${nota.chaveAcesso}-danfe.pdf`)
      }
      toast.success('Download realizado com sucesso')
    } catch (err) {
      toast.error('Falha ao realizar download')
    } finally {
      setActionLoading(false)
      setShowDownloadDialog(false)
    }
  }

  const handleManifestacao = async (nota: NotaFiscal, tipo: string) => {
    setActionLoading(true)
    try {
      await notasFiscaisService.manifestar(nota.id, { tipo } as ManifestarDto)
      toast.success(`Manifestação "${tipo}" registrada com sucesso`)
      fetchNotas(filtros)
    } catch (err) {
      toast.error('Falha ao registrar manifestação')
    } finally {
      setActionLoading(false)
      setShowManifestacaoDialog(false)
    }
  }

  const handleBatchDownload = () => {
    const selectedNotasList = notas.filter(n => notasSelecionadas.includes(n.id))
    toast.info(`Download em lote de ${selectedNotasList.length} notas será iniciado.`)
    limparSelecao()
  }

  const handleBatchManifestacao = async (tipo: string) => {
    setActionLoading(true)
    try {
      await Promise.all(
        notasSelecionadas.map(id =>
          notasFiscaisService.manifestar(id, { tipo } as ManifestarDto)
        )
      )
      toast.success(`${notasSelecionadas.length} manifestações registradas`)
      fetchNotas(filtros)
      limparSelecao()
    } catch (err) {
      toast.error('Falha ao registrar manifestações em lote')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notas Fiscais</h1>
          <p className="text-muted-foreground">
            Consulte, visualize e gerencie suas notas fiscais eletrônicas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/manifestacao')}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Manifestação
          </Button>
          <Button onClick={() => navigate('/consulta-sefaz')}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Consultar SEFAZ
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por fornecedor, CNPJ, chave ou número..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-[240px]">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'dd/MM/yyyy')} - {format(dateRange.to, 'dd/MM/yyyy')}
                      </>
                    ) : (
                      format(dateRange.from, 'dd/MM/yyyy')
                    )
                  ) : (
                    'Selecionar período'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  locale={ptBR}
                />
              </PopoverContent>
            </Popover>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(showFilters && 'bg-muted')}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>

            {(searchQuery || dateRange?.from || Object.keys(filtros).length > 0) && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery('')
                  setDateRange(undefined)
                  setFiltros({})
                }}
              >
                Limpar filtros
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t grid grid-cols-4 gap-4">
              <div>
                <Label className="text-xs">Tipo de Documento</Label>
                <Select
                  value={filtros.tipo || 'all'}
                  onValueChange={(v) => setFiltros({ ...filtros, tipo: v === 'all' ? undefined : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="NFe">NF-e</SelectItem>
                    <SelectItem value="CTe">CT-e</SelectItem>
                    <SelectItem value="NFCe">NFC-e</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Status SEFAZ</Label>
                <Select
                  value={filtros.statusSefaz || 'all'}
                  onValueChange={(v) => setFiltros({ ...filtros, statusSefaz: v === 'all' ? undefined : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="autorizada">Autorizada</SelectItem>
                    <SelectItem value="cancelada">Cancelada</SelectItem>
                    <SelectItem value="denegada">Denegada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Manifestação</Label>
                <Select
                  value={filtros.statusManifestacao || 'all'}
                  onValueChange={(v) => setFiltros({ ...filtros, statusManifestacao: v === 'all' ? undefined : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="ciencia">Ciência</SelectItem>
                    <SelectItem value="confirmada">Confirmada</SelectItem>
                    <SelectItem value="desconhecida">Desconhecida</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Tags</Label>
                <Select
                  value={filtros.tags?.[0] || 'all'}
                  onValueChange={(v) => setFiltros({ ...filtros, tags: v === 'all' ? undefined : [v] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {tags.map(tag => (
                      <SelectItem key={tag.id} value={tag.nome}>{tag.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Batch Actions */}
      {notasSelecionadas.length > 0 && (
        <Card className="bg-muted/50 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-medium">
                  {notasSelecionadas.length} nota(s) selecionada(s)
                </span>
                <Button variant="ghost" size="sm" onClick={limparSelecao}>
                  Limpar seleção
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Manifestar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleBatchManifestacao('ciencia')}>
                      Ciência da Emissão
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBatchManifestacao('confirmada')}>
                      Confirmação da Operação
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBatchManifestacao('desconhecida')}>
                      Desconhecimento
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBatchManifestacao('nao_realizada')}>
                      Operação Não Realizada
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Tag className="mr-2 h-4 w-4" />
                      Adicionar Tag
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {tags.map(tag => (
                      <DropdownMenuItem key={tag.id}>
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: tag.cor }}
                        />
                        {tag.nome}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button variant="outline" size="sm" onClick={handleBatchDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      <Card>
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle>Resultados ({meta.total})</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Exportar Excel
              </Button>
              <Button variant="outline" size="sm">
                <FileDown className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={notas.length > 0 && notas.every((n: NotaFiscal) => notasSelecionadas.includes(n.id))}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Número</TableHead>
                <TableHead>Emitente</TableHead>
                <TableHead>Data Emissão</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status SEFAZ</TableHead>
                <TableHead>Manifestação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>{loading ? 'Carregando...' : 'Nenhuma nota fiscal encontrada'}</p>
                    <p className="text-sm">Tente ajustar os filtros de busca</p>
                  </TableCell>
                </TableRow>
              ) : (
                notas.map((nota: NotaFiscal) => (
                  <TableRow key={nota.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={notasSelecionadas.includes(nota.id)}
                        onCheckedChange={() => toggleNotaSelecionada(nota.id)}
                      />
                    </TableCell>
                    <TableCell onClick={() => { setSelectedNota(nota); setShowDetailDialog(true) }}>
                      <Badge variant="outline">{getStatusLabel(nota.tipo)}</Badge>
                    </TableCell>
                    <TableCell onClick={() => { setSelectedNota(nota); setShowDetailDialog(true) }}>
                      <div className="font-medium">{nota.numero}</div>
                      <div className="text-xs text-muted-foreground">Série {nota.serie}</div>
                    </TableCell>
                    <TableCell onClick={() => { setSelectedNota(nota); setShowDetailDialog(true) }}>
                      <div className="font-medium truncate max-w-[200px]">{nota.emitenteNome}</div>
                      <div className="text-xs text-muted-foreground">{formatCNPJCPF(nota.emitenteCnpj)}</div>
                    </TableCell>
                    <TableCell onClick={() => { setSelectedNota(nota); setShowDetailDialog(true) }}>
                      {formatDate(nota.dataEmissao)}
                    </TableCell>
                    <TableCell onClick={() => { setSelectedNota(nota); setShowDetailDialog(true) }}>
                      <span className="font-medium">{formatCurrency(nota.valorTotal)}</span>
                    </TableCell>
                    <TableCell onClick={() => { setSelectedNota(nota); setShowDetailDialog(true) }}>
                      <Badge className={getStatusColor(nota.statusSefaz)}>
                        {getStatusLabel(nota.statusSefaz)}
                      </Badge>
                    </TableCell>
                    <TableCell onClick={() => { setSelectedNota(nota); setShowDetailDialog(true) }}>
                      <Badge
                        variant="outline"
                        className={cn(
                          nota.statusManifestacao === 'confirmada' && 'border-green-500 text-green-600',
                          nota.statusManifestacao === 'pendente' && 'border-yellow-500 text-yellow-600',
                          nota.statusManifestacao === 'desconhecida' && 'border-purple-500 text-purple-600',
                          nota.statusManifestacao === 'nao_realizada' && 'border-red-500 text-red-600',
                          nota.statusManifestacao === 'desacordo' && 'border-orange-500 text-orange-600',
                        )}
                      >
                        {getStatusLabel(nota.statusManifestacao)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => { setSelectedNota(nota); setShowDetailDialog(true) }}>
                            <Eye className="mr-2 h-4 w-4" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setSelectedNota(nota); setShowDownloadDialog(true) }}>
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => { setSelectedNota(nota); setShowManifestacaoDialog(true) }}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Manifestar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between p-4 border-t">
            <p className="text-sm text-muted-foreground">
              Mostrando {notas.length} de {meta.total} resultados
            </p>
            {meta.hasMore && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchMore()}
                disabled={loading}
              >
                {loading ? 'Carregando...' : 'Carregar mais'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Nota Fiscal</DialogTitle>
            <DialogDescription>
              Visualize os detalhes completos da nota fiscal
            </DialogDescription>
          </DialogHeader>
          {selectedNota && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label className="text-xs text-muted-foreground">Chave de Acesso</Label>
                  <p className="font-mono text-sm">{formatChaveAcesso(selectedNota.chaveAcesso)}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Protocolo</Label>
                  <p className="font-mono text-sm">{selectedNota.protocoloAutorizacao || '-'}</p>
                </div>
              </div>

              {/* Emitente */}
              <div>
                <h4 className="font-semibold mb-2">Emitente</h4>
                <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label className="text-xs text-muted-foreground">Nome</Label>
                    <p className="font-medium">{selectedNota.emitenteNome}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">CNPJ</Label>
                    <p>{formatCNPJCPF(selectedNota.emitenteCnpj)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Inscrição Estadual</Label>
                    <p>{selectedNota.emitenteIe || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Cidade/UF</Label>
                    <p>{selectedNota.emitenteCidade} / {selectedNota.emitenteUf}</p>
                  </div>
                </div>
              </div>

              {/* Valores */}
              <div>
                <h4 className="font-semibold mb-2">Valores</h4>
                <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
                  <div>
                    <Label className="text-xs text-muted-foreground">Valor Total</Label>
                    <p className="text-lg font-bold text-primary">{formatCurrency(selectedNota.valorTotal)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Produtos</Label>
                    <p className="font-medium">{formatCurrency(selectedNota.valorProdutos || 0)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">ICMS</Label>
                    <p className="font-medium">{formatCurrency(selectedNota.valorIcms || 0)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Frete</Label>
                    <p className="font-medium">{formatCurrency(selectedNota.valorFrete || 0)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Desconto</Label>
                    <p className="font-medium">{formatCurrency(selectedNota.valorDesconto || 0)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Outras Despesas</Label>
                    <p className="font-medium">{formatCurrency(selectedNota.valorOutras || 0)}</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {selectedNota.tags && selectedNota.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedNota.tags.map(tag => (
                      <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Fechar
            </Button>
            <Button onClick={() => selectedNota && handleDownload(selectedNota, 'ambos')}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manifestacao Dialog */}
      <Dialog open={showManifestacaoDialog} onOpenChange={setShowManifestacaoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manifestação do Destinatário</DialogTitle>
            <DialogDescription>
              Escolha o tipo de manifestação para a nota {selectedNota?.numero}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={() => selectedNota && handleManifestacao(selectedNota, 'ciencia')}
            >
              <HelpCircle className="mr-3 h-5 w-5 text-blue-500" />
              <div className="text-left">
                <p className="font-medium">Ciência da Emissão</p>
                <p className="text-sm text-muted-foreground">Tomei ciência da operação</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={() => selectedNota && handleManifestacao(selectedNota, 'confirmada')}
            >
              <CheckCircle className="mr-3 h-5 w-5 text-green-500" />
              <div className="text-left">
                <p className="font-medium">Confirmação da Operação</p>
                <p className="text-sm text-muted-foreground">Confirmo a realização da operação</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={() => selectedNota && handleManifestacao(selectedNota, 'desconhecida')}
            >
              <HelpCircle className="mr-3 h-5 w-5 text-purple-500" />
              <div className="text-left">
                <p className="font-medium">Desconhecimento da Operação</p>
                <p className="text-sm text-muted-foreground">Não reconheço esta operação</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={() => selectedNota && handleManifestacao(selectedNota, 'nao_realizada')}
            >
              <XCircle className="mr-3 h-5 w-5 text-red-500" />
              <div className="text-left">
                <p className="font-medium">Operação Não Realizada</p>
                <p className="text-sm text-muted-foreground">A operação não foi realizada</p>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Download Dialog */}
      <Dialog open={showDownloadDialog} onOpenChange={setShowDownloadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Download de Arquivos</DialogTitle>
            <DialogDescription>
              Escolha o formato de download para a nota {selectedNota?.numero}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={() => selectedNota && handleDownload(selectedNota, 'xml')}
            >
              <FileText className="mr-3 h-5 w-5 text-blue-500" />
              <div className="text-left">
                <p className="font-medium">XML da Nota Fiscal</p>
                <p className="text-sm text-muted-foreground">Arquivo XML oficial da SEFAZ</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={() => selectedNota && handleDownload(selectedNota, 'pdf')}
            >
              <FileText className="mr-3 h-5 w-5 text-red-500" />
              <div className="text-left">
                <p className="font-medium">DANFe / DACTe</p>
                <p className="text-sm text-muted-foreground">Documento auxiliar em PDF</p>
              </div>
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start h-auto py-4"
              onClick={() => selectedNota && handleDownload(selectedNota, 'ambos')}
            >
              <Download className="mr-3 h-5 w-5 text-green-500" />
              <div className="text-left">
                <p className="font-medium">Ambos (ZIP)</p>
                <p className="text-sm text-muted-foreground">XML e PDF em arquivo compactado</p>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
