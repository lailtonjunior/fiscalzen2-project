import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/useAuthStore';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute() {
    const { isAuthenticated, isLoading, checkAuth, fetchProfile, user } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, []);

    // Fetch profile if authenticated but user data not loaded yet
    useEffect(() => {
        if (isAuthenticated && !user) {
            fetchProfile();
        }
    }, [isAuthenticated, user]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
