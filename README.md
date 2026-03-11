# mitraductorjurado.es

Sistema operativo del traductor jurado en España.

## Setup inicial (Sprint 0)

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.local.example .env.local
# Editar .env.local con tus credenciales
```

### 3. Base de datos
```bash
# Crear base de datos PostgreSQL (Railway o Supabase recomendado)
# Añadir DATABASE_URL en .env.local

# Primera migración
npm run db:migrate -- --name init

# Activar Row-Level Security (CRÍTICO - hacer una sola vez)
npm run db:rls
```

### 4. Generar cliente Prisma
```bash
npm run db:generate
```

### 5. Arrancar en desarrollo
```bash
npm run dev
```

## Estructura del proyecto

Ver `CLAUDE.md` para contexto completo del proyecto.

## Comandos útiles

```bash
npm run dev              # desarrollo local
npm run db:migrate       # nueva migración
npm run db:studio        # GUI base de datos
npm run db:rls           # activar RLS (solo una vez)
vercel --prod            # deploy a producción
```

## Stack

- Next.js 14 + App Router + TypeScript
- PostgreSQL + Prisma (RLS activado)
- NextAuth (JWT + roles)
- Stripe Connect
- DeepL API
- Signaturit / eIDAS
- Verifactu
- Vercel Blob + Resend

## Sprints

| Sprint | Objetivo |
|--------|----------|
| S0 | Cimientos: DB, Auth, Middleware ← **aquí** |
| S1 | Auth completo + dashboards |
| S2 | Perfil traductor + MAEC |
| S3 | Editor bilingüe (núcleo diferencial) |
| S4 | Base de plantillas 35 tipos |
| S5 | Flujo de pedido |
| S6 | Pagos Stripe Connect |
| S7 | Red de derivación |
| S8 | Firma eIDAS + Verifactu |
| S9 | Widget embebible |
| S10 | Lanzamiento 99 early adopters |
