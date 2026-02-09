import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Settings, Building2, Users, Shield, Plug, CreditCard, Bell, Palette } from 'lucide-react';

interface SettingsItem {
    icon: React.ElementType;
    title: string;
    description: string;
    href: string;
}

const settingsItems: SettingsItem[] = [
    {
        icon: Building2,
        title: 'Dados da Empresa',
        description: 'Razão social, CNPJ, endereço e ambiente SEFAZ',
        href: '/empresa',
    },
    {
        icon: Shield,
        title: 'Certificado Digital',
        description: 'Upload e gerenciamento do certificado A1',
        href: '/empresa',
    },
    {
        icon: Users,
        title: 'Usuários',
        description: 'Gerencie usuários e permissões de acesso',
        href: '/usuarios',
    },
    {
        icon: Plug,
        title: 'Integrações',
        description: 'Webhooks, chaves de API e conexões externas',
        href: '/integracoes',
    },
    {
        icon: CreditCard,
        title: 'Assinatura',
        description: 'Plano atual, consumo e forma de pagamento',
        href: '/assinatura',
    },
    {
        icon: Bell,
        title: 'Notificações',
        description: 'Preferências de alertas e comunicações',
        href: '/notificacoes',
    },
];

export function SettingsPage() {
    const navigate = useNavigate();

    return (
        <div className="container mx-auto py-6 space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold">Configurações</h1>
                <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        <CardTitle>Configurações Gerais</CardTitle>
                    </div>
                    <CardDescription>Acesse rapidamente as configurações do sistema</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {settingsItems.map((item, index) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={index}
                                    onClick={() => navigate(item.href)}
                                    className="flex items-start gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors text-left"
                                >
                                    <div className="p-2 rounded-lg bg-primary/10">
                                        <Icon className="h-5 w-5 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-medium">{item.title}</h3>
                                        <p className="text-sm text-muted-foreground">{item.description}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Theme Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Palette className="h-5 w-5" />
                        <CardTitle>Aparência</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Tema</p>
                            <p className="text-sm text-muted-foreground">Escolha entre tema claro ou escuro</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm">Claro</Button>
                            <Button variant="outline" size="sm">Escuro</Button>
                            <Button variant="default" size="sm">Sistema</Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
                    <CardDescription>Ações irreversíveis</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Exportar Dados</p>
                            <p className="text-sm text-muted-foreground">Baixe todos os seus dados em formato JSON</p>
                        </div>
                        <Button variant="outline">Exportar</Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium">Excluir Conta</p>
                            <p className="text-sm text-muted-foreground">Remove permanentemente sua conta e dados</p>
                        </div>
                        <Button variant="destructive">Excluir Conta</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
