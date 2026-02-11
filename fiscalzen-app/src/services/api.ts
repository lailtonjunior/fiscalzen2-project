import axios from 'axios';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Add Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Handle Errors globally
api.interceptors.response.use(
    (response) => response.data, // Unwrap data directly
    (error) => {
        const message = error.response?.data?.message || 'Ocorreu um erro inesperado.';

        // Auth Errors
        if (error.response?.status === 401) {
            toast.error('Sessão expirada. Faça login novamente.');
            // Dynamic import to avoid circular dependency (api → auth.service → useAuthStore → api)
            import('@/stores/useAuthStore').then(({ useAuthStore }) => {
                useAuthStore.getState().logout();
            });
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        } else if (error.response?.status === 403) {
            toast.error('Você não tem permissão para esta ação.');
        } else if (error.response?.status >= 500) {
            toast.error('Erro no servidor. Tente novamente mais tarde.');
        } else {
            // Don't toast 400s automatically as they might be validation errors handled by forms
            // toast.error(message);
        }

        return Promise.reject(error);
    }
);

export default api;

