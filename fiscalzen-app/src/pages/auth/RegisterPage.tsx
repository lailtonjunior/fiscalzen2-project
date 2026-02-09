import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export function RegisterPage() {
    const navigate = useNavigate()
    const { register } = useAuthStore()
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setLoading(true)
        const formData = new FormData(e.currentTarget)
        const name = formData.get('name') as string
        const email = formData.get('email') as string
        const password = formData.get('password') as string
        const companyName = formData.get('companyName') as string
        const cnpj = formData.get('cnpj') as string

        try {
            await register({ name, email, password, companyName, cnpj })
            toast.success('Cadastro realizado com sucesso!')
            navigate('/')
        } catch (error: any) {
            toast.error(error.message || 'Falha ao realizar cadastro')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-muted/40 px-4 py-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl">Cadastro</CardTitle>
                    <CardDescription>
                        Crie sua conta e configure sua empresa.
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome Completo</Label>
                            <Input id="name" name="name" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="m@exemplo.com" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Senha</Label>
                            <Input id="password" name="password" type="password" required />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                    Dados da Empresa
                                </span>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="companyName">Razão Social</Label>
                            <Input id="companyName" name="companyName" placeholder="Minha Empresa Ltda" required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="cnpj">CNPJ</Label>
                            <Input id="cnpj" name="cnpj" placeholder="00.000.000/0000-00" />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <Button className="w-full" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Criar Conta
                        </Button>
                        <div className="text-sm text-center text-muted-foreground">
                            Já tem uma conta?{' '}
                            <Link to="/login" className="text-primary hover:underline">
                                Faça login
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    )
}
