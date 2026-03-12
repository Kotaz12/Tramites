import { NextRequest } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/utils';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser(req);
  if (!user) return apiError('No autorizado', 401);
  const { nombre, email, telefono, direccion } = await req.json();
  const rows = await query<any>(
    'UPDATE clientes SET nombre=$1, email=$2, telefono=$3, direccion=$4 WHERE id=$5 RETURNING *',
    [nombre, email || null, telefono || null, direccion || null, params.id]
  );
  if (!rows[0]) return apiError('Cliente no encontrado', 404);
  return apiResponse(rows[0]);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser(req);
  if (!user) return apiError('No autorizado', 401);
  const existing = await queryOne('SELECT id FROM clientes WHERE id = $1', [params.id]);
  if (!existing) return apiError('Cliente no encontrado', 404);
  await query('DELETE FROM clientes WHERE id = $1', [params.id]);
  return apiResponse({ message: 'Cliente eliminado' });
}
