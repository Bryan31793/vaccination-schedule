import axios from 'axios';
import { Platform } from 'react-native';

const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:8080',
  ios: 'http://localhost:8080',
  default: 'http://localhost:8080',
});

const ciudadanoClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

export interface RegistroCiudadanoRequest {
  curp: string;
  password: string;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno?: string;
  fechaNacimiento: string;
  sexo: 'H' | 'M';
  municipio?: string;
  estado?: string;
}

export interface TokenResponse {
  token: string;
  curp: string;
  nombreCompleto: string;
  expiracion: string | null;
}

export const ciudadanoApi = {
  registro: async (req: RegistroCiudadanoRequest): Promise<TokenResponse> => {
    const { data } = await ciudadanoClient.post('/api/ciudadano/registro', req);
    return data;
  },

  login: async (curp: string, password: string): Promise<TokenResponse> => {
    const { data } = await ciudadanoClient.post('/api/ciudadano/login', { curp, password });
    return data;
  },

  perfil: async (token: string) => {
    const { data } = await ciudadanoClient.get('/api/ciudadano/perfil', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },

  historial: async (token: string) => {
    const { data } = await ciudadanoClient.get('/api/ciudadano/historial', {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 15000,
    });
    return data;
  },

  chatbot: async (token: string, mensaje: string) => {
    const { data } = await ciudadanoClient.post(
      '/api/chatbot',
      { mensaje },
      {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 120000,
      }
    );
    return data as { respuesta: string };
  },
};
