'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTramites } from '@/hooks/useApi';
import { formatDate, getStatusColor, getStatusLabel, getEstatusLabel } from '@/lib/utils';
import { toast } from 'sonner';
import { Plus, Search, Eye, Pencil, Trash2, FileText, MoreHorizontal, MessageSquare } from 'lucide-react';

export default function TramitesPage() {
  const [tramites, setTramites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { getTramites, deleteTramite } = useTramites();

  const colorFilter = searchParams.get('color') || '';
  const estatusFilter = searchParams.get('estatus') || '';

  useEffect(() => { fetchTramites(); }, [colorFilter, estatusFilter]);

  async function fetchTramites() {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (colorFilter) params.color = colorFilter;
      if (estatusFilter) params.estatus = estatusFilter;
      const data = await getTramites(params);
      setTramites(data);
    } catch {
      toast.error('Error al cargar trámites');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTramite(id);
      toast.success('Trámite eliminado');
      setTramites(prev => prev.filter(t => t.id !== id));
    } catch {
      toast.error('Error al eliminar trámite');
    } finally {
      setDeleteId(null);
    }
  }

  const filtered = tramites.filter(t =>
    t.titulo?.toLowerCase().includes(search.toLowerCase()) ||
    t.cliente_nombre?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Trámites</h1>
          <p className="text-gray-500 text-sm mt-1">
            {colorFilter ? `Filtrado: ${getStatusLabel(colorFilter)}` :
             estatusFilter ? `Filtrado: ${getEstatusLabel(estatusFilter)}` :
             'Todos los trámites'}
          </p>
        </div>
        <Link href="/tramites/nuevo"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" />
          Nuevo Trámite
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Buscar trámites..."
          />
        </div>
        <select
          value={colorFilter}
          onChange={e => {
            const params = new URLSearchParams(searchParams.toString());
            if (e.target.value) params.set('color', e.target.value); else params.delete('color');
            router.push(`/tramites?${params.toString()}`);
          }}
          className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los colores</option>
          <option value="verde">A tiempo</option>
          <option value="amarillo">Por vencer</option>
          <option value="rojo">Fuera de tiempo</option>
        </select>
        <select
          value={estatusFilter}
          onChange={e => {
            const params = new URLSearchParams(searchParams.toString());
            if (e.target.value) params.set('estatus', e.target.value); else params.delete('estatus');
            router.push(`/tramites?${params.toString()}`);
          }}
          className="px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todos los estatus</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_proceso">En Proceso</option>
          <option value="completado">Completado</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="spinner w-8 h-8 mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No hay trámites</p>
            <Link href="/tramites/nuevo" className="text-blue-600 text-sm hover:underline mt-2 block">
              Crear el primero
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Título</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Cliente</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Tipo</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Estado</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Estatus</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Fecha Límite</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600">Notas</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 max-w-xs truncate">{t.titulo}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{t.cliente_nombre}</td>
                    <td className="px-4 py-3 text-gray-500">{t.tipo_tramite_nombre}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getStatusColor(t.color_estado)}`}>
                        {getStatusLabel(t.color_estado)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{getEstatusLabel(t.estatus)}</td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(t.fecha_limite)}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1 text-gray-400">
                        <MessageSquare className="w-3.5 h-3.5" />
                        {t.notas_count}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link href={`/tramites/${t.id}`}
                          className="p-1.5 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link href={`/tramites/${t.id}/editar`}
                          className="p-1.5 hover:bg-amber-50 hover:text-amber-600 rounded-lg transition-colors">
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button onClick={() => setDeleteId(t.id)}
                          className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="font-bold text-slate-900 mb-2">¿Eliminar trámite?</h3>
            <p className="text-gray-500 text-sm mb-4">Esta acción no se puede deshacer.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50">
                Cancelar
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="px-4 py-2 text-sm bg-rose-600 text-white rounded-lg hover:bg-rose-700">
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
