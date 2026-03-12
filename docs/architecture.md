# Arquitectura — mitraductorjurado.es

## Diagrama del sistema

```
┌─────────────────────────────────────────────────────────────┐
│                        VERCEL                                │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                   Next.js App Router                   │   │
│  │                                                        │   │
│  │  ┌─────────┐  ┌──────────────┐  ┌──────────────────┐ │   │
│  │  │ Páginas  │  │  Dashboard   │  │   API Routes     │ │   │
│  │  │ públicas │  │  por rol     │  │                  │ │   │
│  │  │          │  │              │  │  /auth/*         │ │   │
│  │  │ /        │  │ /translator  │  │  /translator/*   │ │   │
│  │  │ /auth/*  │  │ /client      │  │  /admin/*        │ │   │
│  │  │ /trans/* │  │ /admin       │  │  /orders/*  TODO │ │   │
│  │  └─────────┘  └──────────────┘  │  /payments/* TODO │ │   │
│  │                                  └──────────────────┘ │   │
│  │                      │                                 │   │
│  │               ┌──────┴──────┐                         │   │
│  │               │ middleware   │ ← JWT role check        │   │
│  │               └──────┬──────┘                         │   │
│  │                      │                                 │   │
│  │               ┌──────┴──────┐                         │   │
│  │               │ lib/prisma  │ ← RLS tenant middleware  │   │
│  │               └──────┬──────┘                         │   │
│  └──────────────────────┼────────────────────────────────┘   │
│                         │                                     │
└─────────────────────────┼─────────────────────────────────────┘
                          │
              ┌───────────┴───────────┐
              │  Neon (PostgreSQL)     │
              │  16 modelos Prisma    │
              │  RLS por tenantId     │
              └───────────────────────┘

Integraciones externas (parcialmente implementadas):
  Stripe Connect  → Pagos cliente→traductor (TODO)
  Vercel Blob     → Almacenamiento fotos/docs (implementado para fotos)
  Resend          → Email transaccional (configurado en NextAuth)
  DeepL API       → Traducción automática (TODO)
  Signaturit      → Firma eIDAS (TODO)
  Verifactu       → Facturación electrónica AEAT (TODO)
```

## Flujo de un pedido (diseño, aún no implementado)

```
1. Cliente → /dashboard/client/new-order
   Sube PDF, elige idioma, selecciona traductor
   → POST /api/orders → Order(status=pending)

2. Traductor ve pedido en dashboard
   Revisa documento, fija precio y plazo
   → PUT /api/orders/:id → Order(status=quoted, price, expiresAt)

3. Cliente acepta presupuesto
   → PUT /api/orders/:id/accept → Order(status=accepted)
   → Stripe PaymentIntent creado

4. Cliente paga
   → Stripe webhook → Order(status=in_progress)
   → Payment creado en DB

5. Traductor trabaja en editor bilingüe
   → Sube traducción → Order(status=delivered)

6. Cliente descarga, valora
   → Review creada → Order(status=closed)
   → Verifactu genera factura
```

## Flujo de pago (diseño)

```
Cliente paga 100€
  → Stripe retiene PLATFORM_FEE (ej: 10%)
  → Traductor recibe 90€ en su cuenta Stripe Connect Express
  → Si hay derivación:
      Colega recibe agreedPrice (ej: 70€)
      Traductor principal recibe brokerMargin (ej: 20€)
      Plataforma retiene su comisión de los 100€
```

## Capas del sistema

| Capa | Responsabilidad | Archivos clave |
|------|----------------|----------------|
| **Presentación** | UI, formularios, layouts | `app/**/page.tsx`, `components/` |
| **API** | Validación, lógica de negocio | `app/api/**/route.ts` |
| **Auth** | JWT, protección de rutas | `lib/auth.ts`, `middleware.ts` |
| **Datos** | ORM, queries, transacciones | `lib/prisma.ts`, `prisma/schema.prisma` |
| **DB** | PostgreSQL + RLS | Neon, `prisma/rls-setup.sql` |
