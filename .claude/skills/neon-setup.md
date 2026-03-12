# Neon (PostgreSQL) en mitraductorjurado

## Conexión
La base de datos es PostgreSQL hospedado en Neon.
La conexión se configura en `DATABASE_URL` en `.env`:
```
DATABASE_URL="postgresql://USER:PASSWORD@ep-xxx.region.aws.neon.tech/mitraductorjurado?sslmode=require"
```

## Variables de entorno necesarias
```env
DATABASE_URL=   # Connection string completo de Neon (con ?sslmode=require)
```
El `?sslmode=require` es obligatorio para Neon.

## Cómo está conectado al proyecto
1. `prisma/schema.prisma` → `datasource db { url = env("DATABASE_URL") }`
2. `lib/prisma.ts` → Singleton PrismaClient con middleware RLS
3. El middleware setea `app.tenant_id` en cada query vía `set_config()`

## Row-Level Security
RLS está habilitado en 13 tablas. Tras la primera migración:
```bash
npm run db:rls    # ejecuta prisma/rls-setup.sql
```
El usuario de PostgreSQL que ejecuta migraciones necesita `BYPASSRLS`.

## Branching de DB para desarrollo
Neon soporta branches de base de datos (como git branches):
```
# Desde el dashboard de Neon:
# 1. Crear branch desde main
# 2. Copiar el connection string del branch
# 3. Usarlo en .env local
```
TODO: Automatizar branching con `neonctl` CLI.

## Diferencia local vs producción
| | Local | Producción |
|---|---|---|
| Host | localhost:5432 o branch de Neon | Neon main branch |
| SSL | opcional | obligatorio (sslmode=require) |
| RLS | manual (`npm run db:rls`) | aplicar tras cada migración |
| Migraciones | `prisma migrate dev` | `prisma migrate deploy` |
| Usuario | BYPASSRLS | BYPASSRLS para migraciones |

## Aplicar migraciones en producción
```bash
DATABASE_URL="<production_url>" npx prisma migrate deploy
```
Nunca usar `migrate dev` en producción — solo `migrate deploy`.
