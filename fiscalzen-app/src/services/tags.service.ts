import api from './api';
import type { Tag } from '@/types';

export const tagsService = {
    getAll: async () => {
        return api.get<Tag[]>('/tags');
    },

    create: async (data: Partial<Tag>) => {
        return api.post<Tag>('/tags', data);
    },

    update: async (id: string, data: Partial<Tag>) => {
        return api.put<Tag>(`/tags/${id}`, data);
    },

    delete: async (id: string) => {
        return api.delete(`/tags/${id}`);
    }
};
