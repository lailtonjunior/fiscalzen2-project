import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, History, Search, FileText, User, Building2, Settings } from 'lucide-react';

interface LogEntry {
    id: string;
    acao: string;
    entidade: string;
    entidadeId: string;
    usuario: string;
    detalhes: string;
    ip: string;
    createdAt: string;
}

const actionIcons: Record<string, React.ElementType> = {
    'nfe': FileText,
    'usuario': User,
    'empresa': Building2,
    'config': Settings,
};

const actionColors: Record<string, string> = {
    'criar': 'bg-green-500',
    'editar': 'bg-blue-500',
    'excluir': 'bg-red-500',
    'login': 'bg-purple-500',
    'logout': 'bg-gray-500',
};

// Mock data
const mockLogs: LogEntry[] = [
    { id: '1', acao: 'criar', entidade: 'nfe', entidadeId: '43210...', usuario: 'João Silva', detalhes: 'NFe emitida com sucesso', ip: '192.168.1.100', createdAt: '2026-02-09T00:45:00Z' },
    { id: '2', acao: 'login', entidade: 'usuario', entidadeId: '-', usuario: 'Maria Santos', detalhes: 'Login realizado', ip: '192.168.1.101', createdAt: '2026-02-09T00:30:00Z' },
    { id: '3', acao: 'editar', entidade: 'empresa', entidadeId: 'EMP001', usuario: 'João Silva', detalhes: 'Dados da empresa atualizados', ip: '192.168.1.100', createdAt: '2026-02-08T23:15:00Z' },
    { id: '4', acao: 'criar', entidade: 'usuario', entidadeId: 'USR003', usuario: 'Admin', detalhes: 'Novo usuário cadastrado: Pedro', ip: '192.168.1.1', createdAt: '2026-02-08T22:00:00Z' },
    { id: '5', acao: 'excluir', entidade: 'nfe', entidadeId: '43209...', usuario: 'Maria Santos', detalhes: 'NFe cancelada', ip: '192.168.1.101', createdAt: '2026-02-08T21:30:00Z' },
];

export function HistoryPage() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState<string>('all');

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setLogs(mockLogs);
        } catch {
            console.error('Erro ao carregar histórico');
        } finally {
            setLoading(false);
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.detalhes.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterAction === 'all' || log.acao === filterAction;
        return matchesSearch && matchesFilter;
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
                        placeholder="Buscar por usuário ou descrição..."
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
                        <SelectItem value="criar">Criar</SelectItem>
                        <SelectItem value="editar">Editar</SelectItem>
                        <SelectItem value="excluir">Excluir</SelectItem>
                        <SelectItem value="login">Login</SelectItem>
                        <SelectItem value="logout">Logout</SelectItem>
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
                                <TableHead>Usuário</TableHead>
                                <TableHead>Descrição</TableHead>
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
                                    return (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-mono text-sm">
                                                {formatDate(log.createdAt)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`${actionColors[log.acao]} text-white`}>
                                                    {log.acao.charAt(0).toUpperCase() + log.acao.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Icon className="h-4 w-4 text-muted-foreground" />
                                                    {log.usuario}
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-[300px] truncate">
                                                {log.detalhes}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm text-muted-foreground">
                                                {log.ip}
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
