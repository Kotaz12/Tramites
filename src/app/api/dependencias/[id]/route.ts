import { NextRequest } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/utils';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser(req);
  if (!user) return apiError('No autorizado', 401);
  const { nombre, descripcion } = await req.json();
  const rows = await query<any>(
    'UPDATE dependencias SET nombre=$1, descripcion=$2 WHERE id=$3 RETURNING *',
    [nombre, descripcion || null, params.id]
  );
  if (!rows[0]) return apiError('Dependencia no encontrada', 404);
  return apiResponse(rows[0]);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser(req);
  if (!user) return apiError('No autorizado', 401);
  const existing = await queryOne('SELECT id FROM dependencias WHERE id = $1', [params.id]);
  if (!existing) return apiError('Dependencia no encontrada', 404);
  await query('DELETE FROM dependencias WHERE id = $1', [params.id]);
  return apiResponse({ message: 'Dependencia eliminada' });
}
