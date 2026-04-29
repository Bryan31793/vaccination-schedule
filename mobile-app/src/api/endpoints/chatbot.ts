import apiClient from '../client';
import type { ChatbotMensajeRequest, ChatbotMensajeResponse } from '../../types';

export const chatbotApi = {
  enviarMensaje: async (request: ChatbotMensajeRequest): Promise<ChatbotMensajeResponse> => {
    const { data } = await apiClient.post('/api/chatbot', request);
    return data;
  },
};
