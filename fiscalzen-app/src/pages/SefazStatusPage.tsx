import { useEffect, useState } from 'react'
import { sefazService, type SefazStatusResponse } from '@/services/sefaz.service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, CheckCircle, RefreshCw, Server, ShieldCheck, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SefazStatusPage() {
    const [status, setStatus] = useState<SefazStatusResponse | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const checkStatus = async () => {
        setLoading(true)
        setError(null)
        try {
            const data = await sefazService.checkStatus()
            setStatus(data)
        } catch (err: any) {
            setError('Não foi possível comunicar com a SEFAZ ou com o servidor.')
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        checkStatus()
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Consulta SEFAZ</h1>
                    <p className="text-muted-foreground">
                        Monitoramento de disponibilidade do serviço da Receita
                    </p>
                </div>
                <Button onClick={checkStatus} disabled={loading} variant="outline">
                    <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
                    Atualizar
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Status Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5" />
                            Status do Serviço
                        </CardTitle>
                        <CardDescription>Disponibilidade atual do ambiente</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-6 text-red-600 bg-red-50 rounded-lg">
                                <AlertCircle className="h-12 w-12 mb-2" />
                                <p className="font-medium">Serviço Indisponível</p>
                                <p className="text-sm opacity-90">{error}</p>
                            </div>
                        ) : status ? (
                            <div className="space-y-6">
                                <div className={cn(
                                    "flex items-center justify-between p-4 rounded-lg border",
                                    status.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                                )}>
                                    <div className="flex items-center gap-3">
                                        {status.success ? (
                                            <CheckCircle className="h-8 w-8 text-green-600" />
                                        ) : (
                                            <AlertCircle className="h-8 w-8 text-red-600" />
                                        )}
                                        <div>
                                            <p className={cn("font-bold text-lg", status.success ? "text-green-700" : "text-red-700")}>
                                                {status.success ? "Operacional" : "Com Problemas"}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {status.success ? "Serviço respondendo normalmente" : "Falha na comunicação"}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge variant={status.success ? "default" : "destructive"} className="text-md px-3 py-1">
                                        {status.httpStatus}
                                    </Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-muted rounded-md">
                                        <p className="text-xs text-muted-foreground mb-1">Ambiente</p>
                                        <div className="flex items-center gap-2 font-medium">
                                            <Server className="h-4 w-4" />
                                            Homologação (Dev)
                                        </div>
                                    </div>
                                    <div className="p-3 bg-muted rounded-md">
                                        <p className="text-xs text-muted-foreground mb-1">Certificado</p>
                                        <div className="flex items-center gap-2 font-medium">
                                            <ShieldCheck className="h-4 w-4" />
                                            Mock Ativo
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </CardContent>
                </Card>

                {/* Technical Details Card */}
                <Card className="md:row-span-2">
                    <CardHeader>
                        <CardTitle>Resposta Técnica</CardTitle>
                        <CardDescription>Retorno bruto da SEFAZ (XML/SOAP)</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <Skeleton className="h-[300px] w-full" />
                        ) : status?.responseXml ? (
                            <div className="bg-slate-950 text-slate-50 p-4 rounded-lg font-mono text-xs overflow-auto max-h-[400px]">
                                <pre>{status.responseXml}</pre>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-[200px] text-muted-foreground bg-muted/50 rounded-lg">
                                <p>Nenhuma resposta capturada</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
