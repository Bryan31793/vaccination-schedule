import apiClient from '../client';
import type { VacunaResponse, VacunaCategoria } from '../../types';

export const vacunasApi = {
  listar: async (): Promise<VacunaResponse[]> => {
    const { data } = await apiClient.get('/api/vacunas');
    return data;
  },

  porId: async (id: string): Promise<VacunaResponse> => {
    const { data } = await apiClient.get(`/api/vacunas/${id}`);
    return data;
  },

  porCategoria: async (categoria: VacunaCategoria): Promise<VacunaResponse[]> => {
    const { data } = await apiClient.get(`/api/vacunas/categoria/${categoria}`);
    return data;
  },
};
