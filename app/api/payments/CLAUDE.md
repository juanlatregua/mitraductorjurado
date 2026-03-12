# Payments API — Contexto local (TODO)

> **Estado**: No implementado. Planificado para Sprint 4.

## Diseño de Stripe Connect

### Flujo de pago
```
Cliente acepta presupuesto
→ POST /api/payments/create
  → stripe.paymentIntents.create({
      amount, currency: 'eur',
      application_fee_amount: amount * PLATFORM_FEE_PERCENT / 100,
      transfer_data: { destination: translator.stripeAccountId }
    })
→ Stripe procesa pago
→ Webhook payment_intent.succeeded
  → POST /api/webhooks/stripe
    → Crear Payment en DB
    → Actualizar Order.status = in_progress
```

### Cálculo de comisión
```
totalAmount = Order.price
platformFee = totalAmount * STRIPE_PLATFORM_FEE_PERCENT / 100
translatorAmount = totalAmount - platformFee
```

### Derivaciones (OrderAssignment)
Cuando un traductor deriva a un colega:
```
totalAmount = 100€
platformFee = 10€ (10%)
agreedPrice = 70€ (lo que recibe el colega)
brokerMargin = 20€ (lo que retiene el traductor principal)
// 70 + 20 + 10 = 100
```

## Modelos Prisma ya preparados
- `Payment` — amount, platformFee, translatorAmount, stripePaymentIntentId, status
- `TranslatorProfile.stripeAccountId` — ID de cuenta Stripe Express
- `TranslatorProfile.stripeOnboarded` — Verificación KYC completada
- `OrderAssignment` — brokerMargin, agreedPrice

## Webhooks a implementar
| Evento | Acción |
|--------|--------|
| `payment_intent.succeeded` | Crear Payment, Order → in_progress |
| `payment_intent.payment_failed` | Log, notificar |
| `account.updated` | Actualizar stripeOnboarded |

## Seguridad
- Verificar firma de webhook con `STRIPE_WEBHOOK_SECRET`
- Nunca exponer `STRIPE_SECRET_KEY` al cliente
- `STRIPE_PUBLISHABLE_KEY` va en `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` para el frontend

## Env vars necesarias
```
STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_PLATFORM_FEE_PERCENT
```
