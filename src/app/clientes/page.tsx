'use client';

import { useState, useEffect } from 'react';
import { useClientes } from '@/hooks/useApi';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Users, Search, Loader2, X } from 'lucide-react';

interface Cliente { id: string; nombre: string; email?: string; telefono?: string; direccion?: string; created_at: string; }
const emptyForm = { nombre: '', email: '', telefono: '', direccion: '' };

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { getClientes, createCliente, updateCliente, deleteCliente } = useClientes();

  useEffect(() => { getClientes().then(setClientes).finally(() => setLoading(false)); }, []);

  function openCreate() { setForm(emptyForm); setModal('create'); }
  function openEdit(c: Cliente) {
    setForm({ nombre: c.nombre, email: c.email || '', telefono: c.telefono || '', direccion: c.direccion || '' });
    setEditId(c.id);
    setModal('edit');
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nombre) return toast.error('El nombre es requerido');
    setSaving(true);
    try {
      if (modal === 'create') {
        const c = await createCliente(form);
        setClientes(prev => [c, ...prev]);
        toast.success('Cliente creado');
      } else {
        const c = await updateCliente(editId!, form);
        setClientes(prev => prev.map(x => x.id === editId ? c : x));
        toast.success('Cliente actualizado');
      }
      setModal(null);
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try {
      await deleteCliente(id);
      setClientes(prev => prev.filter(c => c.id !== id));
      toast.success('Cliente eliminado');
    } catch { toast.error('Error al eliminar'); }
    finally { setDeleteId(null); }
  }

  const filtered = clientes.filter(c =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="text-gray-500 text-sm">{clientes.length} clientes registrados</p>
        </div>
        <button onClick={openCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo Cliente
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Buscar clientes..." />
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><div className="spinner w-8 h-8 mx-auto" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-400">No hay clientes</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Nombre</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Teléfono</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Registrado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{c.nombre}</td>
                  <td className="px-4 py-3 text-gray-500">{c.email || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{c.telefono || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(c.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-amber-50 hover:text-amber-600 rounded-lg">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteId(c.id)} className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold text-slate-900">{modal === 'create' ? 'Nuevo Cliente' : 'Editar Cliente'}</h3>
              <button onClick={() => setModal(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-3">
              {[
                { field: 'nombre', label: 'Nombre *', type: 'text', placeholder: 'Nombre completo' },
                { field: 'email', label: 'Email', type: 'email', placeholder: 'correo@example.com' },
                { field: 'telefono', label: 'Teléfono', type: 'tel', placeholder: '624-000-0000' },
                { field: 'direccion', label: 'Dirección', type: 'text', placeholder: 'Dirección completa' },
              ].map(({ field, label, type, placeholder }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                  <input type={type} value={(form as any)[field]}
                    onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={placeholder} />
                </div>
              ))}
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModal(null)} className="flex-1 px-4 py-2 border rounded-lg text-sm">Cancelar</button>
                <button type="submit" disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {modal === 'create' ? 'Crear' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold text-slate-900 mb-2">¿Eliminar cliente?</h3>
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
