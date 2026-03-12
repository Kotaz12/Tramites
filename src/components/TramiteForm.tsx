'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTramites, useClientes, useTiposTramite, useDependencias, useUsuarios } from '@/hooks/useApi';
import { toast } from 'sonner';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function TramiteFormClient({ tramiteId }: { tramiteId?: string }) {
  const isEdit = !!tramiteId;
  const router = useRouter();
  const { getTramite, createTramite, updateTramite } = useTramites();
  const { getClientes } = useClientes();
  const { getTipos } = useTiposTramite();
  const { getDependencias } = useDependencias();
  const { getUsers } = useUsuarios();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [clientes, setClientes] = useState<any[]>([]);
  const [tipos, setTipos] = useState<any[]>([]);
  const [dependencias, setDependencias] = useState<any[]>([]);
  const [usuarios, setUsuarios] = useState<any[]>([]);

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    cliente_id: '',
    tipo_tramite_id: '',
    dependencia_id: '',
    responsable: 'empleado',
    empleado_asignado_id: '',
    estatus: 'pendiente',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [c, t, d, u] = await Promise.all([
          getClientes(), getTipos(), getDependencias(),
          getUsers().catch(() => []),
        ]);
        setClientes(c);
        setTipos(t);
        setDependencias(d);
        setUsuarios(u);

        if (isEdit && tramiteId) {
          const tramite = await getTramite(tramiteId);
          setForm({
            titulo: tramite.titulo || '',
            descripcion: tramite.descripcion || '',
            cliente_id: tramite.cliente_id || '',
            tipo_tramite_id: tramite.tipo_tramite_id || '',
            dependencia_id: tramite.dependencia_id || '',
            responsable: tramite.responsable || 'empleado',
            empleado_asignado_id: tramite.empleado_asignado_id || '',
            estatus: tramite.estatus || 'pendiente',
          });
        }
      } catch (e) {
        toast.error('Error al cargar datos');
      } finally {
        setInitialLoading(false);
      }
    }
    loadData();
  }, [tramiteId]);

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.titulo || !form.cliente_id || !form.tipo_tramite_id || !form.dependencia_id) {
      toast.error('Completa todos los campos requeridos');
      return;
    }
    setLoading(true);
    try {
      const payload = { ...form, empleado_asignado_id: form.empleado_asignado_id || null };
      if (isEdit) {
        await updateTramite(tramiteId!, payload);
        toast.success('Trámite actualizado');
      } else {
        const t = await createTramite(payload);
        toast.success('Trámite creado');
        router.push(`/tramites/${t.id}`);
        return;
      }
      router.push('/tramites');
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar');
    } finally {
      setLoading(false);
    }
  }

  if (initialLoading) {
    return <div className="flex items-center justify-center py-20"><div className="spinner w-8 h-8" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{isEdit ? 'Editar Trámite' : 'Nuevo Trámite'}</h1>
          <p className="text-gray-500 text-sm">{isEdit ? 'Actualiza la información' : 'Completa el formulario'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Título *</label>
          <input value={form.titulo} onChange={e => set('titulo', e.target.value)}
            required className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe el trámite" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
          <textarea value={form.descripcion} onChange={e => set('descripcion', e.target.value)}
            rows={3} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Descripción detallada..." />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cliente *</label>
            <select value={form.cliente_id} onChange={e => set('cliente_id', e.target.value)}
              required className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Seleccionar...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Trámite *</label>
            <select value={form.tipo_tramite_id} onChange={e => set('tipo_tramite_id', e.target.value)}
              required className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Seleccionar...</option>
              {tipos.map(t => <option key={t.id} value={t.id}>{t.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Dependencia *</label>
            <select value={form.dependencia_id} onChange={e => set('dependencia_id', e.target.value)}
              required className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Seleccionar...</option>
              {dependencias.map(d => <option key={d.id} value={d.id}>{d.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Responsable *</label>
            <select value={form.responsable} onChange={e => set('responsable', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="empleado">Empleado</option>
              <option value="cliente">Cliente</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Empleado Asignado</label>
            <select value={form.empleado_asignado_id} onChange={e => set('empleado_asignado_id', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Sin asignar</option>
              {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
            </select>
          </div>
          {isEdit && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estatus</label>
              <select value={form.estatus} onChange={e => set('estatus', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="pendiente">Pendiente</option>
                <option value="en_proceso">En Proceso</option>
                <option value="completado">Completado</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()}
            className="flex-1 px-4 py-2.5 border rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={loading}
            className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60 transition-colors">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isEdit ? 'Guardar Cambios' : 'Crear Trámite'}
          </button>
        </div>
      </form>
    </div>
  );
}
