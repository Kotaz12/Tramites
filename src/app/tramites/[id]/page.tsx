'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTramites } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { formatDate, formatDateTime, getStatusColor, getStatusLabel, getEstatusLabel } from '@/lib/utils';
import { toast } from 'sonner';
import { ArrowLeft, Pencil, Calendar, User, Building2, FileText, Clock, MessageSquare, Send, Loader2 } from 'lucide-react';

export default function TramiteDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const { user } = useAuth();
  const [tramite, setTramite] = useState<any>(null);
  const [notas, setNotas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNota, setNewNota] = useState('');
  const [sendingNota, setSendingNota] = useState(false);
  const { getTramite, getNotas, addNota, updateTramite } = useTramites();

  useEffect(() => {
    async function fetchData() {
      try {
        const [t, n] = await Promise.all([getTramite(id), getNotas(id)]);
        setTramite(t);
        setNotas(n);
      } catch {
        toast.error('Error al cargar el trámite');
        router.push('/tramites');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  async function handleAddNota(e: React.FormEvent) {
    e.preventDefault();
    if (!newNota.trim()) return;
    setSendingNota(true);
    try {
      const nota = await addNota(id, { contenido: newNota });
      setNotas([nota, ...notas]);
      setNewNota('');
      toast.success('Nota agregada');
    } catch {
      toast.error('Error al agregar nota');
    } finally {
      setSendingNota(false);
    }
  }

  async function handleStatusChange(estatus: string) {
    try {
      const updated = await updateTramite(id, { estatus });
      setTramite(updated);
      toast.success('Estatus actualizado');
    } catch {
      toast.error('Error al actualizar estatus');
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="spinner w-8 h-8" /></div>;
  }

  if (!tramite) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg mt-1">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getStatusColor(tramite.color_estado)}`}>
              {getStatusLabel(tramite.color_estado)}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{tramite.titulo}</h1>
          {tramite.descripcion && <p className="text-gray-500 mt-1">{tramite.descripcion}</p>}
        </div>
        <Link href={`/tramites/${id}/editar`}
          className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
          <Pencil className="w-4 h-4" />
          Editar
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-semibold text-slate-900 mb-4">Información del Trámite</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: User, label: 'Cliente', value: tramite.cliente_nombre },
                { icon: FileText, label: 'Tipo', value: tramite.tipo_tramite_nombre },
                { icon: Building2, label: 'Dependencia', value: tramite.dependencia_nombre },
                { icon: User, label: 'Empleado Asignado', value: tramite.empleado_nombre || 'Sin asignar' },
                { icon: Calendar, label: 'Fecha Límite', value: formatDate(tramite.fecha_limite) },
                { icon: Clock, label: 'Creado', value: formatDate(tramite.created_at) },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">{label}</p>
                    <p className="text-sm font-medium text-slate-900">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notas */}
          <div className="bg-white rounded-xl border">
            <div className="flex items-center gap-2 p-4 border-b">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-slate-900">Notas ({notas.length})</h2>
            </div>
            <form onSubmit={handleAddNota} className="p-4 border-b">
              <textarea
                value={newNota}
                onChange={e => setNewNota(e.target.value)}
                placeholder="Agregar una nota..."
                rows={3}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <div className="flex justify-end mt-2">
                <button type="submit" disabled={sendingNota || !newNota.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center gap-2 disabled:opacity-50 hover:bg-blue-700 transition-colors">
                  {sendingNota ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Enviar
                </button>
              </div>
            </form>
            <div className="divide-y max-h-96 overflow-y-auto">
              {notas.length === 0 ? (
                <p className="p-6 text-center text-gray-400 text-sm">Sin notas aún</p>
              ) : notas.map(n => (
                <div key={n.id} className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      {n.autor_nombre?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-slate-900">{n.autor_nombre}</span>
                    <span className="text-xs text-gray-400 ml-auto">{formatDateTime(n.created_at)}</span>
                  </div>
                  <p className="text-sm text-gray-600 pl-8">{n.contenido}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border p-4">
            <h3 className="font-semibold text-slate-900 mb-3">Cambiar Estatus</h3>
            <div className="space-y-2">
              {['pendiente', 'en_proceso', 'completado'].map(s => (
                <button key={s} onClick={() => handleStatusChange(s)}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors ${
                    tramite.estatus === s ? 'bg-blue-600 text-white' : 'border hover:bg-gray-50'
                  }`}>
                  {getEstatusLabel(s)}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <h3 className="font-semibold text-slate-900 mb-2">Responsable</h3>
            <p className="text-sm text-gray-500 capitalize">{tramite.responsable}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
