# Sistema de Gestión de Trámites — Next.js + PostgreSQL

Sistema completo migrado de React + FastAPI + MongoDB a **Next.js 14 + PostgreSQL**.

## Stack

- **Frontend**: Next.js 14 App Router + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes (App Router)
- **Base de datos**: PostgreSQL con driver nativo `pg`
- **Auth**: JWT + bcryptjs

## Requisitos

- Node.js 18+
- PostgreSQL 14+

## Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar PostgreSQL

Crea una base de datos:

```sql
CREATE DATABASE tramites_db;
```

### 3. Variables de entorno

Copia `.env.local.example` a `.env.local` y configura:

```bash
cp .env.local.example .env.local
```

Edita `.env.local`:

```env
DATABASE_URL=postgresql://postgres:tu_password@localhost:5432/tramites_db
JWT_SECRET=tu-secreto-seguro-aqui
```

### 4. Ejecutar migraciones

```bash
# Crea las tablas en PostgreSQL
npm run db:migrate

# Inserta datos de prueba (opcional)
npm run db:seed
```

También puedes ejecutar el schema.sql directamente:

```bash
psql -U postgres -d tramites_db -f schema.sql
```

### 5. Iniciar el servidor

```bash
npm run dev
```

Visita: http://localhost:3000

## Credenciales por defecto (después del seed)

| Email | Contraseña | Rol |
|-------|------------|-----|
| admin@tramites.com | admin123 | Admin |
| empleado@tramites.com | admin123 | Empleado |

O usa el botón **"Inicializar datos de ejemplo"** en la pantalla de login.

## Estructura del proyecto

```
src/
├── app/
│   ├── api/                    # API Routes (backend)
│   │   ├── auth/               # Login, register, me
│   │   ├── tramites/           # CRUD trámites + notas
│   │   ├── clientes/           # CRUD clientes
│   │   ├── tipos-tramite/      # CRUD tipos
│   │   ├── dependencias/       # CRUD dependencias
│   │   ├── usuarios/           # CRUD usuarios (admin)
│   │   ├── notificaciones/     # Notificaciones
│   │   ├── dashboard/          # Stats dashboard
│   │   └── init-data/          # Seed inicial
│   ├── dashboard/              # Página dashboard
│   ├── tramites/               # Lista, detalle, form
│   ├── clientes/               # Gestión de clientes
│   ├── tipos-tramite/          # Tipos de trámite
│   ├── dependencias/           # Dependencias
│   ├── usuarios/               # Admin de usuarios
│   ├── notificaciones/         # Notificaciones
│   └── login/                  # Autenticación
├── components/
│   ├── Layout.tsx              # Sidebar + nav
│   ├── ProtectedLayout.tsx     # Auth wrapper
│   ├── TramiteForm.tsx         # Form reutilizable
│   └── Providers.tsx           # Context wrapper
├── context/
│   └── AuthContext.tsx         # Estado global de auth
├── hooks/
│   └── useApi.ts               # Hooks para API calls
└── lib/
    ├── db.ts                   # Pool de PostgreSQL
    ├── auth.ts                 # JWT + bcrypt helpers
    └── utils.ts                # Utilidades generales
```

## Esquema de base de datos

Tablas principales:
- `users` — Usuarios del sistema
- `clientes` — Clientes que hacen trámites
- `tipos_tramite` — Catálogo de tipos de trámite
- `dependencias` — Departamentos municipales
- `tramites` — Trámites con seguimiento de estado
- `notas` — Notas internas por trámite
- `notificaciones` — Sistema de notificaciones

El trigger `recalculate_tramite_color` actualiza automáticamente `color_estado` basado en `fecha_limite`.

## Variables de entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `DATABASE_URL` | URL de conexión PostgreSQL | requerida |
| `JWT_SECRET` | Secreto para firmar tokens | `tramites-secret-key-2024` |
| `NODE_ENV` | Entorno (production habilita SSL) | `development` |
