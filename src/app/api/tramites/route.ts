import { NextRequest } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser, calculateColorEstado } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return apiError('No autorizado', 401);

  const { searchParams } = new URL(req.url);
  const estatus = searchParams.get('estatus');
  const color = searchParams.get('color');

  let sql = `
    SELECT 
      t.*,
      c.nombre AS cliente_nombre,
      tt.nombre AS tipo_tramite_nombre,
      d.nombre AS dependencia_nombre,
      u.nombre AS empleado_nombre,
      COUNT(n.id)::int AS notas_count
    FROM tramites t
    LEFT JOIN clientes c ON t.cliente_id = c.id
    LEFT JOIN tipos_tramite tt ON t.tipo_tramite_id = tt.id
    LEFT JOIN dependencias d ON t.dependencia_id = d.id
    LEFT JOIN users u ON t.empleado_asignado_id = u.id
    LEFT JOIN notas n ON t.id = n.tramite_id
    WHERE 1=1
  `;
  const params: any[] = [];

  if (estatus) {
    params.push(estatus);
    sql += ` AND t.estatus = $${params.length}`;
  }
  if (color) {
    params.push(color);
    sql += ` AND t.color_estado = $${params.length}`;
  }

  sql += ' GROUP BY t.id, c.nombre, tt.nombre, d.nombre, u.nombre ORDER BY t.created_at DESC';

  const tramites = await query<any>(sql, params);
  return apiResponse(tramites);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return apiError('No autorizado', 401);

  try {
    const body = await req.json();
    const { titulo, descripcion, cliente_id, tipo_tramite_id, dependencia_id, responsable, empleado_asignado_id } = body;

    if (!titulo || !cliente_id || !tipo_tramite_id || !dependencia_id || !responsable) {
      return apiError('Campos requeridos faltantes');
    }

    const tipo = await queryOne<any>('SELECT dias_respuesta FROM tipos_tramite WHERE id = $1', [tipo_tramite_id]);
    if (!tipo) return apiError('Tipo de trámite no encontrado');

    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() + tipo.dias_respuesta);

    const rows = await query<any>(`
      INSERT INTO tramites (titulo, descripcion, cliente_id, tipo_tramite_id, dependencia_id, responsable, empleado_asignado_id, estatus, fecha_limite)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'pendiente', $8)
      RETURNING *
    `, [titulo, descripcion || null, cliente_id, tipo_tramite_id, dependencia_id, responsable, empleado_asignado_id || null, fechaLimite]);

    const tramite = rows[0];

    // Notify all users
    const allUsers = await query<any>('SELECT id FROM users');
    for (const u of allUsers) {
      const cliente = await queryOne<any>('SELECT nombre FROM clientes WHERE id = $1', [cliente_id]);
      await query(
        'INSERT INTO notificaciones (tipo, mensaje, tramite_id, user_id) VALUES ($1, $2, $3, $4)',
        ['nuevo_tramite', `Nuevo trámite: ${titulo} para ${cliente?.nombre || 'Cliente'}`, tramite.id, u.id]
      );
    }

    // Return enriched
    const enriched = await query<any>(`
      SELECT t.*, c.nombre AS cliente_nombre, tt.nombre AS tipo_tramite_nombre,
        d.nombre AS dependencia_nombre, u.nombre AS empleado_nombre, 0::int AS notas_count
      FROM tramites t
      LEFT JOIN clientes c ON t.cliente_id = c.id
      LEFT JOIN tipos_tramite tt ON t.tipo_tramite_id = tt.id
      LEFT JOIN dependencias d ON t.dependencia_id = d.id
      LEFT JOIN users u ON t.empleado_asignado_id = u.id
      WHERE t.id = $1
    `, [tramite.id]);

    return apiResponse(enriched[0], 201);
  } catch (e: any) {
    return apiError(e.message, 500);
  }
}
