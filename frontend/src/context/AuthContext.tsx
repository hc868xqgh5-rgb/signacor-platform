import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser } from '../types';
import api from '../utils/api';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('signacore_token');
    const savedUser = localStorage.getItem('signacore_user');

    try {
      if (
        savedToken &&
        savedUser &&
        savedToken !== 'undefined' &&
        savedUser !== 'undefined' &&
        savedUser !== 'null'
      ) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } else {
        localStorage.removeItem('signacore_token');
        localStorage.removeItem('signacore_user');
      }
    } catch {
      localStorage.removeItem('signacore_token');
      localStorage.removeItem('signacore_user');
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });

    if (!res.data?.token || !res.data?.user) {
      throw new Error('Invalid login response');
    }

    const { token: newToken, user: newUser } = res.data;

    localStorage.setItem('signacore_token', newToken);
    localStorage.setItem('signacore_user', JSON.stringify(newUser));

    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('signacore_token');
    localStorage.removeItem('signacore_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
