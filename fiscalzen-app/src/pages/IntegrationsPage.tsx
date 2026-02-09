import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plug, Plus, Webhook, Key, ExternalLink, Trash2, Copy, RefreshCw } from 'lucide-react';

interface Webhook {
    id: string;
    nome: string;
    url: string;
    eventos: string[];
    ativo: boolean;
    ultimaChamada?: string;
}

interface ApiKey {
    id: string;
    nome: string;
    chave: string;
    criadaEm: string;
    ultimoUso?: string;
}

// Mock data
const mockWebhooks: Webhook[] = [
    { id: '1', nome: 'ERP Principal', url: 'https://erp.empresa.com/webhook/nfe', eventos: ['nfe.autorizada', 'nfe.cancelada'], ativo: true, ultimaChamada: '2026-02-09T00:30:00Z' },
    { id: '2', nome: 'Sistema Contábil', url: 'https://contabil.com/api/fiscal', eventos: ['nfe.autorizada'], ativo: false },
];

const mockApiKeys: ApiKey[] = [
    { id: '1', nome: 'App Mobile', chave: 'fz_live_xxxx...xxxx1234', criadaEm: '2026-01-15', ultimoUso: '2026-02-08' },
    { id: '2', nome: 'Integração ERP', chave: 'fz_live_xxxx...xxxx5678', criadaEm: '2026-02-01' },
];

const EVENTOS_DISPONIVEIS = [
    { id: 'nfe.autorizada', label: 'NFe Autorizada' },
    { id: 'nfe.cancelada', label: 'NFe Cancelada' },
    { id: 'nfe.rejeitada', label: 'NFe Rejeitada' },
    { id: 'manifestacao.nova', label: 'Nova Manifestação' },
];

