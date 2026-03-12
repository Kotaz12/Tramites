import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return apiError('No autorizado', 401);

  const { searchParams } = new URL(req.url);
  if (searchParams.get('unread_count') === '1') {
    const rows = await query<any>(
      'SELECT COUNT(*)::int AS count FROM notificaciones WHERE user_id = $1 AND leida = FALSE',
      [user.id]
    );
    return apiResponse({ count: rows[0].count });
  }

  const notifs = await query(
    'SELECT * FROM notificaciones WHERE user_id = $1 ORDER BY created_at DESC LIMIT 100',
    [user.id]
  );
  return apiResponse(notifs);
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return apiError('No autorizado', 401);

  const { searchParams } = new URL(req.url);
  if (searchParams.get('read_all') === '1') {
    await query(
      'UPDATE notificaciones SET leida = TRUE WHERE user_id = $1 AND leida = FALSE',
      [user.id]
    );
    return apiResponse({ message: 'Todas las notificaciones marcadas como leídas' });
  }

  return apiError('Acción no válida');
}
