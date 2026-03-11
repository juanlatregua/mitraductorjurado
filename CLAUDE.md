# CLAUDE.md — mitraductorjurado.es

> Leer este archivo completo antes de cualquier tarea de código.
> Actualizar al inicio de cada sprint con lo aprendido.

---

## Qué es este proyecto

**mitraductorjurado.es** — Sistema operativo del traductor jurado en España.

Tres capas de valor:
1. **Editor de traducción integrado** — reemplaza Adobe + DeepL + Word + plantilla + PDF + firma escaneada
2. **Base de conocimiento colaborativa** — ~35 tipos de documento oficial con plantillas por idioma
3. **Red de derivación profesional** — digitaliza el sistema informal de WhatsApp entre colegas

**Fundador:** Juan Antonio, Traductor-Intérprete Jurado de Francés N.3850, HBTJ Consultores Lingüísticos S.L.

---

## Stack

```
Next.js 14 + App Router + TypeScript
PostgreSQL + Prisma
Tailwind CSS
NextAuth — JWT con campo role: 'translator' | 'client' | 'admin'
Stripe Connect (Express)
Verifactu (facturación electrónica España 2027)
Signaturit / eIDAS (Orden AUC/213/2025)
DeepL API (integrado en editor bilingüe)
Adobe PDF Services API (OCR)
Vercel Blob (almacenamiento documentos)
Resend (email transaccional)
Vercel (hosting)
```

---

## Reglas de arquitectura — NO negociables

- `tenantId` en **todos** los modelos Prisma sin excepción
- RLS activado en PostgreSQL desde Sprint 0 — nunca añadir después
- Multi-tenancy desde día 1
- El cliente **siempre** contrata con el traductor principal — nunca con el colega asignado
- Reutilizar de traduccionesjuradas.net antes de escribir desde cero: upload API, rate limiting, tokens de orden, cron jobs
- Nunca abrir marketplace público (Fase 2) antes del gate: 50 subs activos + MRR ≥ 2.000€

---

## Roles

| Rol | Acceso |
|-----|--------|
| `translator` | /dashboard/translator/*, editor, pedidos, red de colegas |
| `client` | /dashboard/client/*, pedidos, pagos, descargas |
| `admin` | /dashboard/admin/*, todo |

---

## Estructura de directorios

```
/app
  /api/
    /auth/            → NextAuth
    /orders/          → CRUD pedidos
    /payments/        → Stripe Connect
    /documents/       → OCR, DeepL, generación PDF
    /templates/       → Base de plantillas documentos
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
  /traductores/       → Landing captación SEO
/components/          → Componentes reutilizables
/lib/                 → Utilities, helpers, config
/types/               → TypeScript types
/prisma/              → Schema y migraciones
```

---

## Modelos Prisma

```prisma
model User {
  id        String   @id @default(cuid())
  tenantId  String
  email     String   @unique
  role      Role     @default(client)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model TranslatorProfile {
  id              String   @id @default(cuid())
  tenantId        String
  userId          String   @unique
  maecNumber      String
  verified        Boolean  @default(false)
  avgRating       Float    @default(0)
  stripeAccountId String?
  availability    Availability[]
  languagePairs   LanguagePair[]
}

// OrderStatus: pending → quoted → accepted → in_progress → delivered → closed | cancelled

model Order {
  id           String      @id @default(cuid())
  tenantId     String
  clientId     String
  translatorId String
  status       OrderStatus @default(pending)
  expiresAt    DateTime?   // expiración del presupuesto
  assignment   OrderAssignment?
  payment      Payment?
  invoice      Invoice?
}

model OrderAssignment {
  id           String @id @default(cuid())
  orderId      String @unique
  assignedToId String // colega que ejecuta
  brokerMargin Float  // comisión de quien deriva
  agreedPrice  Float  // precio acordado con colega
}

model DocumentTemplate {
  id          String @id @default(cuid())
  category    String // académico|notarial|administrativo|económico|jurídico
  type        String // titulo-universitario|acta-nacimiento|etc
  language    String // fr|de|en|it|es
  structure   Json   // campos fijos + variables
  exampleAnon String?
}

model Availability {
  id           String   @id @default(cuid())
  translatorId String
  weekStart    DateTime
  slots        Json     // franjas horarias
}
```

---

## Flujo de pedido con derivación

```
Cliente solicita → Order.status = pending
Traductor da presupuesto + expiresAt → quoted
  └─ Si necesita colega:
       Consulta disponibilidad → OrderAssignment creado
Cliente acepta → accepted → in_progress
Colega trabaja en editor bilingüe
Traductor principal revisa → delivered
Stripe Connect divide pago automáticamente
Verifactu genera ambas facturas
Cliente valora → closed
```

---

## Variables de entorno

```env
DATABASE_URL=
NEXTAUTH_URL=
NEXTAUTH_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PLATFORM_FEE_PERCENT=
DEEPL_API_KEY=
ADOBE_PDF_CLIENT_ID=
ADOBE_PDF_CLIENT_SECRET=
SIGNATURIT_API_KEY=
SIGNATURIT_SANDBOX=true
RESEND_API_KEY=
BLOB_READ_WRITE_TOKEN=
VERIFACTU_SANDBOX=true
VERIFACTU_NIF=
```

---

## Sprint actual

**S0 — Cimientos**
- [ ] Repo + CLAUDE.md ✓
- [ ] PostgreSQL con RLS
- [ ] Schema Prisma completo con tenantId
- [ ] NextAuth con roles
- [ ] Middleware protección de rutas
- [ ] Variables de entorno
- [ ] Deploy inicial Vercel

---

## Comandos frecuentes

```bash
npm run dev
npx prisma migrate dev --name [nombre]
npx prisma generate
npx prisma studio
npm run build
vercel --prod
```

---

## Contexto de negocio

- ~6.132 traductores jurados MAEC en España
- Stack actual del traductor: Adobe + DeepL + Word + Trados + facturación = 120-165€/mes
- Precio plataforma: 49€/mes (precio fundador)
- Break-even: 13 suscriptores
- Early adopters: grupo de 99 traductores colegas organizados
- Orden AUC/213/2025: firma electrónica válida para traducciones juradas (oportunidad)
- Verifactu 2027: facturación electrónica obligatoria (urgencia)
