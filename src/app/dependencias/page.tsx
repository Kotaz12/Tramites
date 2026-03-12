'use client';

import { useState, useEffect } from 'react';
import { useDependencias } from '@/hooks/useApi';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Building2, Loader2, X } from 'lucide-react';

const emptyForm = { nombre: '', descripcion: '' };

export default function DependenciasPage() {
  const [deps, setDeps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { getDependencias, createDependencia, updateDependencia, deleteDependencia } = useDependencias();

  useEffect(() => { getDependencias().then(setDeps).finally(() => setLoading(false)); }, []);

  function openEdit(d: any) {
    setForm({ nombre: d.nombre, descripcion: d.descripcion || '' });
    setEditId(d.id); setModal('edit');
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'create') {
        const d = await createDependencia(form);
        setDeps(prev => [...prev, d]);
        toast.success('Dependencia creada');
      } else {
        const d = await updateDependencia(editId!, form);
        setDeps(prev => prev.map(x => x.id === editId ? d : x));
        toast.success('Actualizada');
      }
      setModal(null);
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try {
      await deleteDependencia(id);
      setDeps(prev => prev.filter(d => d.id !== id));
      toast.success('Eliminada');
    } catch { toast.error('Error al eliminar'); }
    finally { setDeleteId(null); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dependencias</h1>
          <p className="text-gray-500 text-sm">{deps.length} dependencias registradas</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setModal('create'); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nueva Dependencia
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? [...Array(3)].map((_, i) => <div key={i} className="bg-gray-100 rounded-xl h-32 animate-pulse" />) :
         deps.length === 0 ? (
           <div className="col-span-3 p-12 text-center bg-white rounded-xl border">
             <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-400">Sin dependencias</p>
           </div>
         ) : deps.map(d => (
          <div key={d.id} className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{d.nombre}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{d.descripcion || 'Sin descripción'}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(d)} className="p-1.5 hover:bg-amber-50 hover:text-amber-600 rounded-lg"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => setDeleteId(d.id)} className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold text-slate-900">{modal === 'create' ? 'Nueva Dependencia' : 'Editar Dependencia'}</h3>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label>
                <input value={form.nombre} onChange={e => setForm(prev => ({ ...prev, nombre: e.target.value }))} required
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea value={form.descripcion} onChange={e => setForm(prev => ({ ...prev, descripcion: e.target.value }))}
                  rows={2} className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModal(null)} className="flex-1 px-4 py-2 border rounded-lg text-sm">Cancelar</button>
                <button type="submit" disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold mb-2">¿Eliminar dependencia?</h3>
            <p className="text-gray-500 text-sm mb-4">Esta acción no se puede deshacer.</p>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 text-sm border rounded-lg">Cancelar</button>
              <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 text-sm bg-rose-600 text-white rounded-lg">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
