import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { getMeApi, loginApi, registerApi } from '../api/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('aligntrack_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchUser = async () => {
    try {
      if (token) {
        const data = await getMeApi();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      localStorage.removeItem('aligntrack_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [token]);

  const login = async (credentials: any) => {
    const res = await loginApi(credentials);
    const newToken = res.data.token;
    localStorage.setItem('aligntrack_token', newToken);
    setToken(newToken);
    setUser(res.data.user);
  };

  const register = async (data: any) => {
    const res = await registerApi(data);
    const newToken = res.data.token;
    localStorage.setItem('aligntrack_token', newToken);
    setToken(newToken);
    setUser(res.data.user);
  };

  const logout = () => {
    localStorage.removeItem('aligntrack_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      const data = await getMeApi();
      setUser(data.user);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
