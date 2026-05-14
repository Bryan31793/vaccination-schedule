import axios from 'axios';
import { Platform } from 'react-native';

const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:8080',
  default: 'http://localhost:8080',
});

// Cliente sin auth — solo para login/registro
const publicClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

export interface MedicoLoginRequest {
  cedulaProfesional: string;
  password: string;
}

export interface MedicoRegistroRequest {
  nombreCompleto: string;
  cedulaProfesional: string;
  password: string;
  rol?: string;
}

export interface MedicoTokenResponse {
  token: string;
  nombreCompleto: string;
  cedulaProfesional: string;
  rol: string;
}

export const medicoAuthApi = {
  login: async (req: MedicoLoginRequest): Promise<MedicoTokenResponse> => {
    const { data } = await publicClient.post('/api/auth/medico/login', req);
    return data;
  },

  registro: async (req: MedicoRegistroRequest): Promise<MedicoTokenResponse> => {
    const { data } = await publicClient.post('/api/auth/medico/registro', req);
    return data;
  },
};
