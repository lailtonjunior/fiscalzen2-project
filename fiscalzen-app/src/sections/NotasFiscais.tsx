import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useNotasStore, useTagsStore } from '@/hooks/useStore'
import { cn, formatCurrency, formatDate, formatCNPJCPF, formatChaveAcesso, getStatusLabel, getStatusColor, downloadFile } from '@/lib/utils'
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
import { CalendarIcon, Search, Filter, Download, FileText, MoreHorizontal, Eye, CheckCircle, XCircle, HelpCircle, Tag, Trash2, FileSpreadsheet, FileDown, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { DateRange } from 'react-day-picker'
import type { NotaFiscal } from '@/types'

const ITEMS_PER_PAGE = 10

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
    filtrarNotas,
    atualizarStatusManifestacao
  } = useNotasStore()
  const { tags } = useTagsStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date()
  })
  const [selectedNota, setSelectedNota] = useState<NotaFiscal | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showManifestacaoDialog, setShowManifestacaoDialog] = useState(false)
  const [showDownloadDialog, setShowDownloadDialog] = useState(false)

  // Apply URL params to filters
  useState(() => {
    const statusParam = searchParams.get('status')
    const manifestacaoParam = searchParams.get('manifestacao')
    const searchParam = searchParams.get('search')
    
    if (statusParam) {
      setFiltros({ ...filtros, statusSefaz: [statusParam as any] })
    }
    if (manifestacaoParam) {
      setFiltros({ ...filtros, statusManifestacao: [manifestacaoParam as any] })
    }
    if (searchParam) {
      setSearchQuery(searchParam)
    }
  })

  // Filter notas
  const filteredNotas = useMemo(() => {
    let result = filtrarNotas()
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(n => 
        n.emitenteNome.toLowerCase().includes(query) ||
        n.emitenteCnpj.includes(query) ||
        n.chaveAcesso.includes(query) ||
        n.numero.includes(query)
      )
    }
    
    if (dateRange?.from) {
      result = result.filter(n => new Date(n.dataEmissao) >= dateRange.from!)
    }
    if (dateRange?.to) {
      result = result.filter(n => new Date(n.dataEmissao) <= dateRange.to!)
    }
    
    return result.sort((a, b) => new Date(b.dataEmissao).getTime() - new Date(a.dataEmissao).getTime())
  }, [notas, filtros, searchQuery, dateRange])

  // Pagination
  const totalPages = Math.ceil(filteredNotas.length / ITEMS_PER_PAGE)
  const paginatedNotas = filteredNotas.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      selecionarTodas(paginatedNotas.map(n => n.id))
    } else {
      limparSelecao()
    }
  }

  const handleDownload = (nota: NotaFiscal, tipo: 'xml' | 'pdf' | 'ambos') => {
    // Mock download - in production, fetch from API
    const mockContent = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe>
    <infNFe Id="${nota.chaveAcesso}">
      <ide>
        <cUF>35</cUF>
        <cNF>${nota.numero}</cNF>
        <natOp>${nota.naturezaOperacao}</natOp>
        <mod>55</mod>
        <serie>${nota.serie}</serie>
        <nNF>${nota.numero}</nNF>
        <dhEmi>${nota.dataEmissao}</dhEmi>
      </ide>
    </infNFe>
  </NFe>
</nfeProc>`
    
    if (tipo === 'xml' || tipo === 'ambos') {
      downloadFile(mockContent, `${nota.chaveAcesso}-nfe.xml`, 'application/xml')
    }
    if (tipo === 'pdf' || tipo === 'ambos') {
      // Mock PDF download
      const blob = new Blob(['PDF content'], { type: 'application/pdf' })
      downloadFile(blob, `${nota.chaveAcesso}-danfe.pdf`)
    }
    setShowDownloadDialog(false)
  }

  const handleManifestacao = (nota: NotaFiscal, tipo: string) => {
    atualizarStatusManifestacao(nota.id, tipo)
    setShowManifestacaoDialog(false)
  }

  const handleBatchDownload = () => {
    // Mock batch download as ZIP
    const selectedNotasList = notas.filter(n => notasSelecionadas.includes(n.id))
    alert(`Download em lote de ${selectedNotasList.length} notas será iniciado.`)
    limparSelecao()
  }

  const handleBatchManifestacao = (tipo: string) => {
    notasSelecionadas.forEach(id => {
      atualizarStatusManifestacao(id, tipo)
    })
    limparSelecao()
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
                  value={filtros.tipo?.[0] || 'all'}
                  onValueChange={(v) => setFiltros({ ...filtros, tipo: v === 'all' ? undefined : [v as any] })}
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
                  value={filtros.statusSefaz?.[0] || 'all'}
                  onValueChange={(v) => setFiltros({ ...filtros, statusSefaz: v === 'all' ? undefined : [v as any] })}
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
                  value={filtros.statusManifestacao?.[0] || 'all'}
                  onValueChange={(v) => setFiltros({ ...filtros, statusManifestacao: v === 'all' ? undefined : [v as any] })}
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
            <CardTitle>Resultados ({filteredNotas.length})</CardTitle>
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
                    checked={paginatedNotas.length > 0 && paginatedNotas.every(n => notasSelecionadas.includes(n.id))}
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
              {paginatedNotas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma nota fiscal encontrada</p>
                    <p className="text-sm">Tente ajustar os filtros de busca</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedNotas.map((nota) => (
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
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredNotas.length)} de{' '}
                {filteredNotas.length} resultados
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
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
