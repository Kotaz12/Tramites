import { NextRequest } from 'next/server';
import { query, queryOne } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { apiResponse, apiError } from '@/lib/utils';

export async function POST(req: NextRequest) {
  try {
    const existing = await queryOne('SELECT id FROM users WHERE email = $1', ['admin@tramites.com']);
    if (existing) return apiResponse({ message: 'Datos ya inicializados' });

    const hash = hashPassword('admin123');
    await query(
      "INSERT INTO users (email, nombre, rol, password) VALUES ('admin@tramites.com', 'Administrador', 'admin', $1)",
      [hash]
    );

    await query(`
      INSERT INTO tipos_tramite (nombre, descripcion, dias_respuesta) VALUES
        ('Licencia de Construcción', 'Permiso para construcción', 15),
        ('Permiso de Uso de Suelo', 'Autorización de uso de suelo', 10),
        ('Constancia de No Adeudo', 'Documento de no adeudo', 3)
    `);

    await query(`
      INSERT INTO dependencias (nombre, descripcion) VALUES
        ('Desarrollo Urbano', 'Departamento de desarrollo urbano'),
        ('Catastro', 'Departamento de catastro'),
        ('Tesorería', 'Departamento de tesorería')
    `);

    return apiResponse({
      message: 'Datos de ejemplo creados',
      admin_email: 'admin@tramites.com',
      admin_password: 'admin123',
    }, 201);
  } catch (e: any) {
    return apiError(e.message, 500);
  }
}
