
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/services/api';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  CalendarIcon,
  DownloadIcon,
  FileSpreadsheet,
  FileText,
  DollarSign,
  TrendingUp,
  Truck,
  Building2,
  MapPin,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { cn, formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function Relatorios() {
  const [reportType, setReportType] = useState('resumo-mensal');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    to: new Date(),
  });
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [reportType, dateRange]);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const start = dateRange.from ? dateRange.from.toISOString() : new Date().toISOString();
      const end = dateRange.to ? dateRange.to.toISOString() : new Date().toISOString();

      let endpoint = '';
      switch (reportType) {
        case 'resumo-mensal': endpoint = `/relatorios/resumo-mensal?start=${start}&end=${end}`; break;
        case 'impostos': endpoint = `/relatorios/impostos?start=${start}&end=${end}`; break;
        case 'fornecedores': endpoint = `/relatorios/notas-por-fornecedor?start=${start}&end=${end}`; break;
        case 'manifestacoes': endpoint = `/relatorios/manifestacoes-pendentes`; break;
        case 'sped': endpoint = `/relatorios/conferencia-sped`; break;
        default: endpoint = `/relatorios/resumo-mensal?start=${start}&end=${end}`;
      }

      const response = await api.get(endpoint);
      setData(response.data);
    } catch (error) {
      console.error(error);
      toast.error('Erro ao carregar relatório');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'xlsx') => {
    try {
      toast.info(`Gerando ${format.toUpperCase()}...`);
      const start = dateRange.from.toISOString();
      const end = dateRange.to.toISOString();

      let endpoint = '';
      switch (reportType) {
        case 'resumo-mensal': endpoint = `/relatorios/resumo-mensal?start=${start}&end=${end}&format=${format}`; break;
        case 'impostos': endpoint = `/relatorios/impostos?start=${start}&end=${end}&format=${format}`; break;
        case 'fornecedores': endpoint = `/relatorios/notas-por-fornecedor?start=${start}&end=${end}&format=${format}`; break;
        case 'manifestacoes': endpoint = `/relatorios/manifestacoes-pendentes?format=${format}`; break;
        case 'sped': endpoint = `/relatorios/conferencia-sped?format=${format}`; break;
        default: endpoint = `/relatorios/resumo-mensal?start=${start}&end=${end}&format=${format}`;
      }

      const response = await api.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio-${reportType}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Download concluído');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao exportar relatório');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios Avancados</h1>
          <p className="text-muted-foreground">Análises detalhadas e exportação de dados.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExport('xlsx')}><FileSpreadsheet className="mr-2 h-4 w-4" /> Excel</Button>
          <Button variant="default" onClick={() => handleExport('pdf')}><DownloadIcon className="mr-2 h-4 w-4" /> PDF</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuração</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 flex-wrap items-center">
          <div className="w-[250px]">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Relatório" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="resumo-mensal">Resumo Mensal de NFe</SelectItem>
                <SelectItem value="impostos">Detalhamento de Impostos</SelectItem>
                <SelectItem value="fornecedores">Notas por Fornecedor</SelectItem>
                <SelectItem value="manifestacoes">Manifestações Pendentes</SelectItem>
                <SelectItem value="sped">Conferência SPED</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!['manifestacoes', 'sped'].includes(reportType) && (
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y", { locale: ptBR })} -{" "}
                          {format(dateRange.to, "LLL dd, y", { locale: ptBR })}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y", { locale: ptBR })
                      )
                    ) : (
                      <span>Selecione o período</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange.from}
                    selected={dateRange as any}
                    onSelect={(val: any) => setDateRange(val || { from: new Date(), to: new Date() })}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}

          <Button onClick={fetchReport} disabled={loading}>
            {loading ? 'Carregando...' : 'Atualizar'}
          </Button>
        </CardContent>
      </Card>

      {/* Dynamic Content based on report type */}
      {data && (
        <div className="space-y-6">
          <ReportPreview type={reportType} data={data} />
        </div>
      )}
    </div>
  );
}

function ReportPreview({ type, data }: { type: string, data: any }) {
  if (!data) return null;

  if (type === 'resumo-mensal') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SummaryCard title="Total de Notas" value={data.total?.count || 0} icon={FileText} color="bg-blue-100 text-blue-600" />
          <SummaryCard title="Valor Total" value={formatCurrency(data.total?.value || 0)} icon={DollarSign} color="bg-green-100 text-green-600" />
        </div>

        <Card>
          <CardHeader><CardTitle>Status</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Qtd" />
                <Bar dataKey="value" fill="#82ca9d" name="Valor" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top Emitentes</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.byIssuer} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="issuer" type="category" width={150} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#82ca9d" name="Valor Total" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (type === 'impostos') {
    // Assuming list of notes
    const rows = Array.isArray(data) ? data : [];
    const totalIcms = rows.reduce((acc: number, r: any) => acc + (Number(r.valorIcms) || 0), 0);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4">
          <SummaryCard title="Total ICMS do Período" value={formatCurrency(totalIcms)} icon={TrendingUp} color="bg-purple-100 text-purple-600" />
        </div>
        <Card>
          <CardHeader><CardTitle>Detalhamento</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted">
                  <tr>
                    <th className="p-2">Número</th>
                    <th className="p-2">Emissão</th>
                    <th className="p-2">Emitente</th>
                    <th className="p-2 text-right">Valor Total</th>
                    <th className="p-2 text-right">ICMS</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row: any) => (
                    <tr key={row.id || Math.random()} className="border-b">
                      <td className="p-2">{row.numero}</td>
                      <td className="p-2">{new Date(row.dataEmissao).toLocaleDateString()}</td>
                      <td className="p-2">{row.emitenteNome}</td>
                      <td className="p-2 text-right">{formatCurrency(row.valorTotal)}</td>
                      <td className="p-2 text-right">{formatCurrency(row.valorIcms)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (type === 'fornecedores') {
    const rows = Array.isArray(data) ? data : [];
    return (
      <Card>
        <CardHeader><CardTitle>Performance de Fornecedores</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2">CNPJ</th>
                  <th className="p-2">Fornecedor</th>
                  <th className="p-2 text-right">Qtd Notas</th>
                  <th className="p-2 text-right">Valor Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row: any, i: number) => (
                  <tr key={i} className="border-b">
                    <td className="p-2">{row.cnpj}</td>
                    <td className="p-2">{row.nome}</td>
                    <td className="p-2 text-right">{row.qtd}</td>
                    <td className="p-2 text-right">{formatCurrency(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (type === 'manifestacoes' || type === 'sped') {
    const rows = Array.isArray(data) ? data : [];
    return (
      <Card>
        <CardHeader><CardTitle>{type === 'sped' ? 'Divergências SPED' : 'Pendências'}</CardTitle></CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-auto max-h-[400px]">
            {JSON.stringify(rows, null, 2)}
          </pre>
        </CardContent>
      </Card>
    )
  }

  return null;
}

function SummaryCard({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) {
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
