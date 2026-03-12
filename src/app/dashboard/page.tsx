'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDashboard } from '@/hooks/useApi';
import { formatDate, getStatusColor, getStatusLabel, getEstatusLabel } from '@/lib/utils';
import { FileText, Users, CheckCircle, Clock, AlertTriangle, XCircle, Plus, ArrowRight } from 'lucide-react';

interface Stats {
  total_tramites: number;
  tramites_a_tiempo: number;
  tramites_en_proceso: number;
  tramites_fuera_tiempo: number;
  tramites_completados: number;
  total_clientes: number;
  tramites_recientes: any[];
}

function StatCard({ title, value, icon: Icon, colorClass, onClick }: any) {
  return (
    <div onClick={onClick} className="bg-white rounded-xl border p-6 flex items-center justify-between cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const { getStats } = useDashboard();
  const router = useRouter();

  useEffect(() => {
    getStats().then(setStats).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-100 rounded animate-pulse w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-28 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Resumen del sistema de trámites</p>
        </div>
        <Link href="/tramites/nuevo"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
          <Plus className="w-4 h-4" />
          Nuevo Trámite
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Trámites" value={stats?.total_tramites} icon={FileText}
          colorClass="bg-blue-100 text-blue-600"
          onClick={() => router.push('/tramites')} />
        <StatCard title="A Tiempo" value={stats?.tramites_a_tiempo} icon={CheckCircle}
          colorClass="bg-emerald-100 text-emerald-600"
          onClick={() => router.push('/tramites?color=verde')} />
        <StatCard title="Por Vencer" value={stats?.tramites_en_proceso} icon={Clock}
          colorClass="bg-amber-100 text-amber-600"
          onClick={() => router.push('/tramites?color=amarillo')} />
        <StatCard title="Fuera de Tiempo" value={stats?.tramites_fuera_tiempo} icon={AlertTriangle}
          colorClass="bg-rose-100 text-rose-600"
          onClick={() => router.push('/tramites?color=rojo')} />
        <StatCard title="Completados" value={stats?.tramites_completados} icon={XCircle}
          colorClass="bg-slate-100 text-slate-600"
          onClick={() => router.push('/tramites?estatus=completado')} />
        <StatCard title="Total Clientes" value={stats?.total_clientes} icon={Users}
          colorClass="bg-purple-100 text-purple-600"
          onClick={() => router.push('/clientes')} />
      </div>

      {/* Recent tramites */}
      <div className="bg-white rounded-xl border">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="font-semibold text-slate-900">Trámites Recientes</h2>
          <Link href="/tramites" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
            Ver todos <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="divide-y">
          {stats?.tramites_recientes?.length === 0 && (
            <div className="p-6 text-center text-gray-400 text-sm">No hay trámites recientes</div>
          )}
          {stats?.tramites_recientes?.map((t: any) => (
            <Link key={t.id} href={`/tramites/${t.id}`}
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-medium text-slate-900 text-sm">{t.titulo}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.cliente_nombre} · {formatDate(t.created_at)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full border font-medium ${getStatusColor(t.color_estado)}`}>
                  {getStatusLabel(t.color_estado)}
                </span>
                <span className="text-xs text-gray-400">{getEstatusLabel(t.estatus)}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
