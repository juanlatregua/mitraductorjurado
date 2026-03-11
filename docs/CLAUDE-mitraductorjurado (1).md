# CLAUDE.md — mitraductorjurado.es

> Este archivo es el contexto maestro del proyecto para Claude Code CLI.
> Leerlo completo antes de cualquier tarea de código.

---

## Qué es este proyecto

**mitraductorjurado.es** es la plataforma SaaS + marketplace para traductores jurados en España.

No es un directorio. Es el sistema operativo del traductor jurado. Tres capas:

1. **Editor de traducción integrado** — reemplaza Adobe + DeepL + Word + plantilla + PDF manual + firma escaneada
2. **Base de conocimiento colaborativa** — ~35 tipos de documento oficial con plantillas estructurales por idioma
3. **Red de derivación** — digitaliza el sistema informal de WhatsApp entre colegas

**Fundador:** Juan Antonio, Traductor-Intérprete Jurado de Francés N.3850, HBTJ Consultores Lingüísticos S.L.

---

## Stack

```
Next.js 14 + App Router + TypeScript
PostgreSQL + Prisma (multi-tenancy: tenantId en TODOS los modelos)
Row-Level Security en PostgreSQL (activado desde Sprint 0, nunca retroactivo)
NextAuth — JWT con campo role: 'translator' | 'client' | 'admin'
Stripe Connect (Express) — pagos cliente→plataforma→traductor
Verifactu — facturación electrónica (obligatorio España 2027)
Signaturit / eIDAS — firma electrónica (Orden AUC/213/2025)
DeepL API — integrado en el editor bilingüe
Adobe PDF Services API (o alternativa) — OCR de documentos
Vercel Blob — almacenamiento de documentos
Resend — email transaccional
Vercel — hosting
Tailwind CSS — estilos
```

---

## Reglas de arquitectura (NO negociables)

- `tenantId` en **todos** los modelos Prisma sin excepción
- RLS activado en PostgreSQL desde el inicio — nunca añadir después
- Multi-tenancy desde día 1 aunque en Fase 1 haya un solo tenant
- Nunca abrir el marketplace público (Fase 2) antes del gate: 50 subs activos + MRR ≥ 2.000€
- El cliente **siempre** contrata con el traductor principal — nunca con el colega asignado
- Reutilizar de traduccionesjuradas.net: upload API, rate limiting, tokens de orden, cron jobs

---

## Roles

