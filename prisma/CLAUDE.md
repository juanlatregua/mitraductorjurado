# Prisma — Contexto local

## Regla fundamental
**Todo modelo DEBE tener `tenantId String @default("default")`** con `@@index([tenantId])`.
Excepciones: Account, Session, VerificationToken (internas de NextAuth).

## Modelos (16 total)

### Core auth (NextAuth)
- **User** — id, email, role, name, image. Relaciones a TranslatorProfile, Orders, Reviews, Accounts, Sessions
- **Account** — OAuth/email provider accounts (NextAuth)
- **Session** — Sesiones DB (no usadas con JWT, pero PrismaAdapter las requiere)
- **VerificationToken** — Tokens de magic link email

### Perfil traductor
- **TranslatorProfile** — maecNumber, verified, bio, province, photoUrl, rates, avgRating, stripeAccountId, availabilityStatus
- **LanguagePair** — sourceLang/targetLang (ISO 639-1). @@unique([translatorId, sourceLang, targetLang])
- **Specialty** — category (DocumentCategory enum). @@unique([translatorId, category])
- **Availability** — Franjas horarias semanales en JSON

### Pedidos y pagos
- **Order** — clientId, translatorId, status (OrderStatus enum), sourceLang, targetLang, price, files
- **OrderAssignment** — Derivación a colega: assignedToId, brokerMargin, agreedPrice
- **Payment** — stripePaymentIntentId, amount, platformFee, translatorAmount
- **Invoice** — Verifactu: invoiceNumber (MTJ-YYYYMM-XXXX), xmlContent, pdfUrl, sentToAeat
- **Signature** — Signaturit: signaturitId, signedDocumentUrl
- **Review** — rating (1-5), comment. Actualiza TranslatorProfile.avgRating

### Otros
- **DocumentTemplate** — Plantillas por categoría/tipo/idioma. Lectura global (RLS policy especial)
- **WidgetLead** — Leads del widget embebible

## Relaciones críticas
- `User 1:1 TranslatorProfile` (userId unique)
- `User 1:N Order` — dos relaciones nombradas: ClientOrders y TranslatorOrders
- `Order 1:1 Payment|Invoice|Signature|Review|OrderAssignment` (orderId unique en cada una)
- `TranslatorProfile 1:N LanguagePair|Specialty|Availability` (cascade delete)

## Migración segura
```bash
npx prisma migrate dev --name descripcion   # desarrollo
npx prisma migrate deploy                    # producción
```

## RLS
- Políticas en `rls-setup.sql` — una por tabla con tenantId
- `lib/prisma.ts` setea `app.tenant_id` en cada query via middleware
- DocumentTemplate tiene política adicional de lectura global

## Anti-patterns a evitar
- Crear modelo sin tenantId
- Usar `db push` en producción (no genera migration history)
- Olvidar actualizar rls-setup.sql al añadir tabla nueva
- Renombrar campos sin `@map` (pierde datos)
