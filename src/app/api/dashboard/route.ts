import { NextRequest } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return apiError('No autorizado', 401);

  const [totalTramites, totalClientes, tramitesCompletados, tramitesPorColor, recientes] = await Promise.all([
    queryOne<any>('SELECT COUNT(*)::int AS count FROM tramites'),
    queryOne<any>('SELECT COUNT(*)::int AS count FROM clientes'),
    queryOne<any>("SELECT COUNT(*)::int AS count FROM tramites WHERE estatus = 'completado'"),
    query<any>(`
      SELECT color_estado, COUNT(*)::int AS count
      FROM tramites
      WHERE estatus != 'completado'
      GROUP BY color_estado
    `),
    query<any>(`
      SELECT t.id, t.titulo, t.color_estado, t.estatus, t.created_at, c.nombre AS cliente_nombre
      FROM tramites t
      LEFT JOIN clientes c ON t.cliente_id = c.id
      ORDER BY t.created_at DESC
      LIMIT 5
    `),
  ]);

  const colorMap: Record<string, number> = { verde: 0, amarillo: 0, rojo: 0 };
  for (const row of tramitesPorColor) {
    colorMap[row.color_estado] = row.count;
  }

  return apiResponse({
    total_tramites: totalTramites?.count || 0,
    tramites_a_tiempo: colorMap.verde,
    tramites_en_proceso: colorMap.amarillo,
    tramites_fuera_tiempo: colorMap.rojo,
    tramites_completados: tramitesCompletados?.count || 0,
    total_clientes: totalClientes?.count || 0,
    tramites_recientes: recientes,
  });
}
