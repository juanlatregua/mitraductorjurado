# Runbook: Arranque local

## Requisitos previos
- Node.js 18+
- PostgreSQL (o conexión a Neon)
- Cuenta Resend (para email magic link)

## Pasos

### 1. Clonar e instalar
```bash
git clone https://github.com/juanlatregua/mitraductorjurado.git
cd mitraductorjurado
npm install
```

### 2. Configurar variables de entorno
```bash
cp .env.example .env
```

Rellenar como mínimo:
| Variable | Cómo obtenerla |
|----------|---------------|
| `DATABASE_URL` | Panel de Neon → Connection string (con `?sslmode=require`) |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `RESEND_API_KEY` | resend.com → API Keys |

Opcionales para dev:
- `GOOGLE_CLIENT_ID/SECRET` — Solo si quieres OAuth Google
- `BLOB_READ_WRITE_TOKEN` — Solo si pruebas subida de fotos

### 3. Inicializar base de datos
```bash
npx prisma migrate dev    # crea tablas
npm run db:rls             # activa Row-Level Security (requiere psql)
```

Si no tienes `psql` instalado, puedes ejecutar `rls-setup.sql` desde el SQL Editor de Neon.

### 4. Arrancar dev server
```bash
npm run dev
```

App disponible en `http://localhost:3000`.

### 5. Verificar funcionamiento
1. Ir a `/auth/login` — Debería mostrar formulario de email
2. Introducir un email → Resend envía magic link
3. Hacer click en el link → Redirige a `/auth/onboarding`
4. Completar onboarding → Redirige a `/dashboard`

## Herramientas útiles
```bash
npm run db:studio   # Prisma Studio en http://localhost:5555
npx prisma format   # Formatear schema.prisma
```

## Problemas comunes

| Problema | Solución |
|----------|----------|
| `P1001: Can't reach database` | Verificar DATABASE_URL, comprobar que la IP está autorizada en Neon |
| `NEXTAUTH_SECRET missing` | Generar con `openssl rand -base64 32` y añadir a .env |
| Email no llega | Verificar RESEND_API_KEY y que el dominio está verificado en Resend |
| `useSearchParams` error | Envolver en `<Suspense>` — es requisito de Next.js 14 |
