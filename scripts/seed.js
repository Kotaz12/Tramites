#!/usr/bin/env node
/**
 * Seed script - Run: node scripts/seed.js
 * Make sure DATABASE_URL is set in .env.local
 */

require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function seed() {
  const client = await pool.connect();
  try {
    console.log('🌱 Seeding database...');

    // Admin user
    const adminExists = await client.query(
      "SELECT id FROM users WHERE email = 'admin@tramites.com'"
    );
    if (adminExists.rows.length > 0) {
      console.log('⚠️  Data already seeded. Skipping...');
      return;
    }

    const passwordHash = bcrypt.hashSync('admin123', 10);
    
    await client.query(`
      INSERT INTO users (email, nombre, rol, password)
      VALUES 
        ('admin@tramites.com', 'Administrador', 'admin', $1),
        ('empleado@tramites.com', 'Juan Pérez', 'empleado', $1)
    `, [passwordHash]);

    await client.query(`
      INSERT INTO tipos_tramite (nombre, descripcion, dias_respuesta)
      VALUES 
        ('Licencia de Construcción', 'Permiso para construcción de inmuebles', 15),
        ('Permiso de Uso de Suelo', 'Autorización de uso y aprovechamiento del suelo', 10),
        ('Constancia de No Adeudo', 'Documento que certifica no tener adeudos municipales', 3),
        ('Licencia de Funcionamiento', 'Permiso para operar establecimientos comerciales', 7),
        ('Registro Civil', 'Trámites de registro civil y actas', 5)
    `);

    await client.query(`
      INSERT INTO dependencias (nombre, descripcion)
      VALUES 
        ('Desarrollo Urbano', 'Departamento de planeación y desarrollo urbano'),
        ('Catastro', 'Departamento de catastro municipal'),
        ('Tesorería', 'Departamento de tesorería y finanzas'),
        ('Servicios Públicos', 'Departamento de servicios públicos municipales'),
        ('Registro Civil', 'Oficina del registro civil')
    `);

    await client.query(`
      INSERT INTO clientes (nombre, email, telefono, direccion)
      VALUES 
        ('María García López', 'maria@example.com', '624-100-0001', 'Av. Reforma 123, Centro'),
        ('Carlos Rodríguez Méndez', 'carlos@example.com', '624-100-0002', 'Calle 5 de Mayo 456'),
        ('Constructora ABC S.A.', 'contacto@abc.com', '624-100-0003', 'Blvd. Mijares 789')
    `);

    console.log('✅ Database seeded successfully!');
    console.log('');
    console.log('Admin credentials:');
    console.log('  Email:    admin@tramites.com');
    console.log('  Password: admin123');
    console.log('');
    console.log('Empleado credentials:');
    console.log('  Email:    empleado@tramites.com');
    console.log('  Password: admin123');
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(console.error);
