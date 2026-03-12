import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return apiError('No autorizado', 401);
  const tipos = await query('SELECT * FROM tipos_tramite ORDER BY nombre ASC');
  return apiResponse(tipos);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return apiError('No autorizado', 401);
  const { nombre, descripcion, dias_respuesta = 5 } = await req.json();
  if (!nombre) return apiError('El nombre es requerido');
  const rows = await query<any>(
    'INSERT INTO tipos_tramite (nombre, descripcion, dias_respuesta) VALUES ($1, $2, $3) RETURNING *',
    [nombre, descripcion || null, dias_respuesta]
  );
  return apiResponse(rows[0], 201);
}
