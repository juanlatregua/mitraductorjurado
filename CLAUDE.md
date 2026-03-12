# CLAUDE.md — mitraductorjurado.es

## WHY
Marketplace que conecta ~6.132 traductores jurados MAEC con clientes directos.
Elimina intermediarios (agencias) y el stack fragmentado (Adobe+DeepL+Word = 120-165€/mes).
Precio: 49€/mes fundador. Break-even: 13 subs. Gate Fase 2: 50 subs + MRR ≥ 2.000€.

## WHAT — Mapa del repo
```
app/
  page.tsx                              → Landing pública
  layout.tsx                            → Root layout + SessionProvider
  auth/login|register|onboarding|verify → Auth flow (magic link + Google)
  dashboard/page.tsx                    → Redirect por rol
  dashboard/translator/                 → Orders, editor, payments, invoices, widget, colleagues, profile
  dashboard/client/                     → Orders, invoices, new-order
  dashboard/admin/                      → Admin panel + verificaciones MAEC
  translators/                          → Directorio público con filtros + perfil SEO
  api/auth/                             → NextAuth handler + onboarding
  api/orders/                           → CRUD pedidos + assign colega
  api/stripe/                           → Connect onboarding + checkout
  api/invoices/                         → GET/POST factura por pedido
  api/signatures/                       → Firma eIDAS Signaturit
  api/documents/                        → Editor bilingüe + DeepL
  api/widget/                           → Widget leads + info pública
  api/webhooks/stripe|signaturit        → Webhooks externos
components/
  orders/                               → OrderActions, StatusBadge, PaymentPanel, InvoicePanel, SignaturePanel, AssignColleague
  editor/                               → BilingualEditor, SegmentRow
  translators/                          → TranslatorCard, SearchFilters
  dashboard/                            → Sidebar, KPICard, AvailabilityToggle
lib/
  auth.ts        → NextAuth config (email + Google, JWT + role + onboarded)
  prisma.ts      → Prisma client singleton + RLS tenant middleware
  session.ts     → getSession() / getCurrentUser() helpers
  stripe.ts      → Stripe Connect Express + PaymentIntent split
  verifactu.ts   → XML Verifactu AEAT + IVA
  signaturit.ts  → eIDAS firma electrónica
  deepl.ts       → DeepL batch translation
  order-status.ts → Status machine + role transitions
  constants.ts   → LANG_NAMES, CATEGORIES, PROVINCES
  invoice-number.ts → Numeración secuencial MTJ-YYYYMM-XXXX
prisma/
  schema.prisma  → 16 modelos, TODOS con tenantId
  rls-setup.sql  → Row-Level Security para 13 tablas
public/
  widget.js      → Script embebible ES5 para webs externas
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

## Estado actual (34 páginas, 10 sprints)
- S0 Scaffold ✅ · S1 Auth ✅ · S2 Perfil ✅ · S3 Directorio ✅ · S4 Pedidos ✅
- S5 Editor+DeepL ✅ · S6 eIDAS ✅ · S7 Colegas ✅ · S8 Verifactu ✅
- S9 Widget ✅ · S10 Stripe ✅
- TODO: Plantillas documentos, email transaccional (Outlook SMTP), SEO/landing mejorada

## Stack
Next.js 14 App Router · TypeScript · Prisma · Neon (PostgreSQL + RLS)
NextAuth JWT (translator|client|admin) · Tailwind CSS · Vercel
Stripe Connect · DeepL · Signaturit/eIDAS · Verifactu · Vercel Blob · Resend
