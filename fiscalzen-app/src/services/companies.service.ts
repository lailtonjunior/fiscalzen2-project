import api from './api';

export interface Company {
    id: string;
    cnpj: string;
    razaoSocial: string;
    nomeFantasia?: string;
    inscricaoEstadual?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    ambienteSefaz: 'producao' | 'homologacao';
    ativo: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateCompanyData {
    razaoSocial?: string;
    nomeFantasia?: string;
    inscricaoEstadual?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    ambienteSefaz?: 'producao' | 'homologacao';
}

export const companiesService = {
    getMyCompany: async (): Promise<Company> => {
        const response = await api.get('/companies/me');
        return response.data;
    },

    updateMyCompany: async (data: UpdateCompanyData): Promise<Company> => {
        const response = await api.put('/companies/me', data);
        return response.data;
    },

    uploadCertificate: async (file: File, password: string): Promise<{ success: boolean; message: string }> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('password', password);

        const response = await api.post('/companies/me/certificate', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },
};
