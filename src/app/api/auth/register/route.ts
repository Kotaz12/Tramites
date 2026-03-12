import { NextRequest } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { hashPassword, createToken } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const { email, password, nombre, rol = 'empleado' } = await req.json();
    if (!email || !password || !nombre) return apiError('Todos los campos son requeridos');

    const existing = await queryOne('SELECT id FROM users WHERE email = $1', [email]);
    if (existing) return apiError('El email ya está registrado', 409);

    const hashed = hashPassword(password);
    const rows = await query<any>(
      'INSERT INTO users (email, nombre, rol, password) VALUES ($1, $2, $3, $4) RETURNING id, email, nombre, rol',
      [email, nombre, rol, hashed]
    );
    const user = rows[0];
    const token = createToken({ user_id: user.id, email: user.email, rol: user.rol });

    return apiResponse({ access_token: token, token_type: 'bearer', user }, 201);
  } catch (e: any) {
    return apiError(e.message, 500);
  }
}
