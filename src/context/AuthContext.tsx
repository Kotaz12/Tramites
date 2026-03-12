'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  nombre: string;
  rol: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, nombre: string, rol?: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

async function apiFetch(url: string, options: RequestInit = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Error de servidor');
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (stored) {
      setToken(stored);
      fetchUser(stored).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  async function fetchUser(tok: string) {
    try {
      const data = await apiFetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${tok}` },
      });
      setUser(data);
    } catch {
      logout();
    }
  }

  async function login(email: string, password: string): Promise<User> {
    const data = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  }

  async function register(email: string, password: string, nombre: string, rol = 'empleado'): Promise<User> {
    const data = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, nombre, rol }),
    });
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, isAdmin: user?.rol === 'admin', login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
