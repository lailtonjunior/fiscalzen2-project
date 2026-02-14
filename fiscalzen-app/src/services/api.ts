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

// Prevent multiple 401 redirects from concurrent requests
let isRedirectingToLogin = false;

// Response Interceptor: Handle Errors globally
api.interceptors.response.use(
    (response) => response.data, // Unwrap data directly
    (error) => {
        // Auth Errors — redirect once, suppress duplicate toasts
        if (error.response?.status === 401) {
            localStorage.removeItem('auth_token');
            if (!isRedirectingToLogin && window.location.pathname !== '/login') {
                isRedirectingToLogin = true;
                toast.error('Sessão expirada. Faça login novamente.');
                window.location.href = '/login';
            }
        } else if (error.response?.status === 403) {
            toast.error('Você não tem permissão para esta ação.');
        } else if (error.response?.status === 429) {
            // Rate limited — don't spam the user, just reject silently
        } else if (error.response?.status >= 500) {
            toast.error('Erro no servidor. Tente novamente mais tarde.');
        }

        return Promise.reject(error);
    }
);

export default api;

