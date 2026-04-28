import apiClient from '../client';
import type { ConsultaLlmRequest, LlmRespuestaResponse } from '../../types';

export const llmApi = {
  consultar: async (request: ConsultaLlmRequest): Promise<LlmRespuestaResponse> => {
    const { data } = await apiClient.post('/api/consultas/llm', request);
    return data;
  },
};
