import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Loader2, User, Mail, Lock, Save } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';


const profileSchema = z.object({
    nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    email: z.string().email('Email inválido'),
});

const passwordSchema = z.object({
    senhaAtual: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    novaSenha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    confirmarSenha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
}).refine((data) => data.novaSenha === data.confirmarSenha, {
    message: 'Senhas não conferem',
    path: ['confirmarSenha'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export function ProfilePage() {
    const { user } = useAuthStore();
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPassword, setSavingPassword] = useState(false);

    const profileForm = useForm<ProfileFormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            nome: user?.nome || '',
            email: user?.email || '',
        },
    });

    const passwordForm = useForm<PasswordFormData>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            senhaAtual: '',
            novaSenha: '',
            confirmarSenha: '',
        },
    });

    const onProfileSubmit = async (data: ProfileFormData) => {
        setSavingProfile(true);
        try {
            // TODO: Implement API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Perfil atualizado com sucesso');
        } catch {
            toast.error('Erro ao atualizar perfil');
        } finally {
            setSavingProfile(false);
        }
    };

    const onPasswordSubmit = async (data: PasswordFormData) => {
        setSavingPassword(true);
        try {
            // TODO: Implement API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            toast.success('Senha alterada com sucesso');
            passwordForm.reset();
        } catch {
            toast.error('Erro ao alterar senha');
        } finally {
            setSavingPassword(false);
        }
    };

    const initials = user?.nome?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

    return (
        <div className="container mx-auto py-6 space-y-6 max-w-2xl">
            <div>
                <h1 className="text-3xl font-bold">Meu Perfil</h1>
                <p className="text-muted-foreground">Gerencie suas informações pessoais</p>
            </div>

            {/* Avatar Section */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-20 w-20">
                            <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h2 className="text-xl font-semibold">{user?.nome}</h2>
                            <p className="text-muted-foreground">{user?.email}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Profile Form */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        <CardTitle>Informações Pessoais</CardTitle>
                    </div>
                    <CardDescription>Atualize seu nome e email</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome Completo</Label>
                                <Input id="nome" {...profileForm.register('nome')} />
                                {profileForm.formState.errors.nome && (
                                    <p className="text-sm text-destructive">{profileForm.formState.errors.nome.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input id="email" className="pl-10" {...profileForm.register('email')} />
                                </div>
                                {profileForm.formState.errors.email && (
                                    <p className="text-sm text-destructive">{profileForm.formState.errors.email.message}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={savingProfile}>
                                {savingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                Salvar
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Password Form */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        <CardTitle>Alterar Senha</CardTitle>
                    </div>
                    <CardDescription>Mantenha sua conta segura</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="senhaAtual">Senha Atual</Label>
                            <Input id="senhaAtual" type="password" {...passwordForm.register('senhaAtual')} />
                        </div>
                        <Separator />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="novaSenha">Nova Senha</Label>
                                <Input id="novaSenha" type="password" {...passwordForm.register('novaSenha')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmarSenha">Confirmar Nova Senha</Label>
                                <Input id="confirmarSenha" type="password" {...passwordForm.register('confirmarSenha')} />
                                {passwordForm.formState.errors.confirmarSenha && (
                                    <p className="text-sm text-destructive">{passwordForm.formState.errors.confirmarSenha.message}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" variant="outline" disabled={savingPassword}>
                                {savingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Alterar Senha
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
