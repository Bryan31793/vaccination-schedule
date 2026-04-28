import apiClient from '../client';
import type { PacienteResponse, RegistrarPacienteRequest, HistorialResponse } from '../../types';

export const pacientesApi = {
  listar: async (): Promise<PacienteResponse[]> => {
    const { data } = await apiClient.get('/api/pacientes');
    return data;
  },

  porCurp: async (curp: string): Promise<PacienteResponse> => {
    const { data } = await apiClient.get(`/api/pacientes/${curp}`);
    return data;
  },

  registrar: async (paciente: RegistrarPacienteRequest): Promise<PacienteResponse> => {
    const { data } = await apiClient.post('/api/pacientes', paciente);
    return data;
  },

  historial: async (curp: string): Promise<HistorialResponse> => {
    const { data } = await apiClient.get(`/api/pacientes/${curp}/historial`);
    return data;
  },
};
