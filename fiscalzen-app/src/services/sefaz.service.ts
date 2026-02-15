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
        try {
            const response = await api.get<any, any>(`/sefaz/status?uf=${uf}`);

            // Log for debugging
            console.log('[SefazService] Raw response:', JSON.stringify(response, null, 2));

            // Handle NestJS standardized response { statusCode, data, timestamp }
            if (response && response.data && typeof response.statusCode === 'number') {
                return response.data;
            }

            return response;
        } catch (error) {
            console.error('[SefazService] Error checking status:', error);
            throw error;
        }
    },
};
