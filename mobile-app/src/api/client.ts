import axios from 'axios';
import { Platform } from 'react-native';

// En Android emulator usa 10.0.2.2, en iOS simulator usa localhost
const getBaseUrl = () => {
  if (__DEV__) {
    return Platform.select({
      android: 'http://10.0.2.2:8080',
      ios: 'http://localhost:8080',
      default: 'http://localhost:8080',
    });
  }
  return 'http://localhost:8080'; // Cambiar por URL de producción
};

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Credenciales por defecto (admin tiene todos los permisos)
let currentCredentials = {
  username: 'admin',
  password: 'admin123',
};

export const setCredentials = (username: string, password: string) => {
  currentCredentials = { username, password };
};

// Interceptor para inyectar HTTP Basic Auth en cada request
apiClient.interceptors.request.use((config) => {
  const { username, password } = currentCredentials;
  const token = btoa(`${username}:${password}`);
  config.headers.Authorization = `Basic ${token}`;
  return config;
});

// Interceptor para manejar errores globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        `API Error [${error.response.status}]:`,
        error.response.data
      );
    } else if (error.request) {
      console.error('Network Error: No response received');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
