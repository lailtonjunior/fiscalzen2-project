import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Loader2, Plus, MoreHorizontal, UserCheck, UserX } from 'lucide-react';
import { usersService, type User, type CreateUserData } from '@/services/users.service';

const createUserSchema = z.object({
    email: z.string().email('Email inválido'),
    nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    cargo: z.string().optional(),
    perfil: z.enum(['admin', 'contador', 'operador']),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    contador: 'Contador',
    operador: 'Operador',
};

const roleBadgeVariants: Record<string, 'default' | 'secondary' | 'outline'> = {
    admin: 'default',
    contador: 'secondary',
    operador: 'outline',
};

export function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [creating, setCreating] = useState(false);

    const form = useForm<CreateUserFormData>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            email: '',
            nome: '',
            senha: '',
            cargo: '',
            perfil: 'operador',
        },
    });

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await usersService.listUsers();
            setUsers(data);
        } catch (error) {
            toast.error('Erro ao carregar usuários');
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: CreateUserFormData) => {
        setCreating(true);
        try {
            const newUser = await usersService.createUser(data as CreateUserData);
            setUsers([newUser, ...users]);
            setDialogOpen(false);
            form.reset();
            toast.success('Usuário criado com sucesso');
        } catch (error) {
            toast.error('Erro ao criar usuário');
        } finally {
            setCreating(false);
        }
    };

    const handleDeactivate = async (userId: string) => {
        try {
            await usersService.deactivateUser(userId);
            setUsers(users.map((u) => (u.id === userId ? { ...u, ativo: false } : u)));
            toast.success('Usuário desativado');
        } catch (error) {
            toast.error('Erro ao desativar usuário');
        }
    };

    const handleActivate = async (userId: string) => {
        try {
            await usersService.updateUser(userId, { ativo: true });
            setUsers(users.map((u) => (u.id === userId ? { ...u, ativo: true } : u)));
            toast.success('Usuário reativado');
        } catch (error) {
            toast.error('Erro ao reativar usuário');
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Usuários</h1>
                    <p className="text-muted-foreground">Gerencie os usuários da sua empresa</p>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Novo Usuário
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Criar Novo Usuário</DialogTitle>
                            <DialogDescription>
                                Adicione um novo usuário à sua empresa. Um email será enviado com as credenciais.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome *</Label>
                                <Input id="nome" {...form.register('nome')} />
                                {form.formState.errors.nome && (
                                    <p className="text-sm text-destructive">{form.formState.errors.nome.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email *</Label>
                                <Input id="email" type="email" {...form.register('email')} />
                                {form.formState.errors.email && (
                                    <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="senha">Senha *</Label>
                                <Input id="senha" type="password" {...form.register('senha')} />
                                {form.formState.errors.senha && (
                                    <p className="text-sm text-destructive">{form.formState.errors.senha.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cargo">Cargo</Label>
                                <Input id="cargo" {...form.register('cargo')} placeholder="Ex: Analista Fiscal" />
                            </div>

                            <div className="space-y-2">
                                <Label>Perfil *</Label>
                                <Select
                                    value={form.watch('perfil')}
                                    onValueChange={(value: 'admin' | 'contador' | 'operador') =>
                                        form.setValue('perfil', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="operador">Operador</SelectItem>
                                        <SelectItem value="contador">Contador</SelectItem>
                                        <SelectItem value="admin">Administrador</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={creating}>
                                    {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Criar Usuário
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Lista de Usuários</CardTitle>
                    <CardDescription>{users.length} usuário(s) cadastrado(s)</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nome</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Cargo</TableHead>
                                <TableHead>Perfil</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                                        Nenhum usuário encontrado
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.nome}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>{user.cargo || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant={roleBadgeVariants[user.perfil]}>
                                                {roleLabels[user.perfil]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {user.ativo ? (
                                                <Badge variant="outline" className="border-green-500 text-green-600">
                                                    Ativo
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="border-red-500 text-red-600">
                                                    Inativo
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    {user.ativo ? (
                                                        <DropdownMenuItem onClick={() => handleDeactivate(user.id)}>
                                                            <UserX className="mr-2 h-4 w-4" />
                                                            Desativar
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem onClick={() => handleActivate(user.id)}>
                                                            <UserCheck className="mr-2 h-4 w-4" />
                                                            Reativar
                                                        </DropdownMenuItem>
                                                    )}
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
