import { NextRequest } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/utils';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser(req);
  if (!user) return apiError('No autorizado', 401);

  const tramite = await queryOne<any>(`
    SELECT t.*, c.nombre AS cliente_nombre, tt.nombre AS tipo_tramite_nombre,
      d.nombre AS dependencia_nombre, u.nombre AS empleado_nombre,
      COUNT(n.id)::int AS notas_count
    FROM tramites t
    LEFT JOIN clientes c ON t.cliente_id = c.id
    LEFT JOIN tipos_tramite tt ON t.tipo_tramite_id = tt.id
    LEFT JOIN dependencias d ON t.dependencia_id = d.id
    LEFT JOIN users u ON t.empleado_asignado_id = u.id
    LEFT JOIN notas n ON t.id = n.tramite_id
    WHERE t.id = $1
    GROUP BY t.id, c.nombre, tt.nombre, d.nombre, u.nombre
  `, [params.id]);

  if (!tramite) return apiError('Trámite no encontrado', 404);
  return apiResponse(tramite);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser(req);
  if (!user) return apiError('No autorizado', 401);

  try {
    const body = await req.json();
    const existing = await queryOne<any>('SELECT * FROM tramites WHERE id = $1', [params.id]);
    if (!existing) return apiError('Trámite no encontrado', 404);

    const allowedFields = ['titulo', 'descripcion', 'cliente_id', 'tipo_tramite_id', 'dependencia_id', 'responsable', 'empleado_asignado_id', 'estatus'];
    const updates: string[] = [];
    const values: any[] = [];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        values.push(body[field]);
        updates.push(`${field} = $${values.length}`);
      }
    }

    // If tipo changes, recalculate fecha_limite
    if (body.tipo_tramite_id) {
      const tipo = await queryOne<any>('SELECT dias_respuesta FROM tipos_tramite WHERE id = $1', [body.tipo_tramite_id]);
      if (tipo) {
        const created = new Date(existing.created_at);
        const fechaLimite = new Date(created);
        fechaLimite.setDate(fechaLimite.getDate() + tipo.dias_respuesta);
        values.push(fechaLimite);
        updates.push(`fecha_limite = $${values.length}`);
      }
    }

    if (updates.length === 0) return apiError('No hay campos para actualizar');

    values.push(params.id);
    await query(
      `UPDATE tramites SET ${updates.join(', ')} WHERE id = $${values.length}`,
      values
    );

    const tramite = await queryOne<any>(`
      SELECT t.*, c.nombre AS cliente_nombre, tt.nombre AS tipo_tramite_nombre,
        d.nombre AS dependencia_nombre, u.nombre AS empleado_nombre,
        COUNT(n.id)::int AS notas_count
      FROM tramites t
      LEFT JOIN clientes c ON t.cliente_id = c.id
      LEFT JOIN tipos_tramite tt ON t.tipo_tramite_id = tt.id
      LEFT JOIN dependencias d ON t.dependencia_id = d.id
      LEFT JOIN users u ON t.empleado_asignado_id = u.id
      LEFT JOIN notas n ON t.id = n.tramite_id
      WHERE t.id = $1
      GROUP BY t.id, c.nombre, tt.nombre, d.nombre, u.nombre
    `, [params.id]);

    return apiResponse(tramite);
  } catch (e: any) {
    return apiError(e.message, 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser(req);
  if (!user) return apiError('No autorizado', 401);

  const existing = await queryOne('SELECT id FROM tramites WHERE id = $1', [params.id]);
  if (!existing) return apiError('Trámite no encontrado', 404);

  await query('DELETE FROM tramites WHERE id = $1', [params.id]);
  return apiResponse({ message: 'Trámite eliminado' });
}
