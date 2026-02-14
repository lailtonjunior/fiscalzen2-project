import { create } from 'zustand';
import { authService } from '../services/auth.service';

interface User {
    id: string;
    email: string;
    nome: string;
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
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: localStorage.getItem('auth_token'),
    isAuthenticated: false,
    isLoading: true,
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
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    },

    checkAuth: async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            set({ isAuthenticated: false, token: null, user: null, isLoading: false });
            return;
        }
        // Validate token with backend
        try {
            const profile = await authService.getProfile() as any;
            set({
                isAuthenticated: true,
                token,
                user: profile.user ?? profile,
                isLoading: false,
            });
        } catch {
            // Token is invalid or expired
            localStorage.removeItem('auth_token');
            set({ isAuthenticated: false, token: null, user: null, isLoading: false });
        }
    }
}));
