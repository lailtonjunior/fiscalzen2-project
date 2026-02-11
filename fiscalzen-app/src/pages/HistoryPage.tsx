import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, History, Search, FileText, User, Building2, Settings, AlertCircle } from 'lucide-react';
import { historicoService, type AuditLog, type HistoricoFilters } from '@/services/historico.service';

const actionIcons: Record<string, React.ElementType> = {
    'nfe': FileText,
    'nota_fiscal': FileText,
    'usuario': User,
    'empresa': Building2,
    'config': Settings,
    'fornecedor': Building2,
    'tag': Settings,
};

const actionColors: Record<string, string> = {
    'criar': 'bg-green-500',
    'create': 'bg-green-500',
    'editar': 'bg-blue-500',
    'update': 'bg-blue-500',
    'excluir': 'bg-red-500',
    'delete': 'bg-red-500',
    'login': 'bg-purple-500',
    'logout': 'bg-gray-500',
    'manifestar': 'bg-yellow-500',
    'importar': 'bg-blue-400',
};

export function HistoryPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState<string>('all');

    useEffect(() => {
        loadLogs();
    }, [filterAction]);

    const loadLogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const filters: HistoricoFilters = { take: 50 };
            if (filterAction !== 'all') filters.acao = filterAction;
            const result = await historicoService.getAll(filters);
            setLogs(result.data);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao carregar histórico');
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
            log.entidade?.toLowerCase().includes(term) ||
            log.acao?.toLowerCase().includes(term) ||
            log.entidadeId?.toLowerCase().includes(term)
        );
    });

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <p className="text-destructive">{error}</p>
                <Button onClick={loadLogs}>Tentar novamente</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Histórico</h1>
                <p className="text-muted-foreground">Acompanhe todas as atividades do sistema</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por entidade ou descrição..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={filterAction} onValueChange={setFilterAction}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar por ação" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas as ações</SelectItem>
                        <SelectItem value="create">Criar</SelectItem>
                        <SelectItem value="update">Editar</SelectItem>
                        <SelectItem value="delete">Excluir</SelectItem>
                        <SelectItem value="login">Login</SelectItem>
                        <SelectItem value="manifestar">Manifestar</SelectItem>
                        <SelectItem value="importar">Importar</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        <CardTitle>Log de Atividades</CardTitle>
                    </div>
                    <CardDescription>{filteredLogs.length} registro(s) encontrado(s)</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Data/Hora</TableHead>
                                <TableHead>Ação</TableHead>
                                <TableHead>Entidade</TableHead>
                                <TableHead>ID</TableHead>
                                <TableHead>IP</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredLogs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        Nenhum registro encontrado
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredLogs.map((log) => {
                                    const Icon = actionIcons[log.entidade] || History;
                                    const colorKey = log.acao?.toLowerCase() || '';
                                    return (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-mono text-sm">
                                                {formatDate(log.createdAt)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${actionColors[colorKey] || 'bg-gray-500'} text-white`}>
                                                    {log.acao}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                                    {log.entidade}
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate font-mono text-sm">
                                                {log.entidadeId || '-'}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm text-muted-foreground">
                                                {log.ipOrigem || '-'}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
