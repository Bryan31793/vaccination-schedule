import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '../utils/secureStorage';
import { useChat } from './ChatContext';

export interface MedicoUser {
  token: string;
  nombreCompleto: string;
  cedulaProfesional: string;
  rol: string;
}

interface MedicoAuthContextValue {
  user: MedicoUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login:  (user: MedicoUser) => Promise<void>;
  logout: () => Promise<void>;
}

const MedicoAuthContext = createContext<MedicoAuthContextValue | null>(null);

// Callback global para que el interceptor de Axios pueda cerrar sesión
// sin depender del contexto React
let _logoutCallback: (() => void) | null = null;
export const setLogoutCallback = (fn: () => void) => { _logoutCallback = fn; };
export const triggerLogout      = () => { _logoutCallback?.(); };

export const MedicoAuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser]         = useState<MedicoUser | null>(null);
  const [isLoading, setLoading] = useState(true);
  const { clearChat } = useChat();

  // Al montar, recuperar sesión guardada
  useEffect(() => {
    (async () => {
      try {
        const [token, savedUser] = await Promise.all([
          storage.getToken(),
          storage.getUser(),
        ]);
        if (token && savedUser) {
          setUser({ ...savedUser, token });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Registrar el callback de logout para el interceptor Axios
  useEffect(() => {
    setLogoutCallback(async () => {
      await storage.clear();
      setUser(null);
      clearChat();
    });
  }, [clearChat]);

  const login = async (data: MedicoUser) => {
    await storage.saveToken(data.token);
    await storage.saveUser({
      nombreCompleto:    data.nombreCompleto,
      cedulaProfesional: data.cedulaProfesional,
      rol:               data.rol,
    });
    setUser(data);
  };

  const logout = async () => {
    await storage.clear();
    setUser(null);
    clearChat();
  };

  return (
    <MedicoAuthContext.Provider
      value={{ user, isLoading, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </MedicoAuthContext.Provider>
  );
};

export const useMedicoAuth = (): MedicoAuthContextValue => {
  const ctx = useContext(MedicoAuthContext);
  if (!ctx) throw new Error('useMedicoAuth must be used inside MedicoAuthProvider');
  return ctx;
};
