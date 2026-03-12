import { NextRequest } from 'next/server';
import { query } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return apiError('No autorizado', 401);
  const clientes = await query('SELECT * FROM clientes ORDER BY nombre ASC');
  return apiResponse(clientes);
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return apiError('No autorizado', 401);

  const { nombre, email, telefono, direccion } = await req.json();
  if (!nombre) return apiError('El nombre es requerido');

  const rows = await query<any>(
    'INSERT INTO clientes (nombre, email, telefono, direccion) VALUES ($1, $2, $3, $4) RETURNING *',
    [nombre, email || null, telefono || null, direccion || null]
  );
  return apiResponse(rows[0], 201);
}
