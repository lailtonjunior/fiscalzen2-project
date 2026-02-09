import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Check, CreditCard, Zap, Building2, Crown, FileText, Users, HardDrive, ArrowRight } from 'lucide-react';

interface Plan {
    id: string;
    nome: string;
    preco: number;
    periodo: 'mensal' | 'anual';
    recursos: string[];
    limiteNotas: number;
    limiteUsuarios: number;
    armazenamento: string;
    popular?: boolean;
}

const PLANS: Plan[] = [
    {
        id: 'starter',
        nome: 'Starter',
        preco: 97,
        periodo: 'mensal',
        limiteNotas: 100,
        limiteUsuarios: 2,
        armazenamento: '5 GB',
        recursos: [
            'Emissão de NFe',
            'Manifestação do Destinatário',
            'Relatórios básicos',
            'Suporte por email',
        ],
    },
    {
        id: 'professional',
        nome: 'Professional',
        preco: 197,
        periodo: 'mensal',
        limiteNotas: 500,
        limiteUsuarios: 5,
        armazenamento: '20 GB',
        popular: true,
        recursos: [
            'Tudo do Starter',
            'SPED Fiscal',
            'Tags personalizadas',
            'Webhooks e API',
            'Relatórios avançados',
            'Suporte prioritário',
        ],
    },
    {
        id: 'enterprise',
        nome: 'Enterprise',
        preco: 497,
        periodo: 'mensal',
        limiteNotas: -1, // ilimitado
        limiteUsuarios: -1,
        armazenamento: '100 GB',
        recursos: [
            'Tudo do Professional',
            'Notas ilimitadas',
            'Usuários ilimitados',
            'Integrações customizadas',
            'Gerente de conta dedicado',
            'SLA 99.9%',
        ],
    },
];

export function SubscriptionPage() {
    const [currentPlan] = useState('professional');
    const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

    // Mock usage data
    const usage = {
        notas: 312,
        limiteNotas: 500,
        usuarios: 3,
        limiteUsuarios: 5,
        armazenamento: 8.5,
        limiteArmazenamento: 20,
    };

    const handleUpgrade = (plan: Plan) => {
        setSelectedPlan(plan);
        setUpgradeDialogOpen(true);
    };

    const confirmUpgrade = async () => {
        toast.success(`Upgrade para ${selectedPlan?.nome} realizado!`);
        setUpgradeDialogOpen(false);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(price);
    };

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Assinatura</h1>
                <p className="text-muted-foreground">Gerencie seu plano e consumo</p>
            </div>

            {/* Current Plan & Usage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Crown className="h-5 w-5 text-yellow-500" />
                                <CardTitle>Plano Atual</CardTitle>
                            </div>
                            <Badge>Professional</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-bold">{formatPrice(197)}</span>
                            <span className="text-muted-foreground">/mês</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Próxima cobrança: 01/03/2026
                        </p>
                        <Separator />
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                                <CreditCard className="h-4 w-4" />
                                <span>Visa •••• 4242</span>
                                <Button variant="link" size="sm" className="h-auto p-0">
                                    Alterar
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Consumo do Mês</CardTitle>
                        <CardDescription>Período: 01/02 - 28/02/2026</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    <span>Notas Fiscais</span>
                                </div>
                                <span>{usage.notas} / {usage.limiteNotas}</span>
                            </div>
                            <Progress value={(usage.notas / usage.limiteNotas) * 100} />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4" />
                                    <span>Usuários</span>
                                </div>
                                <span>{usage.usuarios} / {usage.limiteUsuarios}</span>
                            </div>
                            <Progress value={(usage.usuarios / usage.limiteUsuarios) * 100} />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <HardDrive className="h-4 w-4" />
                                    <span>Armazenamento</span>
                                </div>
                                <span>{usage.armazenamento} GB / {usage.limiteArmazenamento} GB</span>
                            </div>
                            <Progress value={(usage.armazenamento / usage.limiteArmazenamento) * 100} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Plans Comparison */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Todos os Planos</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {PLANS.map((plan) => (
                        <Card
                            key={plan.id}
                            className={`relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
                        >
                            {plan.popular && (
                                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2">
                                    Mais Popular
                                </Badge>
                            )}
                            <CardHeader>
                                <CardTitle>{plan.nome}</CardTitle>
                                <div className="flex items-baseline gap-1 mt-2">
                                    <span className="text-3xl font-bold">{formatPrice(plan.preco)}</span>
                                    <span className="text-muted-foreground">/mês</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-2">
                                    {plan.recursos.map((recurso, index) => (
                                        <li key={index} className="flex items-center gap-2 text-sm">
                                            <Check className="h-4 w-4 text-green-500" />
                                            {recurso}
                                        </li>
                                    ))}
                                </ul>
                                <Separator className="my-4" />
                                <div className="space-y-1 text-sm text-muted-foreground">
                                    <p>
                                        <FileText className="h-4 w-4 inline mr-1" />
                                        {plan.limiteNotas === -1 ? 'Notas ilimitadas' : `${plan.limiteNotas} notas/mês`}
                                    </p>
                                    <p>
                                        <Users className="h-4 w-4 inline mr-1" />
                                        {plan.limiteUsuarios === -1 ? 'Usuários ilimitados' : `${plan.limiteUsuarios} usuários`}
                                    </p>
                                    <p>
                                        <HardDrive className="h-4 w-4 inline mr-1" />
                                        {plan.armazenamento}
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter>
                                {plan.id === currentPlan ? (
                                    <Button variant="outline" className="w-full" disabled>
                                        Plano Atual
                                    </Button>
                                ) : (
                                    <Button
                                        className="w-full"
                                        variant={plan.popular ? 'default' : 'outline'}
                                        onClick={() => handleUpgrade(plan)}
                                    >
                                        {PLANS.findIndex(p => p.id === plan.id) > PLANS.findIndex(p => p.id === currentPlan)
                                            ? 'Fazer Upgrade'
                                            : 'Downgrade'}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Upgrade Dialog */}
            <Dialog open={upgradeDialogOpen} onOpenChange={setUpgradeDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmar Alteração de Plano</DialogTitle>
                        <DialogDescription>
                            Você está alterando para o plano {selectedPlan?.nome}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-muted-foreground">
                            A alteração será aplicada imediatamente. A diferença de valor será
                            calculada proporcionalmente ao período restante.
                        </p>
                        <div className="mt-4 p-4 bg-muted rounded-lg">
                            <div className="flex justify-between">
                                <span>Novo valor mensal:</span>
                                <span className="font-bold">{selectedPlan && formatPrice(selectedPlan.preco)}</span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setUpgradeDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={confirmUpgrade}>
                            Confirmar Alteração
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
