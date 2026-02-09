import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Loader2, Bell, Check, Trash2, CheckCheck, FileText, AlertTriangle, Info } from 'lucide-react';

interface Notification {
    id: string;
    tipo: 'info' | 'warning' | 'success' | 'error';
    titulo: string;
    mensagem: string;
    lida: boolean;
    createdAt: string;
}

const typeIcons: Record<string, React.ElementType> = {
    'info': Info,
    'warning': AlertTriangle,
    'success': Check,
    'error': AlertTriangle,
};

const typeColors: Record<string, string> = {
    'info': 'bg-blue-500',
    'warning': 'bg-yellow-500',
    'success': 'bg-green-500',
    'error': 'bg-red-500',
};

// Mock data
const mockNotifications: Notification[] = [
    { id: '1', tipo: 'success', titulo: 'NFe Autorizada', mensagem: 'A NFe 43210... foi autorizada com sucesso pela SEFAZ', lida: false, createdAt: '2026-02-09T00:45:00Z' },
    { id: '2', tipo: 'warning', titulo: 'Certificado Expirando', mensagem: 'Seu certificado digital expira em 30 dias. Renove para continuar emitindo NFe.', lida: false, createdAt: '2026-02-09T00:30:00Z' },
    { id: '3', tipo: 'info', titulo: 'Nova Manifestação', mensagem: '5 novas notas fiscais disponíveis para manifestação', lida: true, createdAt: '2026-02-08T23:15:00Z' },
    { id: '4', tipo: 'error', titulo: 'Falha na Transmissão', mensagem: 'Erro ao transmitir NFe 43209... Verifique os dados e tente novamente.', lida: true, createdAt: '2026-02-08T22:00:00Z' },
];

export function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [onlyUnread, setOnlyUnread] = useState(false);

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setNotifications(mockNotifications);
        } catch {
            toast.error('Erro ao carregar notificações');
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = (id: string) => {
        setNotifications(notifications.map(n =>
            n.id === id ? { ...n, lida: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, lida: true })));
        toast.success('Todas as notificações marcadas como lidas');
    };

    const deleteNotification = (id: string) => {
        setNotifications(notifications.filter(n => n.id !== id));
        toast.success('Notificação removida');
    };

    const clearAll = () => {
        setNotifications([]);
        toast.success('Todas as notificações removidas');
    };

    const filteredNotifications = onlyUnread
        ? notifications.filter(n => !n.lida)
        : notifications;

    const unreadCount = notifications.filter(n => !n.lida).length;

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffHours < 1) return 'Agora mesmo';
        if (diffHours < 24) return `Há ${diffHours}h`;
        return date.toLocaleDateString('pt-BR');
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6 max-w-3xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Notificações</h1>
                    <p className="text-muted-foreground">
                        {unreadCount > 0 ? `${unreadCount} não lida(s)` : 'Todas lidas'}
                    </p>
                </div>
                <div className="flex gap-2">
                    {unreadCount > 0 && (
                        <Button variant="outline" onClick={markAllAsRead}>
                            <CheckCheck className="mr-2 h-4 w-4" />
                            Marcar todas como lidas
                        </Button>
                    )}
                    {notifications.length > 0 && (
                        <Button variant="outline" onClick={clearAll}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Limpar
                        </Button>
                    )}
                </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
                <Switch
                    id="unread-only"
                    checked={onlyUnread}
                    onCheckedChange={setOnlyUnread}
                />
                <label htmlFor="unread-only" className="text-sm">
                    Mostrar apenas não lidas
                </label>
            </div>

            {/* Notifications List */}
            <div className="space-y-3">
                {filteredNotifications.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Bell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="font-semibold">Nenhuma notificação</h3>
                            <p className="text-muted-foreground text-sm">
                                {onlyUnread ? 'Todas as notificações foram lidas' : 'Você não tem notificações'}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredNotifications.map((notification) => {
                        const Icon = typeIcons[notification.tipo];
                        return (
                            <Card
                                key={notification.id}
                                className={`transition-all ${!notification.lida ? 'border-l-4 border-l-primary' : 'opacity-75'}`}
                            >
                                <CardContent className="py-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2 rounded-full ${typeColors[notification.tipo]}`}>
                                            <Icon className="h-4 w-4 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold">{notification.titulo}</h4>
                                                {!notification.lida && (
                                                    <Badge variant="secondary" className="text-xs">Nova</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                {notification.mensagem}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                {formatDate(notification.createdAt)}
                                            </p>
                                        </div>
                                        <div className="flex gap-1">
                                            {!notification.lida && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => markAsRead(notification.id)}
                                                    title="Marcar como lida"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => deleteNotification(notification.id)}
                                                title="Remover"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
