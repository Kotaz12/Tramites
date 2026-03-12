import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return apiError('No autorizado', 401);
  const deps = await query('SELECT * FROM dependencias ORDER BY nombre ASC');
  return apiResponse(deps);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return apiError('No autorizado', 401);
  const { nombre, descripcion } = await req.json();
  if (!nombre) return apiError('El nombre es requerido');
  const rows = await query<any>(
    'INSERT INTO dependencias (nombre, descripcion) VALUES ($1, $2) RETURNING *',
    [nombre, descripcion || null]
  );
  return apiResponse(rows[0], 201);
}
