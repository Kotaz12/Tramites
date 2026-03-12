import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) return apiError('No autorizado', 401);
  return apiResponse({ id: user.id, email: user.email, nombre: user.nombre, rol: user.rol });
}
