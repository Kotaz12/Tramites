import { NextRequest } from 'next/server';
import { queryOne } from '@/lib/db';
import { verifyPassword, createToken } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) return apiError('Email y contraseña requeridos');

    const user = await queryOne<any>(
      'SELECT id, email, nombre, rol, password FROM users WHERE email = $1',
      [email]
    );

    if (!user || !verifyPassword(password, user.password)) {
      return apiError('Credenciales inválidas', 401);
    }

    const token = createToken({ user_id: user.id, email: user.email, rol: user.rol });

    return apiResponse({
      access_token: token,
      token_type: 'bearer',
      user: { id: user.id, email: user.email, nombre: user.nombre, rol: user.rol },
    });
  } catch (e: any) {
    return apiError(e.message, 500);
  }
}
