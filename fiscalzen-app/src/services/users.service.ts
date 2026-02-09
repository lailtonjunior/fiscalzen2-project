import api from './api';

export interface User {
    id: string;
    email: string;
    nome: string;
    cargo?: string;
    perfil: 'admin' | 'contador' | 'operador';
    ativo: boolean;
    ultimoAcesso?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateUserData {
    email: string;
    nome: string;
    senha: string;
    cargo?: string;
    perfil?: 'admin' | 'contador' | 'operador';
}

export interface UpdateUserData {
    nome?: string;
    cargo?: string;
    perfil?: 'admin' | 'contador' | 'operador';
    ativo?: boolean;
}

export const usersService = {
    listUsers: async (): Promise<User[]> => {
        const response = await api.get('/users');
        return response.data;
    },

    getUser: async (id: string): Promise<User> => {
        const response = await api.get(`/users/${id}`);
        return response.data;
    },

    createUser: async (data: CreateUserData): Promise<User> => {
        const response = await api.post('/users', data);
        return response.data;
    },

    updateUser: async (id: string, data: UpdateUserData): Promise<User> => {
        const response = await api.patch(`/users/${id}`, data);
        return response.data;
    },

    deactivateUser: async (id: string): Promise<void> => {
        await api.delete(`/users/${id}`);
    },
};
