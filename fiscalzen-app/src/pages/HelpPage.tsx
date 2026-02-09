import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, Search, FileText, CreditCard, Shield, Users, Plug, MessageCircle, ExternalLink, BookOpen, Video } from 'lucide-react';

interface FaqItem {
    question: string;
    answer: string;
    category: string;
}

const faqItems: FaqItem[] = [
    {
        category: 'NFe',
        question: 'Como emitir uma Nota Fiscal Eletrônica?',
        answer: 'Para emitir uma NFe, acesse o menu "Notas Fiscais" > "Nova NFe". Preencha os dados do destinatário, produtos e impostos. Após revisar, clique em "Emitir". O sistema irá transmitir para a SEFAZ e retornar o status da autorização.',
    },
    {
        category: 'NFe',
        question: 'Como cancelar uma NFe já autorizada?',
        answer: 'O cancelamento de NFe pode ser feito em até 24 horas após a autorização. Acesse a nota desejada e clique em "Cancelar". Informe o motivo do cancelamento. O sistema enviará o pedido para a SEFAZ.',
    },
    {
        category: 'Certificado',
        question: 'Qual tipo de certificado digital é aceito?',
        answer: 'O FiscalZen aceita certificados digitais do tipo A1 (arquivo .pfx ou .p12). Certificados A3 (token ou cartão) ainda não são suportados. O certificado deve estar válido e emitido por uma Autoridade Certificadora credenciada pela ICP-Brasil.',
    },
    {
        category: 'Certificado',
        question: 'Meu certificado está expirando, o que fazer?',
        answer: 'Você receberá notificações automáticas 30, 15 e 7 dias antes do vencimento. Para renovar, adquira um novo certificado A1 junto à sua Autoridade Certificadora e faça o upload em Empresa > Certificado Digital.',
    },
    {
        category: 'Manifestação',
        question: 'O que é Manifestação do Destinatário?',
        answer: 'A Manifestação do Destinatário é o procedimento pelo qual você confirma ou recusa notas fiscais emitidas em nome da sua empresa. É obrigatório para algumas operações e permite acompanhar todas as notas recebidas.',
    },
    {
        category: 'Planos',
        question: 'Posso fazer upgrade do meu plano a qualquer momento?',
        answer: 'Sim! O upgrade é aplicado imediatamente. A diferença de valor é calculada proporcionalmente ao período restante do seu ciclo de faturamento atual.',
    },
    {
        category: 'Integrações',
        question: 'Como configurar webhooks?',
        answer: 'Acesse Integrações > Webhooks > Novo Webhook. Informe a URL do seu endpoint e selecione os eventos que deseja receber. O sistema enviará requisições POST para sua URL sempre que o evento ocorrer.',
    },
    {
        category: 'Usuários',
        question: 'Quantos usuários posso cadastrar?',
        answer: 'O limite de usuários depende do seu plano. Starter: 2 usuários, Professional: 5 usuários, Enterprise: ilimitado. Cada usuário pode ter permissões específicas configuradas.',
    },
];

const categories = [
    { id: 'all', label: 'Todos', icon: HelpCircle },
    { id: 'NFe', label: 'Notas Fiscais', icon: FileText },
    { id: 'Certificado', label: 'Certificado', icon: Shield },
    { id: 'Manifestação', label: 'Manifestação', icon: FileText },
    { id: 'Planos', label: 'Planos', icon: CreditCard },
    { id: 'Integrações', label: 'Integrações', icon: Plug },
    { id: 'Usuários', label: 'Usuários', icon: Users },
];

export function HelpPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const filteredFaq = faqItems.filter(item => {
        const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="container mx-auto py-6 space-y-6 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold">Central de Ajuda</h1>
                <p className="text-muted-foreground">Encontre respostas para suas dúvidas</p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar na ajuda..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <BookOpen className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-medium">Documentação</h3>
                                <p className="text-sm text-muted-foreground">Guias completos</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-green-500/10">
                                <Video className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <h3 className="font-medium">Tutoriais em Vídeo</h3>
                                <p className="text-sm text-muted-foreground">Aprenda visualmente</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-purple-500/10">
                                <MessageCircle className="h-5 w-5 text-purple-500" />
                            </div>
                            <div>
                                <h3 className="font-medium">Suporte</h3>
                                <p className="text-sm text-muted-foreground">Fale conosco</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* FAQ Section */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5" />
                        <CardTitle>Perguntas Frequentes</CardTitle>
                    </div>
                    <CardDescription>
                        {/* Category Filter */}
                        <div className="flex flex-wrap gap-2 mt-4">
                            {categories.map((cat) => (
                                <Badge
                                    key={cat.id}
                                    variant={selectedCategory === cat.id ? 'default' : 'outline'}
                                    className="cursor-pointer"
                                    onClick={() => setSelectedCategory(cat.id)}
                                >
                                    {cat.label}
                                </Badge>
                            ))}
                        </div>
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {filteredFaq.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <HelpCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Nenhuma pergunta encontrada para sua busca</p>
                        </div>
                    ) : (
                        <Accordion type="single" collapsible className="w-full">
                            {filteredFaq.map((item, index) => (
                                <AccordionItem key={index} value={`item-${index}`}>
                                    <AccordionTrigger className="text-left">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-xs">
                                                {item.category}
                                            </Badge>
                                            {item.question}
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="text-muted-foreground">
                                        {item.answer}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    )}
                </CardContent>
            </Card>

            {/* Contact Support */}
            <Card>
                <CardContent className="py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h4 className="font-medium">Não encontrou o que procurava?</h4>
                            <p className="text-sm text-muted-foreground">
                                Nossa equipe de suporte está pronta para ajudar
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline">
                                <MessageCircle className="mr-2 h-4 w-4" />
                                Chat
                            </Button>
                            <Button>
                                <ExternalLink className="mr-2 h-4 w-4" />
                                Abrir Ticket
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
