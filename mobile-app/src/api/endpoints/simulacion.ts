import apiClient from '../client';

export const simulacionApi = {
  ejecutar: () => apiClient.post('/api/simulacion/ejecutar', {}, { timeout: 120000 }), // 2 minutos
  getVideoUrl: () => `${apiClient.defaults.baseURL}/api/simulacion/video`,
};
