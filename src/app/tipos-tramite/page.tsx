'use client';

import { useState, useEffect } from 'react';
import { useTiposTramite } from '@/hooks/useApi';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, ClipboardList, Loader2, X } from 'lucide-react';

const emptyForm = { nombre: '', descripcion: '', dias_respuesta: 5 };

export default function TiposTramitePage() {
  const [tipos, setTipos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { getTipos, createTipo, updateTipo, deleteTipo } = useTiposTramite();

  useEffect(() => { getTipos().then(setTipos).finally(() => setLoading(false)); }, []);

  function openEdit(t: any) {
    setForm({ nombre: t.nombre, descripcion: t.descripcion || '', dias_respuesta: t.dias_respuesta });
    setEditId(t.id); setModal('edit');
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal === 'create') {
        const t = await createTipo(form);
        setTipos(prev => [...prev, t]);
        toast.success('Tipo de trámite creado');
      } else {
        const t = await updateTipo(editId!, form);
        setTipos(prev => prev.map(x => x.id === editId ? t : x));
        toast.success('Actualizado');
      }
      setModal(null);
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try {
      await deleteTipo(id);
      setTipos(prev => prev.filter(t => t.id !== id));
      toast.success('Eliminado');
    } catch { toast.error('Error al eliminar'); }
    finally { setDeleteId(null); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tipos de Trámite</h1>
          <p className="text-gray-500 text-sm">{tipos.length} tipos registrados</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setModal('create'); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo Tipo
        </button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><div className="spinner w-8 h-8 mx-auto" /></div>
        ) : tipos.length === 0 ? (
          <div className="p-12 text-center"><ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-400">Sin tipos de trámite</p></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Nombre</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Descripción</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Días de Respuesta</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tipos.map(t => (
                <tr key={t.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{t.nombre}</td>
                  <td className="px-4 py-3 text-gray-500">{t.descripcion || '-'}</td>
                  <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">{t.dias_respuesta} días</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(t)} className="p-1.5 hover:bg-amber-50 hover:text-amber-600 rounded-lg"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(t.id)} className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold text-slate-900">{modal === 'create' ? 'Nuevo Tipo' : 'Editar Tipo'}</h3>
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
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Días de Respuesta</label>
                <input type="number" min={1} value={form.dias_respuesta}
                  onChange={e => setForm(prev => ({ ...prev, dias_respuesta: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
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
            <h3 className="font-bold mb-2">¿Eliminar tipo?</h3>
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
