import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser, hashPassword } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return apiError('No autorizado', 401);
  if (user.rol !== 'admin') return apiError('Acceso denegado', 403);
  const users = await query('SELECT id, email, nombre, rol, created_at FROM users ORDER BY nombre ASC');
  return apiResponse(users);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return apiError('No autorizado', 401);
  if (user.rol !== 'admin') return apiError('Acceso denegado', 403);

  const { email, nombre, rol = 'empleado', password } = await req.json();
  if (!email || !nombre || !password) return apiError('Campos requeridos faltantes');

  const hashed = hashPassword(password);
  const rows = await query<any>(
    'INSERT INTO users (email, nombre, rol, password) VALUES ($1, $2, $3, $4) RETURNING id, email, nombre, rol, created_at',
    [email, nombre, rol, hashed]
  );
  return apiResponse(rows[0], 201);
}
