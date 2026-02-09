import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Upload, Building2, ShieldCheck } from 'lucide-react';
import { companiesService, type Company, type UpdateCompanyData } from '@/services/companies.service';

const companySchema = z.object({
    razaoSocial: z.string().min(1, 'Razão Social é obrigatória'),
    nomeFantasia: z.string().optional(),
    inscricaoEstadual: z.string().optional(),
    logradouro: z.string().optional(),
    numero: z.string().optional(),
    complemento: z.string().optional(),
    bairro: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().length(2, 'UF deve ter 2 caracteres').optional().or(z.literal('')),
    cep: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido').optional().or(z.literal('')),
    ambienteSefaz: z.enum(['producao', 'homologacao']),
});

type CompanyFormData = z.infer<typeof companySchema>;

export function CompanyPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [company, setCompany] = useState<Company | null>(null);
    const [certFile, setCertFile] = useState<File | null>(null);
    const [certPassword, setCertPassword] = useState('');

    const form = useForm<CompanyFormData>({
        resolver: zodResolver(companySchema),
        defaultValues: {
            razaoSocial: '',
            nomeFantasia: '',
            inscricaoEstadual: '',
            logradouro: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: '',
            cep: '',
            ambienteSefaz: 'producao',
        },
    });

    useEffect(() => {
        loadCompany();
    }, []);

    const loadCompany = async () => {
        try {
            const data = await companiesService.getMyCompany();
            setCompany(data);
            form.reset({
                razaoSocial: data.razaoSocial || '',
                nomeFantasia: data.nomeFantasia || '',
                inscricaoEstadual: data.inscricaoEstadual || '',
                logradouro: data.logradouro || '',
                numero: data.numero || '',
                complemento: data.complemento || '',
                bairro: data.bairro || '',
                cidade: data.cidade || '',
                estado: data.estado || '',
                cep: data.cep || '',
                ambienteSefaz: data.ambienteSefaz,
            });
        } catch (error) {
            toast.error('Erro ao carregar dados da empresa');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: CompanyFormData) => {
        setSaving(true);
        try {
            const updateData: UpdateCompanyData = {
                ...data,
                estado: data.estado || undefined,
                cep: data.cep || undefined,
            };
            const updated = await companiesService.updateMyCompany(updateData);
            setCompany(updated);
            toast.success('Dados atualizados com sucesso');
        } catch (error) {
            toast.error('Erro ao atualizar dados');
        } finally {
            setSaving(false);
        }
    };

    const handleCertUpload = async () => {
        if (!certFile || !certPassword) {
            toast.error('Selecione o arquivo e informe a senha');
            return;
        }

        setUploading(true);
        try {
            const result = await companiesService.uploadCertificate(certFile, certPassword);
            toast.success(result.message);
            setCertFile(null);
            setCertPassword('');
        } catch (error) {
            toast.error('Erro ao enviar certificado');
        } finally {
            setUploading(false);
        }
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
                <h1 className="text-3xl font-bold">Dados da Empresa</h1>
                <p className="text-muted-foreground">Gerencie as configurações da sua empresa</p>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                    <TabsTrigger value="general" className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Dados Gerais
                    </TabsTrigger>
                    <TabsTrigger value="certificate" className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Certificado Digital
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações da Empresa</CardTitle>
                            <CardDescription>
                                Atualize os dados cadastrais da sua empresa. O CNPJ não pode ser alterado.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>CNPJ</Label>
                                        <Input value={company?.cnpj || ''} disabled className="bg-muted" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="razaoSocial">Razão Social *</Label>
                                        <Input id="razaoSocial" {...form.register('razaoSocial')} />
                                        {form.formState.errors.razaoSocial && (
                                            <p className="text-sm text-destructive">{form.formState.errors.razaoSocial.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                                        <Input id="nomeFantasia" {...form.register('nomeFantasia')} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="inscricaoEstadual">Inscrição Estadual</Label>
                                        <Input id="inscricaoEstadual" {...form.register('inscricaoEstadual')} />
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-4">Endereço</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="md:col-span-2 space-y-2">
                                            <Label htmlFor="logradouro">Logradouro</Label>
                                            <Input id="logradouro" {...form.register('logradouro')} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="numero">Número</Label>
                                            <Input id="numero" {...form.register('numero')} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="complemento">Complemento</Label>
                                            <Input id="complemento" {...form.register('complemento')} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="bairro">Bairro</Label>
                                            <Input id="bairro" {...form.register('bairro')} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="cidade">Cidade</Label>
                                            <Input id="cidade" {...form.register('cidade')} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="estado">UF</Label>
                                            <Input id="estado" {...form.register('estado')} maxLength={2} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="cep">CEP</Label>
                                            <Input id="cep" {...form.register('cep')} placeholder="00000-000" />
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-4">Configurações SEFAZ</h3>
                                    <div className="space-y-2 max-w-xs">
                                        <Label>Ambiente SEFAZ</Label>
                                        <Select
                                            value={form.watch('ambienteSefaz')}
                                            onValueChange={(value: 'producao' | 'homologacao') =>
                                                form.setValue('ambienteSefaz', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="producao">Produção</SelectItem>
                                                <SelectItem value="homologacao">Homologação</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={saving}>
                                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Salvar Alterações
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="certificate" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Certificado Digital A1</CardTitle>
                            <CardDescription>
                                Faça upload do seu certificado digital A1 (.pfx ou .p12) para emissão de notas fiscais.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="certFile">Arquivo do Certificado</Label>
                                    <Input
                                        id="certFile"
                                        type="file"
                                        accept=".pfx,.p12"
                                        onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                                    />
                                    <p className="text-sm text-muted-foreground">
                                        Formatos aceitos: .pfx, .p12
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="certPassword">Senha do Certificado</Label>
                                    <Input
                                        id="certPassword"
                                        type="password"
                                        value={certPassword}
                                        onChange={(e) => setCertPassword(e.target.value)}
                                        placeholder="Digite a senha do certificado"
                                    />
                                </div>

                                <Button onClick={handleCertUpload} disabled={uploading || !certFile || !certPassword}>
                                    {uploading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Upload className="mr-2 h-4 w-4" />
                                    )}
                                    Enviar Certificado
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