| Rol | Acceso |
|-----|--------|
| `translator` | /dashboard/translator/*, perfil público, editor, red de colegas |
| `client` | /dashboard/client/*, pedidos, pagos, descargas |
| `admin` | /dashboard/admin/*, todo |

---

## Estructura de directorios

```
/app
  /api/
    /auth/            → NextAuth
    /orders/          → CRUD pedidos (estados: pending|quoted|accepted|in_progress|delivered|closed|cancelled)
    /payments/        → Stripe Connect
    /documents/       → OCR, DeepL, generación PDF
    /templates/       → Base de plantillas de documentos
    /availability/    → Disponibilidad traductores
    /assignments/     → Derivación entre colegas
    /webhooks/        → Stripe, Signaturit, Verifactu
  /dashboard/
    /translator/      → Dashboard traductor
    /client/          → Dashboard cliente
    /admin/           → Panel admin
  /translators/       → Directorio público (Fase 2)
  /translators/[id]/  → Perfil público
  /auth/              → Login, registro, onboarding
  /precios/           → Pricing público
  /traductores/       → Landing captación (SEO)
```

---

## Modelos Prisma principales

```prisma
model User {
  id        String   @id @default(cuid())
  tenantId  String
  email     String   @unique
  role      Role     @default(client)
  createdAt DateTime @default(now())
}

model TranslatorProfile {
  id              String   @id @default(cuid())
  tenantId        String
  userId          String   @unique
  maecNumber      String   // N.XXXX
  verified        Boolean  @default(false)
  avgRating       Float    @default(0)
  stripeAccountId String?
  availability    Availability[]
  languagePairs   LanguagePair[]
}

model Order {
  id          String      @id @default(cuid())
  tenantId    String
  clientId    String
  translatorId String
  status      OrderStatus @default(pending)
  assignment  OrderAssignment?  // si hay derivación a colega
  payment     Payment?
  invoice     Invoice?
}

// Estados de Order
enum OrderStatus {
  pending
  quoted
  accepted
  in_progress
  delivered
  closed
  cancelled
}

model OrderAssignment {
  id             String  @id @default(cuid())
  orderId        String  @unique
  assignedToId   String  // colega que ejecuta
  brokerMargin   Float   // comisión de quien deriva
  agreedPrice    Float   // precio acordado con colega
}

model DocumentTemplate {
  id           String @id @default(cuid())
  category     String // académico|notarial|administrativo|económico|jurídico
  type         String // titulo-universitario|acta-nacimiento|etc
  language     String // fr|de|en|it|es
  structure    Json   // campos fijos + variables
  exampleAnon  String? // ejemplo anonimizado
}

model Availability {
  id           String   @id @default(cuid())
  translatorId String
  weekStart    DateTime // lunes de la semana
  slots        Json     // franjas horarias disponibles
}
```

---

## Flujo de pedido con derivación

```
Cliente solicita → Order.status = pending
Traductor principal da presupuesto → quoted
  └─ Si necesita colega:
       Consulta disponibilidad en plataforma
       Colega acepta → OrderAssignment creado
       Precio colega + margen = precio al cliente
Cliente acepta → accepted
Trabajo comienza → in_progress
  └─ Colega trabaja en editor bilingüe
     Traductor principal revisa
Entrega al cliente → delivered
Pago procesado → Stripe Connect divide automáticamente
  └─ Colega recibe su tarifa
     Traductor principal recibe su margen
Verifactu genera ambas facturas
Cliente valora → Review
Order → closed
```

---

## Editor bilingüe — componentes clave

```
EditorBilingue
  ├── PanelOriginal (izquierda)
  │     ├── VisorPDF (documento original)
  │     └── TextoOCR (extraído por Adobe/OCR)
  ├── PanelTraduccion (derecha)
  │     ├── SegmentosTraduccion (sincronizados con original)
  │     └── SugerenciaDeepL (por segmento)
  ├── BarraHerramientas
  │     ├── BuscadorTerminologia
  │     ├── PlantillaDocumento (si tipo reconocido)
  │     └── AccionesDocumento (guardar, generar PDF, firmar)
  └── PanelPlantilla (si documento deteriorado)
        └── CamposVariables (solo datos a completar)
```

---

## Variables de entorno necesarias

```env
# Base de datos
DATABASE_URL=

# Auth
NEXTAUTH_URL=
NEXTAUTH_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PLATFORM_FEE_PERCENT=

# DeepL
DEEPL_API_KEY=

# Adobe PDF Services
ADOBE_PDF_CLIENT_ID=
ADOBE_PDF_CLIENT_SECRET=

# Signaturit
SIGNATURIT_API_KEY=
SIGNATURIT_SANDBOX=true

# Resend
RESEND_API_KEY=

# Vercel Blob
BLOB_READ_WRITE_TOKEN=

# Verifactu
VERIFACTU_SANDBOX=true
VERIFACTU_NIF=
```

---

## Sprints

| Sprint | Semanas | Objetivo principal |
|--------|---------|-------------------|
| S0 | 1-2 | Repo, DB+RLS, Prisma schema, NextAuth, middleware, Vercel |
| S1 | 3-4 | Auth completo, onboarding por rol, dashboards esqueleto |
| S2 | 5-6 | Perfil traductor, verificación MAEC, perfil público |
| S3 | 7-9 | **Editor bilingüe: OCR + DeepL + vista paralela + PDF** |
| S4 | 10-11 | Base de plantillas 35 tipos de documento |
| S5 | 12-13 | Flujo de pedido completo (sin pago) |
| S6 | 14-15 | Stripe Connect + pagos reales |
| S7 | 16-17 | Red de derivación entre colegas |
| S8 | 18-19 | Firma eIDAS (Signaturit) + Verifactu |
| S9 | 20-21 | Widget embebible + landing captación |
| S10 | 22 | Lanzamiento: activar 99 early adopters |

---

## Principios de ejecución

1. Cada sprint = rama `sprint/SX-nombre` → merge a `dev` al completar
2. Nunca a `main` directamente — siempre PR desde `dev`
3. Reutilizar de traduccionesjuradas.net antes de escribir desde cero
4. Testear Stripe y Signaturit en sandbox antes de producción
5. El CLAUDE.md se actualiza al inicio de cada sprint con lo aprendido
6. Los 99 early adopters del grupo son el canal de lanzamiento — no hay marketing externo en Fase 1

---

## Contexto de mercado

- ~6.132 traductores jurados registrados MAEC en España
- Orden AUC/213/2025: firma electrónica legalmente válida para traducciones juradas (oportunidad no aprovechada aún)
- Verifactu 2027: facturación electrónica obligatoria (urgencia)
- Stack actual del traductor: Adobe + DeepL + Word + Trados + facturación = 120-165€/mes fragmentado
- Precio plataforma: 49€/mes fundador
- Break-even: 13 suscriptores
