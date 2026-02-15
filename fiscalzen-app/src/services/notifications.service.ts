import api from './api';
import type { Notificacao } from '@/types';

// TODO: Implement backend endpoint for notifications
// Currently using client-side mock for initial transition
export const notificationsService = {
    getAll: async () => {
        // Return empty list or mock data
        return Promise.resolve([] as Notificacao[]);
    },

    markAsRead: async (id: string) => {
        // api.put(`/notifications/${id}/read`);
        return Promise.resolve();
    }
};
