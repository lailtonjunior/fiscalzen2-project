import { Navigate, Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/custom/Sidebar'
import { Header } from '@/components/custom/Header'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/hooks/useStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useEffect } from 'react'

export function DashboardLayout() {
    const { sidebarOpen } = useUIStore()
    const { isAuthenticated, checkAuth, isLoading } = useAuthStore()

    useEffect(() => {
        checkAuth()
    }, [])

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Carregando...</div>
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <Sidebar />
            <div
                className={cn(
                    'transition-all duration-300 ease-in-out',
                    sidebarOpen ? 'ml-64' : 'ml-16'
                )}
            >
                <Header />
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
