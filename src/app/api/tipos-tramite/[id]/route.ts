import { NextRequest } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/utils';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser(req);
  if (!user) return apiError('No autorizado', 401);
  const { nombre, descripcion, dias_respuesta } = await req.json();
  const rows = await query<any>(
    'UPDATE tipos_tramite SET nombre=$1, descripcion=$2, dias_respuesta=$3 WHERE id=$4 RETURNING *',
    [nombre, descripcion || null, dias_respuesta || 5, params.id]
  );
  if (!rows[0]) return apiError('Tipo de trámite no encontrado', 404);
  return apiResponse(rows[0]);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser(req);
  if (!user) return apiError('No autorizado', 401);
  const existing = await queryOne('SELECT id FROM tipos_tramite WHERE id = $1', [params.id]);
  if (!existing) return apiError('Tipo de trámite no encontrado', 404);
  await query('DELETE FROM tipos_tramite WHERE id = $1', [params.id]);
  return apiResponse({ message: 'Tipo de trámite eliminado' });
}
