-- Sistema de Gestión de Trámites - PostgreSQL Schema
-- Run: psql -U postgres -d tramites_db -f schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== USERS ====================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  rol VARCHAR(50) NOT NULL DEFAULT 'empleado' CHECK (rol IN ('admin', 'empleado')),
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==================== CLIENTES ====================
CREATE TABLE IF NOT EXISTS clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefono VARCHAR(50),
  direccion TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==================== TIPOS DE TRAMITE ====================
CREATE TABLE IF NOT EXISTS tipos_tramite (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  dias_respuesta INTEGER NOT NULL DEFAULT 5,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==================== DEPENDENCIAS ====================
CREATE TABLE IF NOT EXISTS dependencias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==================== TRAMITES ====================
CREATE TABLE IF NOT EXISTS tramites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  titulo VARCHAR(500) NOT NULL,
  descripcion TEXT,
  cliente_id UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  tipo_tramite_id UUID NOT NULL REFERENCES tipos_tramite(id) ON DELETE RESTRICT,
  dependencia_id UUID NOT NULL REFERENCES dependencias(id) ON DELETE RESTRICT,
  responsable VARCHAR(50) NOT NULL CHECK (responsable IN ('empleado', 'cliente')),
  empleado_asignado_id UUID REFERENCES users(id) ON DELETE SET NULL,
  estatus VARCHAR(50) NOT NULL DEFAULT 'pendiente' CHECK (estatus IN ('pendiente', 'en_proceso', 'completado')),
  color_estado VARCHAR(20) NOT NULL DEFAULT 'verde' CHECK (color_estado IN ('verde', 'amarillo', 'rojo')),
  fecha_limite TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX IF NOT EXISTS idx_tramites_estatus ON tramites(estatus);
CREATE INDEX IF NOT EXISTS idx_tramites_color ON tramites(color_estado);
CREATE INDEX IF NOT EXISTS idx_tramites_cliente ON tramites(cliente_id);
CREATE INDEX IF NOT EXISTS idx_tramites_created_at ON tramites(created_at DESC);

-- ==================== NOTAS ====================
CREATE TABLE IF NOT EXISTS notas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tramite_id UUID NOT NULL REFERENCES tramites(id) ON DELETE CASCADE,
  contenido TEXT NOT NULL,
  autor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  autor_nombre VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notas_tramite ON notas(tramite_id);

-- ==================== NOTIFICACIONES ====================
CREATE TABLE IF NOT EXISTS notificaciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo VARCHAR(100) NOT NULL,
  mensaje TEXT NOT NULL,
  tramite_id UUID REFERENCES tramites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  leida BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notificaciones_user ON notificaciones(user_id, leida);
CREATE INDEX IF NOT EXISTS idx_notificaciones_created ON notificaciones(created_at DESC);

-- ==================== TRIGGER: update updated_at ====================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_tramites_updated_at ON tramites;
CREATE TRIGGER update_tramites_updated_at
  BEFORE UPDATE ON tramites
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==================== TRIGGER: recalculate color_estado ====================
CREATE OR REPLACE FUNCTION recalculate_color_estado()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estatus = 'completado' THEN
    NEW.color_estado = 'verde';
  ELSIF NEW.fecha_limite < NOW() THEN
    NEW.color_estado = 'rojo';
  ELSIF NEW.fecha_limite < NOW() + INTERVAL '2 days' THEN
    NEW.color_estado = 'amarillo';
  ELSE
    NEW.color_estado = 'verde';
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS recalculate_tramite_color ON tramites;
CREATE TRIGGER recalculate_tramite_color
  BEFORE INSERT OR UPDATE ON tramites
  FOR EACH ROW EXECUTE FUNCTION recalculate_color_estado();
