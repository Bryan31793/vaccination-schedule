import axios from 'axios';
import { Platform } from 'react-native';
import { storage } from '../utils/secureStorage';
import { triggerLogout } from '../context/MedicoAuthContext';

const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:8080',
  ios:     'http://localhost:8080',
  default: 'http://localhost:8080',
});

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

// Interceptor de request: inyecta el JWT del médico si existe
apiClient.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de response: cierra sesión en 401 solo si hay sesión activa
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const token = await storage.getToken();
      if (token) triggerLogout();
    }
    if (error.response) {
      console.error(`API Error [${error.response.status}]:`, error.response.data);
    } else if (error.request) {
      console.error('Network Error: No response received');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
