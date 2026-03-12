import { NextRequest } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/utils';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser(req);
  if (!user) return apiError('No autorizado', 401);
  if (user.rol !== 'admin') return apiError('Acceso denegado', 403);
  if (user.id === params.id) return apiError('No puedes eliminar tu propia cuenta');

  const existing = await queryOne('SELECT id FROM users WHERE id = $1', [params.id]);
  if (!existing) return apiError('Usuario no encontrado', 404);

  await query('DELETE FROM users WHERE id = $1', [params.id]);
  return apiResponse({ message: 'Usuario eliminado' });
}
