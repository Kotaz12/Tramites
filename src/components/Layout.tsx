'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useNotificaciones } from '@/hooks/useApi';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, FileText, Users, Building2, ClipboardList,
  Bell, LogOut, Menu, X, Shield, ChevronRight,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tramites', label: 'Trámites', icon: FileText },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/tipos-tramite', label: 'Tipos de Trámite', icon: ClipboardList },
  { href: '/dependencias', label: 'Dependencias', icon: Building2 },
  { href: '/notificaciones', label: 'Notificaciones', icon: Bell },
];

const adminItems = [
  { href: '/usuarios', label: 'Usuarios', icon: Shield },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const { getUnreadCount } = useNotificaciones();

  useEffect(() => {
    getUnreadCount().then((r: any) => setUnreadCount(r.count || 0)).catch(() => {});
    const interval = setInterval(() => {
      getUnreadCount().then((r: any) => setUnreadCount(r.count || 0)).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  function handleLogout() {
    logout();
    router.push('/login');
  }

  const allItems = [...navItems, ...(user?.rol === 'admin' ? adminItems : [])];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transform transition-transform duration-300',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
          <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">Sistema de</p>
            <p className="font-bold text-sm leading-tight text-blue-400">Trámites</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {allItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  active
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                )}
              >
                <Icon className="w-4.5 h-4.5 flex-shrink-0" />
                <span className="flex-1">{label}</span>
                {href === '/notificaciones' && unreadCount > 0 && (
                  <span className="bg-rose-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t border-slate-700 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-sm">
              {user?.nombre?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.nombre}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.rol}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="border-b bg-white px-4 lg:px-6 py-3 flex items-center gap-4">
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            {allItems.find(i => pathname.startsWith(i.href)) && (
              <>
                <span>Sistema</span>
                <ChevronRight className="w-4 h-4" />
                <span className="text-foreground font-medium">
                  {allItems.find(i => pathname.startsWith(i.href))?.label}
                </span>
              </>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
