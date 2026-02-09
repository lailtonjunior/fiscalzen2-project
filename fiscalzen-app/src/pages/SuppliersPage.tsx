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
import { Loader2, Plus, MoreHorizontal, Truck, Pencil, Trash2, Phone, Mail, MapPin } from 'lucide-react';

const fornecedorSchema = z.object({
    razaoSocial: z.string().min(2, 'Razão Social é obrigatória'),
    cnpj: z.string().regex(/^\d{14}$/, 'CNPJ deve ter 14 dígitos'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    telefone: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().length(2, 'UF deve ter 2 caracteres').optional().or(z.literal('')),
});

type FornecedorFormData = z.infer<typeof fornecedorSchema>;

interface Fornecedor {
    id: string;
    razaoSocial: string;
    cnpj: string;
    email?: string;
    telefone?: string;
    cidade?: string;
    estado?: string;
    notasRecebidas: number;
}

// Mock data
const mockFornecedores: Fornecedor[] = [
    { id: '1', razaoSocial: 'Distribuidora ABC Ltda', cnpj: '12345678000190', email: 'contato@abc.com', telefone: '(11) 3000-0000', cidade: 'São Paulo', estado: 'SP', notasRecebidas: 45 },
    { id: '2', razaoSocial: 'Indústria XYZ S.A.', cnpj: '98765432000188', email: 'vendas@xyz.com.br', telefone: '(21) 4000-0000', cidade: 'Rio de Janeiro', estado: 'RJ', notasRecebidas: 23 },
    { id: '3', razaoSocial: 'Comércio Beta ME', cnpj: '11222333000144', cidade: 'Curitiba', estado: 'PR', notasRecebidas: 8 },
];

export function SuppliersPage() {
    const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(null);
    const [saving, setSaving] = useState(false);

    const form = useForm<FornecedorFormData>({
        resolver: zodResolver(fornecedorSchema),
        defaultValues: {
            razaoSocial: '',
            cnpj: '',
            email: '',
            telefone: '',
            cidade: '',
            estado: '',
        },
    });

    useEffect(() => {
        loadFornecedores();
    }, []);

    const loadFornecedores = async () => {
        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            setFornecedores(mockFornecedores);
        } catch {
            toast.error('Erro ao carregar fornecedores');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: FornecedorFormData) => {
        setSaving(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 500));

            if (editingFornecedor) {
                setFornecedores(fornecedores.map(f =>
                    f.id === editingFornecedor.id ? { ...f, ...data } : f
                ));
                toast.success('Fornecedor atualizado');
            } else {
                const newFornecedor: Fornecedor = {
                    id: Date.now().toString(),
                    ...data,
                    notasRecebidas: 0,
                };
                setFornecedores([...fornecedores, newFornecedor]);
                toast.success('Fornecedor cadastrado');
            }

            resetForm();
        } catch {
            toast.error('Erro ao salvar fornecedor');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
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
            cidade: fornecedor.cidade || '',
            estado: fornecedor.estado || '',
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

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Fornecedores</h1>
                    <p className="text-muted-foreground">Gerencie seus fornecedores cadastrados</p>
                </div>

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

                                <div className="space-y-2">
                                    <Label htmlFor="cidade">Cidade</Label>
                                    <Input id="cidade" {...form.register('cidade')} />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="estado">UF</Label>
                                    <Input id="estado" {...form.register('estado')} maxLength={2} placeholder="SP" />
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
                                <TableHead>Localização</TableHead>
                                <TableHead>Notas</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fornecedores.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        Nenhum fornecedor cadastrado
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
                                            {fornecedor.cidade && fornecedor.estado && (
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <MapPin className="h-3 w-3" />
                                                    {fornecedor.cidade}/{fornecedor.estado}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell>{fornecedor.notasRecebidas}</TableCell>
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
