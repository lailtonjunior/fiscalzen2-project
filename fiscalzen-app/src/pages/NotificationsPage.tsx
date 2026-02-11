import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Loader2, Bell, Check, Trash2, CheckCheck, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { useNotificacoesStore } from '@/stores/useNotificacoesStore';

const typeIcons: Record<string, React.ElementType> = {
    'info': Info,
    'MANIFESTO_PENDENTE': AlertTriangle,
    'warning': AlertTriangle,
    'success': Check,
    'error': AlertTriangle,
};

const typeColors: Record<string, string> = {
    'info': 'bg-blue-500',
    'MANIFESTO_PENDENTE': 'bg-yellow-500',
    'warning': 'bg-yellow-500',
    'success': 'bg-green-500',
    'error': 'bg-red-500',
};

export function NotificationsPage() {
    const {
        notificacoes,
        unreadCount,
        loading,
        error,
        fetchNotificacoes,
        fetchUnreadCount,
        markAsRead,
        markAllAsRead,
        removeNotificacao,
    } = useNotificacoesStore();
    const [onlyUnread, setOnlyUnread] = useState(false);

    useEffect(() => {
        fetchNotificacoes();
        fetchUnreadCount();
    }, [fetchNotificacoes, fetchUnreadCount]);

    const handleMarkAsRead = async (id: string) => {
        try {
            await markAsRead(id);
        } catch {
            toast.error('Erro ao marcar como lida');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead();
            toast.success('Todas as notificações marcadas como lidas');
        } catch {
            toast.error('Erro ao marcar todas como lidas');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await removeNotificacao(id);
            toast.success('Notificação removida');
        } catch {
            toast.error('Erro ao remover notificação');
        }
    };

    const filteredNotifications = onlyUnread
        ? notificacoes.filter(n => !n.lida)
        : notificacoes;

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffHours < 1) return 'Agora mesmo';
        if (diffHours < 24) return `Há ${diffHours}h`;
        return date.toLocaleDateString('pt-BR');
    };

    if (loading && notificacoes.length === 0) {
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
                <Button onClick={() => fetchNotificacoes()}>Tentar novamente</Button>
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
                        <Button variant="outline" onClick={handleMarkAllAsRead}>
                            <CheckCheck className="mr-2 h-4 w-4" />
                            Marcar todas como lidas
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
                        const Icon = typeIcons[notification.tipo] || Info;
                        const bgColor = typeColors[notification.tipo] || 'bg-blue-500';
                        return (
                            <Card
                                key={notification.id}
                                className={`transition-all ${!notification.lida ? 'border-l-4 border-l-primary' : 'opacity-75'}`}
                            >
                                <CardContent className="py-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-2 rounded-full ${bgColor}`}>
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
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    title="Marcar como lida"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(notification.id)}
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
