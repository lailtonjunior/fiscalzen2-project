import { create } from 'zustand';
import { authService } from '../services/auth.service';
import type { Empresa } from '@/types'; // Import Empresa

interface User {
    id: string;
    email: string;
    nome: string;
    empresaId: string;
    perfil?: string; // Add optional profile
    avatar?: string;
    cargo?: string;
}

interface AuthState {
    user: User | null;
    empresa: Empresa | null; // Add empresa
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
    empresa: null,
    token: localStorage.getItem('auth_token'),
    isAuthenticated: false,
    isLoading: true,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await authService.login(email, password) as any;
            const data = response.data;
            localStorage.setItem('auth_token', data.access_token);
            set({
                user: data.user,
                empresa: data.empresa || null, // Assuming backend returns company or null
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
            const response = await authService.register(registerData) as any;
            const data = response.data;
            localStorage.setItem('auth_token', data.access_token);
            set({
                user: data.user,
                empresa: data.empresa || null,
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
        set({ user: null, empresa: null, token: null, isAuthenticated: false, isLoading: false });
    },

    checkAuth: async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            set({ isAuthenticated: false, token: null, user: null, empresa: null, isLoading: false });
            return;
        }
        try {
            const response = await authService.getProfile() as any;
            const profile = response.data;
            set({
                isAuthenticated: true,
                token,
                user: profile.user ?? profile,
                empresa: profile.empresa || null,
                isLoading: false,
            });
        } catch (error) {
            console.error('checkAuth failed:', error);
            localStorage.removeItem('auth_token');
            set({ isAuthenticated: false, token: null, user: null, empresa: null, isLoading: false });
        }
    }
}));

