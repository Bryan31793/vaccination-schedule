import apiClient from '../client';
import type { AlertaBroteResponse, DetectarBrotesRequest } from '../../types';

export const brotesApi = {
  activos: async (): Promise<AlertaBroteResponse[]> => {
    const { data } = await apiClient.get('/api/brotes/activos');
    return data;
  },

  analizar: async (request: DetectarBrotesRequest): Promise<AlertaBroteResponse[]> => {
    const { data } = await apiClient.post('/api/brotes/analizar', request);
    return data;
  },
};
