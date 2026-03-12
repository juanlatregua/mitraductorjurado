# Stripe Connect en mitraductorjurado

## Estado actual: TODO
Stripe Connect está configurado en las dependencias (`stripe@^14.18.0`) y en
el schema de Prisma, pero NO está implementado todavía.

## Flujo diseñado
```
Cliente paga → PaymentIntent con transfer_data
  → Plataforma retiene comisión (STRIPE_PLATFORM_FEE_PERCENT)
  → Traductor recibe su parte vía Stripe Connect Express
```

## Modelos Prisma preparados

### TranslatorProfile (cuenta Stripe)
```prisma
stripeAccountId  String?   // ID de cuenta Express
stripeOnboarded  Boolean   // true tras completar verificación Stripe
```

### Payment (registro de transacción)
```prisma
stripePaymentIntentId  String   @unique
amount                 Float    // total cobrado al cliente
platformFee            Float    // comisión plataforma
translatorAmount       Float    // lo que recibe el traductor
currency               String   @default("eur")
status                 String   // succeeded | pending | failed
```

## Placeholders existentes
- `app/api/payments/.gitkeep` — API routes pendientes
- `app/api/webhooks/.gitkeep` — Webhook handler pendiente
- `.env.example` tiene: STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY,
  STRIPE_WEBHOOK_SECRET, STRIPE_PLATFORM_FEE_PERCENT, STRIPE_PRICE_ID_MONTHLY

## TODO cuando se implemente
1. Onboarding Stripe Express para traductores (generar enlace de verificación)
2. Crear PaymentIntent con `transfer_data.destination = stripeAccountId`
3. Webhook `payment_intent.succeeded` → actualizar Order + Payment
4. Dashboard ingresos del traductor
5. Probar con `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

## Regla de negocio
- La comisión es configurable via `STRIPE_PLATFORM_FEE_PERCENT`
- En derivación: Stripe divide entre colega (agreedPrice) y broker (brokerMargin)
- El cliente SIEMPRE paga al traductor principal, nunca al colega

## Qué NO tocar sin entender
- El flujo de comisión afecta facturación (Verifactu) y contabilidad
- Un error en el split de pagos genera problemas legales reales
