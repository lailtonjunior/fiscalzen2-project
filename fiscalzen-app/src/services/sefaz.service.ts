import { api } from './api';

export interface SefazStatusResponse {
    success: boolean;
    httpStatus: number;
    responseXml: string;
    error?: string;
}

export const sefazService = {
    checkStatus: async (uf: string = 'RS'): Promise<SefazStatusResponse> => {
        // Note: Sefaz endpoint might be public or protected. Assuming protected if global guard is on.
        // If it's public (as per controller @Public), the token interceptor handles it fine (headers ignored/allowed).
        return api.get<any, SefazStatusResponse>(`/sefaz/status?uf=${uf}`);
    },
};
