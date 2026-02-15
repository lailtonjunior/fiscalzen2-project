import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotasStore } from '@/stores/useNotasStore'

import { cn, formatCurrency, formatDate, getStatusLabel } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts'
import {
  FileText,
  BarChart3,
  Building2,
  TrendingUp,
  Download,
  FileSpreadsheet,
  FileDown,
  Calendar,
  Filter,
  PieChart as PieChartIcon,
  DollarSign,
  Truck,
  MapPin
} from 'lucide-react'
// Dados para gráficos (Mock)
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

// const mockGraficoStatusManifestacao = ... (Used in Dashboard, not here? Wait, Relatorios DOES use it?)
// Checking usage: Relatorios uses imports but let's check if it USES them.
// It imports: mockGraficoNotasPorMes, mockGraficoValorPorMes, mockGraficoStatusManifestacao, mockGraficoTopFornecedores
// Usage: 
// <BarChart data={mockGraficoNotasPorMes...
// <LineChart data={mockGraficoValorPorMes...
// <PieChart data={dadosPorTipo... (Calculated from notas)
// Wait! Relatorios calculates `dadosPorTipo` from `notas`, but ignores `mockGraficoStatusManifestacao`?
// Let's check the file content I saw.
// It uses `dadosPorTipo` for PieChart.
// It uses `mockGraficoNotasPorMes` for BarChart.
// It uses `mockGraficoValorPorMes` for LineChart.
// It DOES NOT seem to use `mockGraficoStatusManifestacao` or `mockGraficoTopFornecedores` in the visible JSX logic I saw?
// Wait, Top Fornecedores tab:
// <BarChart data={topFornecedores.slice(0, 5)...
// It calculates `topFornecedores` from `notas`.
// So `Relatorios.tsx` only uses `mockGraficoNotasPorMes` and `mockGraficoValorPorMes`?
// Let's verify.


