# Prisma en mitraductorjurado

## Client singleton
`lib/prisma.ts` exporta una instancia única con middleware RLS.
Cada query ejecuta `SET app.tenant_id = 'default'` antes de pasar a Prisma.

## Modelos principales (18 total)
```
User ← 1:1 → TranslatorProfile ← 1:N → LanguagePair, Specialty, Availability
User ← 1:N → Order (como client o translator)
Order ← 1:1 → OrderAssignment (derivación a colega)
Order ← 1:1 → Payment, Invoice, Signature, Review
TranslatorProfile ← 1:1 → Subscription (suscripción Stripe)
DocumentTemplate (compartido, sin relaciones directas)
WidgetLead (leads desde widget embebido)
MAECRegistry (10,624 traductores jurados del MAEC, sin FK a User)
Account, Session, VerificationToken (NextAuth internos, sin tenantId)
```

## Relaciones críticas
- `User.translatorProfile` — 1:1 vía `userId` unique
- `Order.client` / `Order.translator` — dos FK al mismo User (relaciones nombradas)
- `OrderAssignment.assignedTo` — FK a User (colega), NO a TranslatorProfile
- `TranslatorProfile.languagePairs` — cascade delete
- `TranslatorProfile.subscription` — 1:1, Plan Fundador 49€/mes
- `MAECRegistry` — independiente, vinculado a TranslatorProfile solo por `maecNumber = "N.{tij}"`

## Regla de tenantId
TODOS los modelos excepto Account/Session/VerificationToken llevan `tenantId @default("default")`.
Si creas un modelo nuevo, DEBE tener tenantId + `@@index([tenantId])`.
Actualizar `prisma/rls-setup.sql` con la nueva política.

## Cómo crear migraciones
```bash
# 1. Editar schema.prisma
# 2. Validar
npx prisma validate
# 3. Crear migración
npx prisma migrate dev --name descripcion-corta
# 4. Regenerar client
npx prisma generate
# 5. Si hay nueva tabla con tenantId, actualizar rls-setup.sql
```

## Cómo usar Prisma Studio
```bash
npx prisma studio    # abre en http://localhost:5555
```
Útil para: verificar datos, ver relaciones, debug de queries.

## IVA y precios
- `order.price` = base imponible (sin IVA) SIEMPRE
- `payment.amount` = total cobrado (con IVA) desde la fix de checkout
- Usar `calculateVAT(order.price)` de `lib/verifactu.ts` para mostrar/cobrar

## Lo que NO hacer
- NUNCA editar archivos dentro de `prisma/migrations/` manualmente
- NUNCA borrar migraciones que ya se aplicaron en producción
- NUNCA hacer `prisma migrate reset` en producción
- NUNCA crear un modelo sin tenantId (excepto NextAuth internos)
- No usar `prisma db push` en producción — solo `migrate deploy`
