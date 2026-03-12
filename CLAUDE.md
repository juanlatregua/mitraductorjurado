# CLAUDE.md — mitraductorjurado.es

## WHY
Marketplace que conecta ~6.132 traductores jurados MAEC con clientes directos.
Elimina intermediarios (agencias) y el stack fragmentado (Adobe+DeepL+Word = 120-165€/mes).
Precio: 49€/mes fundador. Break-even: 13 subs. Gate Fase 2: 50 subs + MRR ≥ 2.000€.

## WHAT — Mapa del repo
```
app/
  page.tsx                          → Landing pública
  layout.tsx                        → Root layout + SessionProvider
  auth/login|register|onboarding    → Auth flow completo (magic link + Google)
  auth/verify|error                 → Páginas auxiliares auth
  dashboard/page.tsx                → Redirect por rol
  dashboard/translator/             → Dashboard + profile editor + KPIs
  dashboard/client/                 → Dashboard cliente + empty state
  dashboard/admin/                  → Admin panel + verificaciones MAEC
  translators/[id]/                 → Perfil público con SEO
  api/auth/[...nextauth]            → NextAuth handler
  api/auth/onboarding               → POST crear perfil (Zod validation)
  api/admin/verify                  → POST toggle verificación MAEC
  api/translator/profile            → GET/PUT perfil traductor
  api/translator/photo              → POST upload foto (Vercel Blob)
  api/translator/availability-status → PUT toggle disponibilidad
  api/orders|payments|documents|... → TODO (placeholders .gitkeep)
components/
  providers.tsx                     → SessionProvider wrapper
  dashboard/sidebar|kpi-card        → Layout components
  dashboard/availability-toggle     → Toggle disponible/ocupado/vacaciones
lib/
  auth.ts      → NextAuth config (email + Google, JWT + role + onboarded)
  prisma.ts    → Prisma client singleton + RLS tenant middleware
  session.ts   → getSession() / getCurrentUser() helpers
prisma/
  schema.prisma → 16 modelos, TODOS con tenantId
  rls-setup.sql → Row-Level Security para 13 tablas
types/
  index.ts     → Module augmentation NextAuth + interfaces dominio
```

## HOW — Comandos
```bash
npm run dev                              # Next.js dev server
npm run build                            # prisma generate && next build
npx prisma migrate dev --name <nombre>   # crear migración
npx prisma generate                      # regenerar client
npx prisma studio                        # GUI para inspeccionar datos
npm run db:rls                           # aplicar RLS tras primera migración
```

## Convenciones
- API routes: validar con Zod, responder `{ error: "msg" }` + HTTP status
- Server components: `getSession()` → `if (!session) redirect("/auth/login")`
- Client components: marcar `"use client"`, usar `useSession()`
- DB writes multi-modelo: siempre `prisma.$transaction()`
- `useSearchParams()` requiere `<Suspense>` boundary
- Colores: `navy-*` (institucional) + `accent-*` (cálido). Serif para headings.
- Cada sprint = rama `sprint/SX-nombre` → merge a `dev` → merge a `main`

## Reglas NO negociables
- `tenantId` en TODOS los modelos Prisma — sin excepción
- RLS activo en PostgreSQL — nunca desactivar, nunca añadir retroactivo
- Cliente contrata con traductor principal — nunca con el colega asignado
- No abrir marketplace público sin gate: 50 subs + MRR ≥ 2.000€
- No modificar `app/api/auth/` ni `prisma/migrations/` sin leer el CLAUDE.md local

## Estado actual
- S0 Cimientos: ✅  S1 Auth: ✅  S2 Perfil: ✅
- Siguiente: S3 Directorio público + búsqueda/filtros
- TODO: Orders, Payments, Editor, Templates, Stripe Connect, Signaturit, Verifactu

## Stack
Next.js 14 App Router · TypeScript · Prisma · Neon (PostgreSQL + RLS)
NextAuth JWT (translator|client|admin) · Tailwind CSS · Vercel
Stripe Connect · DeepL · Signaturit/eIDAS · Verifactu · Vercel Blob · Resend