const COLORS = ['#3b82f6', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#f97316']

export function Relatorios() {
  const navigate = useNavigate()
  const { notas } = useNotasStore()
  const [periodo, setPeriodo] = useState('30d')
  const [activeTab, setActiveTab] = useState('geral')

  // Calculate stats
  const totalValor = notas.reduce((acc, n) => acc + n.valorTotal, 0)
  const totalIcms = notas.reduce((acc, n) => acc + (n.valorIcms || 0), 0)
  const totalFrete = notas.reduce((acc, n) => acc + (n.valorFrete || 0), 0)

  // Group by emitente
  const fornecedores = notas.reduce((acc, nota) => {
    const key = nota.emitenteCnpj
    if (!acc[key]) {
      acc[key] = {
        cnpj: nota.emitenteCnpj,
        nome: nota.emitenteNome,
        notas: 0,
        valor: 0,
        cidade: nota.emitenteCidade,
        uf: nota.emitenteUf
      }
    }
    acc[key].notas++
    acc[key].valor += nota.valorTotal
    return acc
  }, {} as Record<string, any>)

  const topFornecedores = Object.values(fornecedores)
    .sort((a: any, b: any) => b.valor - a.valor)
    .slice(0, 10)

  // Group by UF
  const notasPorUF = notas.reduce((acc, nota) => {
    const uf = nota.emitenteUf || 'ND'
    acc[uf] = (acc[uf] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const dadosPorUF = Object.entries(notasPorUF)
    .map(([uf, quantidade]) => ({ uf, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade)

  // Group by tipo
  const notasPorTipo = notas.reduce((acc, nota) => {
    acc[nota.tipo] = (acc[nota.tipo] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const dadosPorTipo = Object.entries(notasPorTipo)
    .map(([tipo, quantidade]) => ({ tipo: getStatusLabel(tipo), quantidade }))

  const handleExportExcel = () => {
    // Mock export
    alert('Exportação para Excel será iniciada.')
  }

  const handleExportPDF = () => {
    // Mock export
    alert('Exportação para PDF será iniciada.')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Análises e relatórios avançados das suas notas fiscais
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={periodo} onValueChange={setPeriodo}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
              <SelectItem value="custom">Personalizado</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <FileDown className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <SummaryCard
          title="Total de Notas"
          value={notas.length.toLocaleString('pt-BR')}
          icon={FileText}
          color="bg-blue-100 text-blue-600"
        />
        <SummaryCard
          title="Valor Total"
          value={formatCurrency(totalValor)}
          icon={DollarSign}
          color="bg-green-100 text-green-600"
        />
        <SummaryCard
          title="Total de ICMS"
          value={formatCurrency(totalIcms)}
          icon={TrendingUp}
          color="bg-purple-100 text-purple-600"
        />
        <SummaryCard
          title="Total de Frete"
          value={formatCurrency(totalFrete)}
          icon={Truck}
          color="bg-orange-100 text-orange-600"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="geral">
            <BarChart3 className="mr-2 h-4 w-4" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="fornecedores">
            <Building2 className="mr-2 h-4 w-4" />
            Fornecedores
          </TabsTrigger>
          <TabsTrigger value="tributos">
            <TrendingUp className="mr-2 h-4 w-4" />
            Tributos
          </TabsTrigger>
          <TabsTrigger value="geografico">
            <MapPin className="mr-2 h-4 w-4" />
            Geográfico
          </TabsTrigger>
        </TabsList>

        {/* Geral Tab */}
        <TabsContent value="geral" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Notas por Mês */}
            <Card>
              <CardHeader>
                <CardTitle>Notas por Tipo</CardTitle>
                <CardDescription>Distribuição mensal de NFe e CTe</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mockGraficoNotasPorMes.labels.map((label, i) => ({
                    name: label,
                    NFe: mockGraficoNotasPorMes.datasets[0].data[i],
                    CTe: mockGraficoNotasPorMes.datasets[1].data[i]
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [value.toLocaleString('pt-BR'), '']} />
                    <Legend />
                    <Bar dataKey="NFe" fill="#3b82f6" />
                    <Bar dataKey="CTe" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Notas por Tipo (Pie) */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Tipo</CardTitle>
                <CardDescription>Proporção de documentos fiscais</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={dadosPorTipo}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="quantidade"
                      nameKey="tipo"
                      label={({ tipo, percent }) => `${tipo}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {dadosPorTipo.map((_, i) => (
                        <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Quantidade']} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Valor por Mês */}
          <Card>
            <CardHeader>
              <CardTitle>Evolução do Valor</CardTitle>
              <CardDescription>Valor total das notas ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockGraficoValorPorMes.labels.map((label, i) => ({
                  name: label,
                  valor: mockGraficoValorPorMes.datasets[0].data[i]
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `R$ ${(value / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={(value: number) => [formatCurrency(value), 'Valor']} />
                  <Line type="monotone" dataKey="valor" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fornecedores Tab */}
        <TabsContent value="fornecedores" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Top Fornecedores Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Top Fornecedores</CardTitle>
                <CardDescription>Fornecedores com maior volume de compras</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={topFornecedores.slice(0, 5).map((f: any) => ({
                      nome: f.nome.split(' ')[0],
                      valor: f.valor
                    }))}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="nome" width={100} />
                    <Tooltip formatter={(value: number) => [formatCurrency(value), 'Valor']} />
                    <Bar dataKey="valor" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Fornecedores List */}
            <Card>
              <CardHeader>
                <CardTitle>Lista de Fornecedores</CardTitle>
                <CardDescription>Detalhamento por fornecedor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {topFornecedores.map((fornecedor: any, i: number) => (
                    <div key={fornecedor.cnpj} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{fornecedor.nome}</p>
                          <p className="text-xs text-muted-foreground">{fornecedor.cnpj}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{formatCurrency(fornecedor.valor)}</p>
                        <p className="text-xs text-muted-foreground">{fornecedor.notas} notas</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tributos Tab */}
        <TabsContent value="tributos" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>ICMS</CardTitle>
                <CardDescription>Total de ICMS nas notas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <p className="text-4xl font-bold text-primary">{formatCurrency(totalIcms)}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Média: {formatCurrency(totalIcms / notas.length)} por nota
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>IPI</CardTitle>
                <CardDescription>Total de IPI nas notas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <p className="text-4xl font-bold text-primary">
                    {formatCurrency(notas.reduce((acc, n) => acc + (n.valorIpi || 0), 0))}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Média: {formatCurrency(notas.reduce((acc, n) => acc + (n.valorIpi || 0), 0) / notas.length)} por nota
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>PIS/COFINS</CardTitle>
                <CardDescription>Total de PIS e COFINS</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <p className="text-4xl font-bold text-primary">
                    {formatCurrency(notas.reduce((acc, n) => acc + (n.valorPis || 0) + (n.valorCofins || 0), 0))}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Contribuições sociais
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Análise Tributária por CFOP</CardTitle>
              <CardDescription>Distribuição de valores por Código Fiscal de Operações</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4">CFOP</th>
                      <th className="text-left py-2 px-4">Descrição</th>
                      <th className="text-right py-2 px-4">Quantidade</th>
                      <th className="text-right py-2 px-4">Valor Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 px-4 font-medium">5102</td>
                      <td className="py-2 px-4">Venda de Mercadoria</td>
                      <td className="py-2 px-4 text-right">156</td>
                      <td className="py-2 px-4 text-right">{formatCurrency(4523000)}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-4 font-medium">6102</td>
                      <td className="py-2 px-4">Venda Fora do Estado</td>
                      <td className="py-2 px-4 text-right">89</td>
                      <td className="py-2 px-4 text-right">{formatCurrency(2156000)}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-4 font-medium">1551</td>
                      <td className="py-2 px-4">Compra de Ativo</td>
                      <td className="py-2 px-4 text-right">23</td>
                      <td className="py-2 px-4 text-right">{formatCurrency(1250000)}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-4 font-medium">6108</td>
                      <td className="py-2 px-4">Transferência</td>
                      <td className="py-2 px-4 text-right">45</td>
                      <td className="py-2 px-4 text-right">{formatCurrency(890000)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geográfico Tab */}
        <TabsContent value="geografico" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Notas por UF */}
            <Card>
              <CardHeader>
                <CardTitle>Notas por Estado</CardTitle>
                <CardDescription>Distribuição geográfica dos fornecedores</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dadosPorUF.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="uf" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Notas']} />
                    <Bar dataKey="quantidade" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* UF List */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Estado</CardTitle>
                <CardDescription>Quantidade de notas por UF</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {dadosPorUF.map((item, i) => (
                    <div key={item.uf} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{item.uf}</Badge>
                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${(item.quantidade / dadosPorUF[0].quantidade) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="font-medium">{item.quantidade}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface SummaryCardProps {
  title: string
  value: string
  icon: React.ElementType
  color: string
}

function SummaryCard({ title, value, icon: Icon, color }: SummaryCardProps) {
  const [bgColor, textColor] = color.split(' ')
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center", bgColor)}>
            <Icon className={cn("h-6 w-6", textColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
