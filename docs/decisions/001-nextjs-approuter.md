# ADR 001: Next.js 14 con App Router

## Contexto
Se necesita un framework fullstack que permita:
- Server components para SEO (perfiles públicos de traductores)
- API routes integradas (sin backend separado)
- Deploy sencillo en Vercel
- TypeScript nativo

## Decisión
Next.js 14 con App Router (no Pages Router).

## Razones
- App Router permite server components por defecto → mejor SEO
- Layouts anidados → sidebar de dashboard reutilizable por rol
- Route groups → separación clara de auth, dashboard, público
- Middleware nativo → protección de rutas JWT sin librería extra
- Vercel = deploy en un click, sin configurar infra

## Consecuencias
- `useSearchParams()` requiere `<Suspense>` boundary (Next 14)
- Los server components no pueden usar hooks de React
- Las API routes viven dentro de `app/api/` (no separadas)
- Build script: `prisma generate && next build` (Vercel cachea node_modules)
