import { NextRequest } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/utils';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser(req);
  if (!user) return apiError('No autorizado', 401);

  const notas = await query<any>(
    'SELECT * FROM notas WHERE tramite_id = $1 ORDER BY created_at DESC',
    [params.id]
  );
  return apiResponse(notas);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser(req);
  if (!user) return apiError('No autorizado', 401);

  const tramite = await queryOne<any>('SELECT titulo FROM tramites WHERE id = $1', [params.id]);
  if (!tramite) return apiError('Trámite no encontrado', 404);

  const { contenido } = await req.json();
  if (!contenido?.trim()) return apiError('El contenido es requerido');

  const rows = await query<any>(
    'INSERT INTO notas (tramite_id, contenido, autor_id, autor_nombre) VALUES ($1, $2, $3, $4) RETURNING *',
    [params.id, contenido, user.id, user.nombre]
  );

  // Notify all users
  const allUsers = await query<any>('SELECT id FROM users');
  for (const u of allUsers) {
    if (u.id !== user.id) {
      await query(
        'INSERT INTO notificaciones (tipo, mensaje, tramite_id, user_id) VALUES ($1, $2, $3, $4)',
        ['nota_agregada', `Nueva nota en trámite: ${tramite.titulo}`, params.id, u.id]
      );
    }
  }

  return apiResponse(rows[0], 201);
}
