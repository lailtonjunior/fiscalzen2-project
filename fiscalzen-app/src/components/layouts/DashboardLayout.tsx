import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/custom/Sidebar'
import { Header } from '@/components/custom/Header'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/useUIStore'

export function DashboardLayout() {
    const { sidebarOpen } = useUIStore()

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
