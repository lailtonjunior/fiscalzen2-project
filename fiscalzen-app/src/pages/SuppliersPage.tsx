import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Loader2, Plus, MoreHorizontal, Truck, Pencil, Trash2, Phone, Mail, MapPin, AlertCircle, RefreshCw } from 'lucide-react';
import { fornecedoresService, type Fornecedor, type CreateFornecedorDto } from '@/services/fornecedores.service';

const fornecedorSchema = z.object({
    razaoSocial: z.string().min(2, 'Razão Social é obrigatória'),
    cnpj: z.string().regex(/^\d{14}$/, 'CNPJ deve ter 14 dígitos'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    telefone: z.string().optional(),
    nomeFantasia: z.string().optional(),
});

type FornecedorFormData = z.infer<typeof fornecedorSchema>;

export function SuppliersPage() {
    const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(null);
    const [saving, setSaving] = useState(false);
    const [syncing, setSyncing] = useState(false);

    const form = useForm<FornecedorFormData>({
        resolver: zodResolver(fornecedorSchema),
        defaultValues: {
            razaoSocial: '',
            cnpj: '',
            email: '',
            telefone: '',
            nomeFantasia: '',
        },
    });

    useEffect(() => {
        loadFornecedores();
    }, []);

    const loadFornecedores = async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fornecedoresService.getAll({ take: 100 });
            setFornecedores(result.data);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Erro ao carregar fornecedores');
            toast.error('Erro ao carregar fornecedores');
        } finally {
            setLoading(false);
        }
    };

    const handleSync = async () => {
        setSyncing(true);
        try {
            const result = await fornecedoresService.sync();
            toast.success(`Sincronização concluída: ${result.created} novo(s)`);
            await loadFornecedores();
        } catch {
            toast.error('Erro ao sincronizar fornecedores');
        } finally {
            setSyncing(false);
        }
    };

    const onSubmit = async (data: FornecedorFormData) => {
        setSaving(true);
        try {
            const dto: CreateFornecedorDto = {
                cnpj: data.cnpj,
                razaoSocial: data.razaoSocial,
                email: data.email || undefined,
                telefone: data.telefone || undefined,
                nomeFantasia: data.nomeFantasia || undefined,
            };

            if (editingFornecedor) {
                await fornecedoresService.update(editingFornecedor.id, dto);
                toast.success('Fornecedor atualizado');
            } else {
                await fornecedoresService.create(dto);
                toast.success('Fornecedor cadastrado');
            }

            resetForm();
            await loadFornecedores();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || 'Erro ao salvar fornecedor');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await fornecedoresService.remove(id);
            setFornecedores(fornecedores.filter(f => f.id !== id));
            toast.success('Fornecedor removido');
        } catch {
            toast.error('Erro ao remover fornecedor');
        }
    };

    const openEditDialog = (fornecedor: Fornecedor) => {
        setEditingFornecedor(fornecedor);
        form.reset({
            razaoSocial: fornecedor.razaoSocial,
            cnpj: fornecedor.cnpj,
            email: fornecedor.email || '',
            telefone: fornecedor.telefone || '',
            nomeFantasia: fornecedor.nomeFantasia || '',
        });
        setDialogOpen(true);
    };

    const resetForm = () => {
        setEditingFornecedor(null);
        form.reset();
        setDialogOpen(false);
    };

    const formatCnpj = (cnpj: string) => {
        return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');
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
                <Button onClick={loadFornecedores}>Tentar novamente</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Fornecedores</h1>
                    <p className="text-muted-foreground">Gerencie seus fornecedores cadastrados</p>
                </div>

                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleSync} disabled={syncing}>
                        {syncing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                        Sincronizar NFe
                    </Button>

                    <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setDialogOpen(true); }}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Novo Fornecedor
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>{editingFornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}</DialogTitle>
                                <DialogDescription>
                                    {editingFornecedor ? 'Atualize os dados do fornecedor' : 'Cadastre um novo fornecedor'}
                                </DialogDescription>
                            </DialogHeader>

                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2 space-y-2">
                                        <Label htmlFor="razaoSocial">Razão Social *</Label>
                                        <Input id="razaoSocial" {...form.register('razaoSocial')} />
                                        {form.formState.errors.razaoSocial && (
                                            <p className="text-sm text-destructive">{form.formState.errors.razaoSocial.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="cnpj">CNPJ *</Label>
                                        <Input id="cnpj" {...form.register('cnpj')} placeholder="Apenas números" maxLength={14} />
                                        {form.formState.errors.cnpj && (
                                            <p className="text-sm text-destructive">{form.formState.errors.cnpj.message}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="telefone">Telefone</Label>
                                        <Input id="telefone" {...form.register('telefone')} placeholder="(00) 0000-0000" />
                                    </div>

                                    <div className="col-span-2 space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" {...form.register('email')} />
                                    </div>

                                    <div className="col-span-2 space-y-2">
                                        <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                                        <Input id="nomeFantasia" {...form.register('nomeFantasia')} />
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={resetForm}>Cancelar</Button>
                                    <Button type="submit" disabled={saving}>
                                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {editingFornecedor ? 'Salvar' : 'Cadastrar'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        <CardTitle>Fornecedores Cadastrados</CardTitle>
                    </div>
                    <CardDescription>{fornecedores.length} fornecedor(es)</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Razão Social</TableHead>
                                <TableHead>CNPJ</TableHead>
                                <TableHead>Contato</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fornecedores.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                                        Nenhum fornecedor cadastrado. Use "Sincronizar NFe" para importar automaticamente.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                fornecedores.map((fornecedor) => (
                                    <TableRow key={fornecedor.id}>
                                        <TableCell className="font-medium">{fornecedor.razaoSocial}</TableCell>
                                        <TableCell className="font-mono text-sm">{formatCnpj(fornecedor.cnpj)}</TableCell>
                                        <TableCell>
                                            <div className="space-y-1 text-sm">
                                                {fornecedor.email && (
                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <Mail className="h-3 w-3" />
                                                        {fornecedor.email}
                                                    </div>
                                                )}
                                                {fornecedor.telefone && (
                                                    <div className="flex items-center gap-1 text-muted-foreground">
                                                        <Phone className="h-3 w-3" />
                                                        {fornecedor.telefone}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openEditDialog(fornecedor)}>
                                                        <Pencil className="mr-2 h-4 w-4" />
                                                        Editar
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(fornecedor.id)}
                                                        className="text-destructive"
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                        Excluir
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
