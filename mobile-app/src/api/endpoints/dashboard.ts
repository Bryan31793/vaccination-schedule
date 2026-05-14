import apiClient from '../client';

export interface DashboardResumen {
  totalPacientes: number;
  totalVacunas: number;
  vacunasAplicadasHoy: number;
  alertasActivas: number;
}

export const dashboardApi = {
  resumen: async (): Promise<DashboardResumen> => {
    const { data } = await apiClient.get('/api/dashboard/resumen');
    return data;
  },
};
