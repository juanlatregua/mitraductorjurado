# ADR 002: Neon + Prisma en vez de Supabase

## Contexto
Se necesita PostgreSQL con:
- Row-Level Security para multi-tenancy
- ORM type-safe para TypeScript
- Branching de DB para desarrollo
- Coste bajo al inicio

## Opciones evaluadas
1. **Supabase** — PostgreSQL + auth + storage + realtime
2. **Neon + Prisma** — PostgreSQL serverless + ORM

## Decisión
Neon para la base de datos + Prisma como ORM.

## Razones
- **Prisma** da type-safety completo con el schema → menos bugs
- **Neon** tiene branching nativo de DB → ideal para desarrollo
- Supabase auth compite con NextAuth → duplicación innecesaria
- Supabase RLS usa sus propias políticas → Prisma middleware es más flexible
- Neon tiene free tier generoso y escala con serverless
- Prisma Studio para inspeccionar datos sin escribir SQL

## Consecuencias
- RLS se implementa manualmente (`prisma/rls-setup.sql`)
- El middleware de Prisma setea `app.tenant_id` en cada query
- No hay realtime nativo (si se necesita, evaluar Neon + pg_notify)
- Storage de archivos va por Vercel Blob, no por Supabase Storage
