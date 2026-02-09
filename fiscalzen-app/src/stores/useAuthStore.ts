import { create } from 'zustand';
import { authService } from '../services/auth.service';

interface User {
    id: string;
    email: string;
    nombre: string;
    empresaId: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: localStorage.getItem('auth_token'),
    isAuthenticated: !!localStorage.getItem('auth_token'),
    isLoading: false,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const data = await authService.login(email, password) as any;
            localStorage.setItem('auth_token', data.access_token);
            set({
                user: data.user,
                token: data.access_token,
                isAuthenticated: true,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Login failed',
                isLoading: false
            });
            throw error;
        }
    },

    register: async (registerData) => {
        set({ isLoading: true, error: null });
        try {
            const data = await authService.register(registerData) as any;
            localStorage.setItem('auth_token', data.access_token);
            set({
                user: data.user,
                token: data.access_token,
                isAuthenticated: true,
                isLoading: false
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Registration failed',
                isLoading: false
            });
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('auth_token');
        set({ user: null, token: null, isAuthenticated: false });
    },

    checkAuth: () => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            set({ isAuthenticated: true, token });
            // Optionally fetch profile to validate token
        } else {
            set({ isAuthenticated: false, token: null, user: null });
        }
    }
}));
