import apiClient from '../client';
import type { AplicarVacunaRequest, RegistroVacunacionResponse } from '../../types';

export const vacunacionesApi = {
  aplicar: async (request: AplicarVacunaRequest): Promise<RegistroVacunacionResponse> => {
    const { data } = await apiClient.post('/api/vacunaciones', request);
    return data;
  },
};
