import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/auth.service';

export interface AuthUser {
    id: string;
    email: string;
    nome: string;
    cargo?: string;
    perfil: 'admin' | 'gerente' | 'operador' | 'contador' | 'visualizador';
    empresaId: string;
    ativo: boolean;
    ultimoAcesso?: string;
}

export interface AuthEmpresa {
    id: string;
    cnpj: string;
    razaoSocial: string;
    nomeFantasia?: string;
    inscricaoEstadual?: string;
    ambienteSefaz: 'producao' | 'homologacao';
    ativo: boolean;
}

interface AuthState {
    user: AuthUser | null;
    empresa: AuthEmpresa | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    checkAuth: () => void;
    fetchProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            empresa: null,
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
                        token: data.access_token,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                    // Fetch full profile after login
                    await get().fetchProfile();
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || 'Login failed',
                        isLoading: false,
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
                        token: data.access_token,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                    await get().fetchProfile();
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || 'Registration failed',
                        isLoading: false,
                    });
                    throw error;
                }
            },

            logout: () => {
                localStorage.removeItem('auth_token');
                set({
                    user: null,
                    empresa: null,
                    token: null,
                    isAuthenticated: false,
                    error: null,
                });
            },

            checkAuth: () => {
                const token = localStorage.getItem('auth_token');
                if (!token) {
                    set({ isAuthenticated: false, token: null, user: null, empresa: null });
                } else {
                    set({ isAuthenticated: true, token });
                }
            },

            fetchProfile: async () => {
                const { token } = get();
                if (!token) {
                    set({ isAuthenticated: false, user: null, empresa: null });
                    return;
                }

                set({ isLoading: true });
                try {
                    const profile = await authService.getProfile() as any;
                    set({
                        user: {
                            id: profile.id,
                            email: profile.email,
                            nome: profile.nome,
                            cargo: profile.cargo,
                            perfil: profile.perfil,
                            empresaId: profile.empresaId,
                            ativo: profile.ativo,
                            ultimoAcesso: profile.ultimoAcesso,
                        },
                        empresa: profile.empresa ? {
                            id: profile.empresa.id,
                            cnpj: profile.empresa.cnpj,
                            razaoSocial: profile.empresa.razaoSocial,
                            nomeFantasia: profile.empresa.nomeFantasia,
                            inscricaoEstadual: profile.empresa.inscricaoEstadual,
                            ambienteSefaz: profile.empresa.ambienteSefaz,
                            ativo: profile.empresa.ativo,
                        } : null,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                } catch {
                    // Token invalid or expired
                    localStorage.removeItem('auth_token');
                    set({
                        user: null,
                        empresa: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                    });
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                token: state.token,
                user: state.user,
                empresa: state.empresa,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
