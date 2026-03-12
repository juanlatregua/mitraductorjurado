# Runbook: Migraciones Prisma

## Workflow seguro

### 1. Editar el schema
```bash
# Editar prisma/schema.prisma
# REGLA: todo modelo nuevo DEBE tener tenantId String @default("default")
```

### 2. Crear migración
```bash
npx prisma migrate dev --name descripcion-del-cambio
```
Esto:
- Genera SQL en `prisma/migrations/TIMESTAMP_descripcion/`
- Aplica la migración a la DB local
- Regenera Prisma Client

### 3. Verificar
```bash
npx prisma validate     # valida schema
npx prisma format       # formatea schema
npm run db:studio        # inspeccionar datos
```

### 4. Si se añaden tablas nuevas con tenantId
Actualizar `prisma/rls-setup.sql` con la nueva política:
```sql
ALTER TABLE "NuevaTabla" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_nueva ON "NuevaTabla"
  USING ("tenantId" = current_setting('app.tenant_id', true));
```
Luego ejecutar: `npm run db:rls`

## Comandos útiles

| Comando | Uso |
|---------|-----|
| `npx prisma migrate dev` | Crear y aplicar migración en desarrollo |
| `npx prisma migrate deploy` | Aplicar migraciones pendientes en producción (Vercel lo hace automático) |
| `npx prisma db push` | Push schema sin crear migración (útil para prototipar) |
| `npx prisma migrate reset` | Borrar y recrear DB (DESTRUCTIVO) |
| `npx prisma generate` | Regenerar client sin migrar |

## Producción (Vercel)

El build script `prisma generate && next build` regenera el client en cada deploy.

Las migraciones se aplican por separado:
- Opción A: `npx prisma migrate deploy` desde local contra la DB de producción
- Opción B: GitHub Action que ejecuta migrate deploy

## Precauciones
- **NUNCA** usar `migrate reset` en producción
- **NUNCA** quitar un campo sin antes verificar que no se usa en código
- Renombrar campos genera DROP + ADD → se pierden datos. Usar `@map` para renombrar en DB sin perder datos
- Si la migración falla a mitad, Prisma marca la migración como `failed`. Hay que resolverla manualmente con `prisma migrate resolve`
