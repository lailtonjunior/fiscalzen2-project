import api from './api';
import type { NotaFiscal, FiltroNotas } from '@/types';

export const notasService = {
    getAll: async (filtros?: FiltroNotas) => {
        return api.get<NotaFiscal[]>('/nfe', { params: filtros });
    },

    getById: async (id: string) => {
        return api.get<NotaFiscal>(`/nfe/${id}`);
    },

    getDanfe: async (chave: string) => {
        return api.get(`/nfe/${chave}/danfe`, { responseType: 'blob' });
    },

    manifestar: async (chave: string, tipo: string, justificativa?: string) => {
        return api.post(`/manifestacao`, { chave, tipo, justificativa });
    },

    sync: async () => {
        return api.post('/nfe/sync');
    }
};
