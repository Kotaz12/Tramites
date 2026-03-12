'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useNotificaciones } from '@/hooks/useApi';
import { formatDateTime } from '@/lib/utils';
import { toast } from 'sonner';
import { Bell, Check, CheckCheck, FileText } from 'lucide-react';

export default function NotificacionesPage() {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getNotificaciones, markAsRead, markAllAsRead } = useNotificaciones();

  useEffect(() => { getNotificaciones().then(setNotifs).finally(() => setLoading(false)); }, []);

  async function handleMarkRead(id: string) {
    try {
      await markAsRead(id);
      setNotifs(prev => prev.map(n => n.id === id ? { ...n, leida: true } : n));
    } catch {}
  }

  async function handleMarkAllRead() {
    try {
      await markAllAsRead();
      setNotifs(prev => prev.map(n => ({ ...n, leida: true })));
      toast.success('Todas marcadas como leídas');
    } catch { toast.error('Error'); }
  }

  const unreadCount = notifs.filter(n => !n.leida).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notificaciones</h1>
          <p className="text-gray-500 text-sm">{unreadCount} sin leer</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 transition-colors">
            <CheckCheck className="w-4 h-4" />
            Marcar todas como leídas
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><div className="spinner w-8 h-8 mx-auto" /></div>
        ) : notifs.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">Sin notificaciones</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifs.map(n => (
              <div key={n.id} className={`flex items-start gap-4 p-4 transition-colors ${!n.leida ? 'bg-blue-50/40' : 'hover:bg-gray-50'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  n.tipo === 'nuevo_tramite' ? 'bg-blue-100 text-blue-600' :
                  n.tipo === 'nota_agregada' ? 'bg-purple-100 text-purple-600' :
                  n.tipo === 'tramite_vencido' ? 'bg-rose-100 text-rose-600' :
                  'bg-amber-100 text-amber-600'
                }`}>
                  {n.tipo === 'nota_agregada' ? <FileText className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${!n.leida ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
                    {n.mensaje}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{formatDateTime(n.created_at)}</p>
                  {n.tramite_id && (
                    <Link href={`/tramites/${n.tramite_id}`}
                      className="text-xs text-blue-600 hover:underline mt-1 block">
                      Ver trámite →
                    </Link>
                  )}
                </div>
                {!n.leida && (
                  <button onClick={() => handleMarkRead(n.id)}
                    className="p-1.5 hover:bg-blue-100 hover:text-blue-600 rounded-lg transition-colors flex-shrink-0"
                    title="Marcar como leída">
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
