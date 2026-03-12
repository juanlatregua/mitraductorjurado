# Runbook: Testing de Stripe Connect (TODO)

> **Estado**: No implementado. Este runbook documenta el flujo diseñado para cuando se implemente en Sprint 4.

## Prerequisitos
- Cuenta Stripe con Connect habilitado (solicitar en Dashboard → Connect)
- Stripe CLI instalado (`brew install stripe/stripe-cli/stripe`)

## Variables de entorno necesarias
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PLATFORM_FEE_PERCENT=10
```

## Flujo diseñado

### 1. Onboarding del traductor (Express Account)
```
POST /api/stripe/onboarding
→ Crea cuenta Express en Stripe
→ Devuelve URL de onboarding de Stripe
→ Traductor completa KYC en Stripe
→ Webhook account.updated → stripeOnboarded = true
```

### 2. Crear PaymentIntent cuando cliente acepta presupuesto
```
POST /api/payments/create
→ stripe.paymentIntents.create({
    amount: precioEnCéntimos,
    currency: 'eur',
    application_fee_amount: comisiónEnCéntimos,
    transfer_data: { destination: translatorStripeAccountId }
  })
```

### 3. Testing local con webhooks
```bash
# Terminal 1: app
npm run dev

# Terminal 2: reenviar webhooks de Stripe
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Terminal 3: simular eventos
stripe trigger payment_intent.succeeded
```

### 4. Webhook handler (por implementar)
```
POST /api/webhooks/stripe
→ Verificar firma con STRIPE_WEBHOOK_SECRET
→ payment_intent.succeeded → crear Payment en DB, actualizar Order status
→ account.updated → actualizar stripeOnboarded en TranslatorProfile
```

## Datos de prueba Stripe
- Tarjeta éxito: `4242 4242 4242 4242`
- Tarjeta rechazada: `4000 0000 0000 0002`
- Cuenta bancaria test: usar datos del dashboard Stripe Test

## Modelos Prisma preparados
- `TranslatorProfile.stripeAccountId` — ID de cuenta Express
- `TranslatorProfile.stripeOnboarded` — Boolean de verificación completada
- `Payment` — amount, platformFee, translatorAmount, stripePaymentIntentId
- `OrderAssignment` — brokerMargin, agreedPrice (para derivaciones)
