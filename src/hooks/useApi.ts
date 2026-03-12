'use client';

import { useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

export function useApiClient() {
  const { token } = useAuth();

  const request = useCallback(async (method: string, endpoint: string, data?: any) => {
    const res = await fetch(`/api${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(data ? { body: JSON.stringify(data) } : {}),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error de servidor');
    return json;
  }, [token]);

  return {
    get: (url: string) => request('GET', url),
    post: (url: string, data: any) => request('POST', url, data),
    put: (url: string, data?: any) => request('PUT', url, data),
    del: (url: string) => request('DELETE', url),
  };
}

export function useTramites() {
  const api = useApiClient();
  return {
    getTramites: (params: Record<string, string> = {}) => {
      const q = new URLSearchParams(params).toString();
      return api.get(`/tramites${q ? `?${q}` : ''}`);
    },
    getTramite: (id: string) => api.get(`/tramites/${id}`),
    createTramite: (data: any) => api.post('/tramites', data),
    updateTramite: (id: string, data: any) => api.put(`/tramites/${id}`, data),
    deleteTramite: (id: string) => api.del(`/tramites/${id}`),
    getNotas: (tramiteId: string) => api.get(`/tramites/${tramiteId}/notas`),
    addNota: (tramiteId: string, data: any) => api.post(`/tramites/${tramiteId}/notas`, data),
  };
}

export function useClientes() {
  const api = useApiClient();
  return {
    getClientes: () => api.get('/clientes'),
    createCliente: (data: any) => api.post('/clientes', data),
    updateCliente: (id: string, data: any) => api.put(`/clientes/${id}`, data),
    deleteCliente: (id: string) => api.del(`/clientes/${id}`),
  };
}

export function useTiposTramite() {
  const api = useApiClient();
  return {
    getTipos: () => api.get('/tipos-tramite'),
    createTipo: (data: any) => api.post('/tipos-tramite', data),
    updateTipo: (id: string, data: any) => api.put(`/tipos-tramite/${id}`, data),
    deleteTipo: (id: string) => api.del(`/tipos-tramite/${id}`),
  };
}

export function useDependencias() {
  const api = useApiClient();
  return {
    getDependencias: () => api.get('/dependencias'),
    createDependencia: (data: any) => api.post('/dependencias', data),
    updateDependencia: (id: string, data: any) => api.put(`/dependencias/${id}`, data),
    deleteDependencia: (id: string) => api.del(`/dependencias/${id}`),
  };
}

export function useUsuarios() {
  const api = useApiClient();
  return {
    getUsers: () => api.get('/usuarios'),
    createUser: (data: any) => api.post('/usuarios', data),
    deleteUser: (id: string) => api.del(`/usuarios/${id}`),
  };
}

export function useNotificaciones() {
  const api = useApiClient();
  return {
    getNotificaciones: () => api.get('/notificaciones'),
    getUnreadCount: () => api.get('/notificaciones?unread_count=1'),
    markAsRead: (id: string) => api.put(`/notificaciones/${id}`),
    markAllAsRead: () => api.put('/notificaciones?read_all=1'),
  };
}

export function useDashboard() {
  const api = useApiClient();
  return {
    getStats: () => api.get('/dashboard'),
  };
}