export function IntegrationsPage() {
    const [webhooks, setWebhooks] = useState<Webhook[]>(mockWebhooks);
    const [apiKeys, setApiKeys] = useState<ApiKey[]>(mockApiKeys);
    const [webhookDialogOpen, setWebhookDialogOpen] = useState(false);
    const [newWebhookName, setNewWebhookName] = useState('');
    const [newWebhookUrl, setNewWebhookUrl] = useState('');
    const [selectedEventos, setSelectedEventos] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    const toggleWebhook = (id: string) => {
        setWebhooks(webhooks.map(w =>
            w.id === id ? { ...w, ativo: !w.ativo } : w
        ));
        toast.success('Status atualizado');
    };

    const deleteWebhook = (id: string) => {
        setWebhooks(webhooks.filter(w => w.id !== id));
        toast.success('Webhook removido');
    };

    const createWebhook = async () => {
        if (!newWebhookName || !newWebhookUrl || selectedEventos.length === 0) {
            toast.error('Preencha todos os campos');
            return;
        }

        setSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const newWebhook: Webhook = {
                id: Date.now().toString(),
                nome: newWebhookName,
                url: newWebhookUrl,
                eventos: selectedEventos,
                ativo: true,
            };
            setWebhooks([...webhooks, newWebhook]);
            toast.success('Webhook criado');
            resetWebhookForm();
        } catch {
            toast.error('Erro ao criar webhook');
        } finally {
            setSaving(false);
        }
    };

    const resetWebhookForm = () => {
        setNewWebhookName('');
        setNewWebhookUrl('');
        setSelectedEventos([]);
        setWebhookDialogOpen(false);
    };

    const createApiKey = async () => {
        setSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            const newKey: ApiKey = {
                id: Date.now().toString(),
                nome: `API Key ${apiKeys.length + 1}`,
                chave: `fz_live_${Math.random().toString(36).substring(2, 10)}...${Math.random().toString(36).substring(2, 6)}`,
                criadaEm: new Date().toISOString().split('T')[0],
            };
            setApiKeys([...apiKeys, newKey]);
            toast.success('Chave API criada');
        } catch {
            toast.error('Erro ao criar chave');
        } finally {
            setSaving(false);
        }
    };

    const deleteApiKey = (id: string) => {
        setApiKeys(apiKeys.filter(k => k.id !== id));
        toast.success('Chave removida');
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success('Copiado para a área de transferência');
    };

    const toggleEvento = (eventoId: string) => {
        setSelectedEventos(prev =>
            prev.includes(eventoId)
                ? prev.filter(e => e !== eventoId)
                : [...prev, eventoId]
        );
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Integrações</h1>
                <p className="text-muted-foreground">Configure webhooks e chaves de API</p>
            </div>

            {/* Webhooks Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Webhook className="h-5 w-5" />
                            <CardTitle>Webhooks</CardTitle>
                        </div>
                        <Dialog open={webhookDialogOpen} onOpenChange={setWebhookDialogOpen}>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <Plus className="mr-2 h-4 w-4" />
                                    Novo Webhook
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Novo Webhook</DialogTitle>
                                    <DialogDescription>Configure um endpoint para receber notificações</DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Nome</Label>
                                        <Input
                                            value={newWebhookName}
                                            onChange={(e) => setNewWebhookName(e.target.value)}
                                            placeholder="Ex: ERP Principal"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>URL do Endpoint</Label>
                                        <Input
                                            value={newWebhookUrl}
                                            onChange={(e) => setNewWebhookUrl(e.target.value)}
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Eventos</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {EVENTOS_DISPONIVEIS.map((evento) => (
                                                <Badge
                                                    key={evento.id}
                                                    variant={selectedEventos.includes(evento.id) ? 'default' : 'outline'}
                                                    className="cursor-pointer"
                                                    onClick={() => toggleEvento(evento.id)}
                                                >
                                                    {evento.label}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button variant="outline" onClick={resetWebhookForm}>Cancelar</Button>
                                    <Button onClick={createWebhook} disabled={saving}>
                                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Criar
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <CardDescription>Receba notificações em tempo real sobre eventos fiscais</CardDescription>
                </CardHeader>
                <CardContent>
                    {webhooks.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Plug className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Nenhum webhook configurado</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {webhooks.map((webhook) => (
                                <div key={webhook.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{webhook.nome}</span>
                                            <Badge variant={webhook.ativo ? 'default' : 'secondary'}>
                                                {webhook.ativo ? 'Ativo' : 'Inativo'}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-muted-foreground font-mono">{webhook.url}</p>
                                        <div className="flex gap-1 mt-2">
                                            {webhook.eventos.map((evento) => (
                                                <Badge key={evento} variant="outline" className="text-xs">
                                                    {evento}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch checked={webhook.ativo} onCheckedChange={() => toggleWebhook(webhook.id)} />
                                        <Button variant="ghost" size="icon" onClick={() => deleteWebhook(webhook.id)}>
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* API Keys Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Key className="h-5 w-5" />
                            <CardTitle>Chaves de API</CardTitle>
                        </div>
                        <Button size="sm" onClick={createApiKey} disabled={saving}>
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                            Nova Chave
                        </Button>
                    </div>
                    <CardDescription>Autentique suas integrações com chaves de API</CardDescription>
                </CardHeader>
                <CardContent>
                    {apiKeys.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Nenhuma chave de API criada</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {apiKeys.map((key) => (
                                <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="space-y-1">
                                        <span className="font-medium">{key.nome}</span>
                                        <div className="flex items-center gap-2">
                                            <code className="text-sm bg-muted px-2 py-1 rounded">{key.chave}</code>
                                            <Button variant="ghost" size="icon" onClick={() => copyToClipboard(key.chave)}>
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Criada em {key.criadaEm}
                                            {key.ultimoUso && ` • Último uso: ${key.ultimoUso}`}
                                        </p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => deleteApiKey(key.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Documentation Link */}
            <Card>
                <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium">Documentação da API</h4>
                            <p className="text-sm text-muted-foreground">Consulte a documentação completa da nossa API</p>
                        </div>
                        <Button variant="outline" asChild>
                            <a href="/api" target="_blank">
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Abrir Docs
                            </a>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
