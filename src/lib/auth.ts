import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { queryOne } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'tramites-secret-key-2024';
const JWT_EXPIRATION = '24h';

export interface JWTPayload {
  user_id: string;
  email: string;
  rol: string;
}

export interface User {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  created_at: Date;
}

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hashed: string): boolean {
  return bcrypt.compareSync(password, hashed);
}

export function createToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

export async function getCurrentUser(req: NextRequest): Promise<User | null> {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;
    
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    
    const user = await queryOne<User>(
      'SELECT id, email, nombre, rol, created_at FROM users WHERE id = $1',
      [payload.user_id]
    );
    
    return user;
  } catch {
    return null;
  }
}

export function requireAuth() {
  return async (req: NextRequest) => {
    const user = await getCurrentUser(req);
    if (!user) {
      return { error: 'No autorizado', status: 401 };
    }
    return { user };
  };
}

export function calculateColorEstado(fechaLimite: Date, estatus: string): string {
  if (estatus === 'completado') return 'verde';
  
  const now = new Date();
  const diffMs = fechaLimite.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  
  if (diffDays < 0) return 'rojo';
  if (diffDays <= 2) return 'amarillo';
  return 'verde';
}
