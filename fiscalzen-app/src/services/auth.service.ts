import { api } from './api';

export const authService = {
    login: async (email: string, password: string) => {
        // api.post returns data directly via interceptor
        return api.post('/auth/login', { email, password });
    },

    register: async (data: any) => {
        return api.post('/auth/register', data);
    },

    getProfile: async () => {
        return api.get('/auth/profile');
    },
};
