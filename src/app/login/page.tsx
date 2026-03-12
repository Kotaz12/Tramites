'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { FileText, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { user, login, register } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace('/dashboard');
  }, [user]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('¡Bienvenido!');
      router.replace('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await register(email, password, nombre);
      toast.success('¡Cuenta creada exitosamente!');
      router.replace('/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Error al crear cuenta');
    } finally {
      setLoading(false);
    }
  }

  async function handleInitData() {
    setInitLoading(true);
    try {
      const res = await fetch('/api/init-data', { method: 'POST' });
      const data = await res.json();
      if (data.admin_email) {
        toast.success(`Datos inicializados. Admin: ${data.admin_email} / ${data.admin_password}`);
        setEmail(data.admin_email);
        setPassword(data.admin_password);
      } else {
        toast.info(data.message);
      }
    } catch {
      toast.error('Error al inicializar datos');
    } finally {
      setInitLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left decorative side */}
      <div className="hidden lg:flex lg:w-1/2 login-bg relative">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 to-slate-800/60" />
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Sistema de Trámites</h1>
              <p className="text-white/70 text-sm">Gestión Municipal</p>
            </div>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-4">
            Control eficiente<br />de trámites
          </h2>
          <p className="text-white/70 text-lg">
            Gestiona, da seguimiento y controla todos los trámites municipales en un solo lugar.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-4">
            {[
              { label: 'Trámites', value: '100%' },
              { label: 'Seguimiento', value: 'En tiempo real' },
              { label: 'Notificaciones', value: 'Automáticas' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/10 rounded-xl p-4">
                <p className="text-white font-bold">{value}</p>
                <p className="text-white/60 text-xs mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form side */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex gap-2 mb-6 bg-gray-100 rounded-xl p-1">
              <button
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'login' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                onClick={() => setTab('login')}
              >
                Iniciar sesión
              </button>
              <button
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === 'register' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
                onClick={() => setTab('register')}
              >
                Registrarse
              </button>
            </div>

            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="admin@tramites.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Iniciar sesión
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={e => setNombre(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="w-full px-3 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Crear cuenta
                </button>
              </form>
            )}

            <div className="mt-6 pt-6 border-t">
              <button
                onClick={handleInitData}
                disabled={initLoading}
                className="w-full text-sm text-slate-500 hover:text-slate-700 flex items-center justify-center gap-2"
              >
                {initLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Inicializar datos de ejemplo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
