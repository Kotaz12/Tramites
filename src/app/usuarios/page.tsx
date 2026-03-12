'use client';

import { useState, useEffect } from 'react';
import { useUsuarios } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { Plus, Trash2, Shield, Loader2, X } from 'lucide-react';

const emptyForm = { email: '', nombre: '', password: '', rol: 'empleado' };

export default function UsuariosPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { getUsers, createUser, deleteUser } = useUsuarios();
  const { user: currentUser } = useAuth();

  useEffect(() => { getUsers().then(setUsers).finally(() => setLoading(false)); }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const u = await createUser(form);
      setUsers(prev => [u, ...prev]);
      setModal(false);
      toast.success('Usuario creado');
    } catch (err: any) { toast.error(err.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success('Usuario eliminado');
    } catch { toast.error('Error al eliminar'); }
    finally { setDeleteId(null); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Usuarios</h1>
          <p className="text-gray-500 text-sm">{users.length} usuarios registrados</p>
        </div>
        <button onClick={() => { setForm(emptyForm); setModal(true); }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nuevo Usuario
        </button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        {loading ? <div className="p-8 text-center"><div className="spinner w-8 h-8 mx-auto" /></div> :
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Nombre</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Email</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Rol</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Registrado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
                        {u.nombre?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium text-slate-900">{u.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.rol === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                      {u.rol}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(u.created_at)}</td>
                  <td className="px-4 py-3">
                    {u.id !== currentUser?.id && (
                      <button onClick={() => setDeleteId(u.id)} className="p-1.5 hover:bg-rose-50 hover:text-rose-600 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex justify-between mb-4">
              <h3 className="font-bold text-slate-900">Nuevo Usuario</h3>
              <button onClick={() => setModal(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              {[
                { field: 'nombre', label: 'Nombre *', type: 'text' },
                { field: 'email', label: 'Email *', type: 'email' },
                { field: 'password', label: 'Contraseña *', type: 'password' },
              ].map(({ field, label, type }) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                  <input type={type} value={(form as any)[field]} required
                    onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Rol</label>
                <select value={form.rol} onChange={e => setForm(prev => ({ ...prev, rol: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="empleado">Empleado</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setModal(false)} className="flex-1 px-4 py-2 border rounded-lg text-sm">Cancelar</button>
                <button type="submit" disabled={saving}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
            <h3 className="font-bold mb-2">¿Eliminar usuario?</h3>
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
