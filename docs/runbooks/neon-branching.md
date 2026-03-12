# Runbook: Branching de Neon

## Qué es
Neon permite crear ramas de la base de datos (como git branches). Cada rama es una copia copy-on-write de la DB en ese punto.

## Cuándo usar
- Probar migraciones destructivas antes de aplicarlas a producción
- Desarrollar features con datos de producción sin riesgo
- Preview deployments en Vercel (cada PR con su propia DB)

## Crear una rama

### Desde la consola de Neon
1. Panel de Neon → proyecto mitraductorjurado
2. Branches → Create Branch
3. Nombre: `dev/feature-nombre` o `sprint/S3`
4. Parent: `main` (rama principal de producción)
5. Copiar el connection string de la nueva rama

### Desde CLI (Neon CLI)
```bash
# Instalar
brew install neonctl

# Crear rama
neonctl branches create --name dev/feature-nombre --project-id <project-id>

# Listar ramas
neonctl branches list --project-id <project-id>

# Obtener connection string
neonctl connection-string --branch dev/feature-nombre
```

## Usar la rama en desarrollo
```bash
# En .env, cambiar DATABASE_URL al connection string de la rama
DATABASE_URL="postgresql://...@ep-branch-xxx.eu-central-1.aws.neon.tech/mitraductorjurado?sslmode=require"

# Aplicar migraciones pendientes
npx prisma migrate deploy
```

## Integración con Vercel Preview (TODO)
Vercel puede asignar una rama de Neon por cada Preview Deployment:
1. Instalar integración Neon en Vercel
2. Configurar `NEON_PROJECT_ID` como variable de entorno
3. Cada PR crea una rama de Neon automáticamente

## Limpiar ramas
```bash
# Eliminar rama cuando ya no se necesita
neonctl branches delete dev/feature-nombre --project-id <project-id>
```

Las ramas inactivas se suspenden automáticamente (no consumen compute), pero conviene eliminar las que ya no se usan.

## Notas
- Las ramas comparten storage con el parent (copy-on-write) → coste mínimo
- Una rama puede vivir indefinidamente sin coste de compute si está inactiva
- El free tier de Neon permite hasta 10 ramas
