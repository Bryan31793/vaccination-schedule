import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthState {
  token: string | null;
  curp: string | null;
  nombreCompleto: string | null;
}

interface AuthContextValue extends AuthState {
  login: (token: string, curp: string, nombreCompleto: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    token: null,
    curp: null,
    nombreCompleto: null,
  });

  const login = (token: string, curp: string, nombreCompleto: string) => {
    setState({ token, curp, nombreCompleto });
  };

  const logout = () => {
    setState({ token: null, curp: null, nombreCompleto: null });
  };

  return (
    <AuthContext.Provider
      value={{ ...state, login, logout, isAuthenticated: !!state.token }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
