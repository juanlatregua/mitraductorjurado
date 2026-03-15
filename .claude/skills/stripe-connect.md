# Stripe en mitraductorjurado

## Estado: COMPLETADO (S10 Connect + Billing)

Stripe tiene dos flujos independientes:
1. **Connect Express** — traductores reciben pagos de clientes
2. **Billing** — traductores pagan suscripción Plan Fundador (49€/mes)

## Flujo Connect (pagos de clientes)
```
Cliente paga → PaymentIntent con transfer_data
  → Plataforma retiene comisión (STRIPE_PLATFORM_FEE_PERCENT)
  → Traductor recibe su parte vía Stripe Connect Express
```

### API routes
| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/stripe/connect` | POST | Genera enlace onboarding Express |
| `/api/stripe/checkout` | POST | Crea PaymentIntent (cobra totalAmount con IVA) |
| `/api/webhooks/stripe` | POST | Procesa payment_intent.succeeded, account.updated, etc. |

### IVA en checkout
```typescript
import { calculateVAT } from "@/lib/verifactu";
const { totalAmount } = calculateVAT(order.price); // base + 21% IVA
// totalAmount se pasa a Stripe como amount
// Payment.amount en DB = totalAmount (con IVA incluido)
```

## Flujo Billing (suscripciones)
```
Traductor → Crear suscripción → Stripe Checkout Session
  → Webhook: checkout.session.completed → crear Subscription en DB
  → customer.subscription.updated/deleted → actualizar estado
```

### API routes
| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/stripe/subscription` | GET | Estado suscripción del traductor |
| `/api/stripe/subscription` | POST | Crear checkout session para Plan Fundador |
| `/api/stripe/subscription` | DELETE | Cancelar suscripción |
| `/api/stripe/portal` | POST | Generar enlace Customer Portal |

### Entidades Stripe por traductor
Cada traductor tiene DOS identidades en Stripe:
- **Connect Account** (`stripeAccountId` en TranslatorProfile) — recibir pagos
- **Customer** (`stripeCustomerId` en TranslatorProfile) — pagar suscripción

## Modelos Prisma

### TranslatorProfile
```prisma
stripeAccountId   String?   // Connect Express account
stripeOnboarded   Boolean   // true tras verificación Connect
stripeCustomerId  String?   // Billing customer
```

### Payment (transacción por pedido)
```prisma
stripePaymentIntentId  String   @unique
amount                 Float    // total cobrado (con IVA)
platformFee            Float    // comisión plataforma
translatorAmount       Float    // lo que recibe el traductor
status                 String   // succeeded | pending | failed
```

### Subscription (suscripción mensual)
```prisma
stripeSubscriptionId  String   @unique
stripePriceId         String
status                String   // active | past_due | canceled | ...
currentPeriodEnd      DateTime
```

## Variables de entorno
```env
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PLATFORM_FEE_PERCENT=15
STRIPE_PRICE_ID_MONTHLY=price_...    # Plan Fundador 49€/mes
```

## Testing local
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Reglas de negocio
- `order.price` en DB = base imponible (sin IVA)
- Stripe cobra `calculateVAT(order.price).totalAmount` (con 21% IVA)
- La comisión es configurable via `STRIPE_PLATFORM_FEE_PERCENT`
- En derivación: Stripe divide entre colega (agreedPrice) y broker (brokerMargin)
- El cliente SIEMPRE paga al traductor principal, nunca al colega
