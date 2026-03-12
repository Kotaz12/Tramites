import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/utils';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser(req);
  if (!user) return apiError('No autorizado', 401);
  await query(
    'UPDATE notificaciones SET leida = TRUE WHERE id = $1 AND user_id = $2',
    [params.id, user.id]
  );
  return apiResponse({ message: 'Notificación marcada como leída' });
}
