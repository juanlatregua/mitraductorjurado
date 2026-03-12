# ADR 004: Stripe Connect Express en vez de Checkout simple

## Contexto
El modelo de negocio requiere:
- Cliente paga a la plataforma
- Plataforma retiene comisión
- Traductor recibe su parte automáticamente
- En derivaciones: split entre traductor principal y colega

## Opciones
1. **Stripe Checkout** — cobrar al cliente, pagar al traductor manualmente
2. **Stripe Connect Express** — split automático de pagos

## Decisión
Stripe Connect con cuentas Express para traductores.

## Razones
- **Split automático**: PaymentIntent con `transfer_data` → Stripe divide
- **Express accounts**: Stripe maneja KYC/verificación del traductor
- **Derivaciones**: el split soporta múltiples destinos
- **Legal**: cada traductor recibe directamente, sin que la plataforma intermedie fondos
- **Verifactu**: cada Payment genera datos para la factura electrónica

## Flujo implementado (en schema, TODO en código)
```
1. Traductor hace onboarding Stripe Express → stripeAccountId guardado
2. Cliente acepta presupuesto → PaymentIntent creado con:
   - amount = precio total
   - application_fee_amount = comisión plataforma
   - transfer_data.destination = stripeAccountId del traductor
3. Webhook payment_intent.succeeded → Payment creado en DB
4. Verifactu genera factura con datos del Payment
```

## Consecuencias
- Cada traductor necesita completar verificación Stripe (KYC)
- La comisión es configurable via `STRIPE_PLATFORM_FEE_PERCENT`
- Los webhooks deben verificar la firma de Stripe
- Testing local requiere `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
