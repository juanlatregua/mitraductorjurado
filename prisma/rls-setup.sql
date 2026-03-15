-- prisma/rls-setup.sql
-- Ejecutar DESPUÉS de la primera migración de Prisma:
--   npm run db:rls
--
-- Activa Row-Level Security en todas las tablas con tenantId.
-- Las tablas de NextAuth (Account, Session, VerificationToken) no llevan RLS
-- porque son internas del sistema de auth.

-- ─── ACTIVAR RLS ──────────────────────────────────────────────────────────────

ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TranslatorProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "LanguagePair" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Specialty" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Availability" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "DocumentTemplate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Order" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "OrderAssignment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Payment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Invoice" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Signature" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Review" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "WidgetLead" ENABLE ROW LEVEL SECURITY;

-- ─── BYPASS PARA MIGRACIONES Y ADMIN ─────────────────────────────────────────
-- El usuario que ejecuta Prisma migrate necesita bypass.
-- Usar ALTER ROLE <migration_user> BYPASSRLS; en la consola de PostgreSQL.
-- Alternativa: crear un rol de servicio con BYPASSRLS para la app.

-- ─── POLÍTICAS POR TENANT ─────────────────────────────────────────────────────
-- En Fase 1 hay un solo tenant "default".
-- current_setting('app.tenant_id') se setea en cada conexión desde lib/prisma.ts.

-- User
CREATE POLICY tenant_isolation_user ON "User"
  USING ("tenantId" = current_setting('app.tenant_id', true));

-- TranslatorProfile
CREATE POLICY tenant_isolation_translator ON "TranslatorProfile"
  USING ("tenantId" = current_setting('app.tenant_id', true));

-- LanguagePair
CREATE POLICY tenant_isolation_lang ON "LanguagePair"
  USING ("tenantId" = current_setting('app.tenant_id', true));

-- Specialty
CREATE POLICY tenant_isolation_specialty ON "Specialty"
  USING ("tenantId" = current_setting('app.tenant_id', true));

-- Availability
CREATE POLICY tenant_isolation_availability ON "Availability"
  USING ("tenantId" = current_setting('app.tenant_id', true));

-- Order
CREATE POLICY tenant_isolation_order ON "Order"
  USING ("tenantId" = current_setting('app.tenant_id', true));

-- OrderAssignment
CREATE POLICY tenant_isolation_assignment ON "OrderAssignment"
  USING ("tenantId" = current_setting('app.tenant_id', true));

-- Payment
CREATE POLICY tenant_isolation_payment ON "Payment"
  USING ("tenantId" = current_setting('app.tenant_id', true));

-- Invoice
CREATE POLICY tenant_isolation_invoice ON "Invoice"
  USING ("tenantId" = current_setting('app.tenant_id', true));

-- Signature
CREATE POLICY tenant_isolation_signature ON "Signature"
  USING ("tenantId" = current_setting('app.tenant_id', true));

-- Review
CREATE POLICY tenant_isolation_review ON "Review"
  USING ("tenantId" = current_setting('app.tenant_id', true));

-- WidgetLead
CREATE POLICY tenant_isolation_widget ON "WidgetLead"
  USING ("tenantId" = current_setting('app.tenant_id', true));

-- Subscription
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_subscription ON "Subscription"
  USING ("tenantId" = current_setting('app.tenant_id', true));

-- Segment
ALTER TABLE "Segment" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_segment ON "Segment"
  USING ("tenantId" = current_setting('app.tenant_id', true));

-- GlossaryEntry
ALTER TABLE "GlossaryEntry" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_glossary ON "GlossaryEntry"
  USING ("tenantId" = current_setting('app.tenant_id', true));

-- ─── PLANTILLAS: ACCESO ESPECIAL ─────────────────────────────────────────────
-- DocumentTemplate es compartida: lectura global, escritura solo admin.
-- La política tenant_isolation ya cubre escritura. Añadimos lectura abierta.

CREATE POLICY template_read_all ON "DocumentTemplate"
  FOR SELECT USING (true);

-- ─── NOTA DE CONFIGURACIÓN ────────────────────────────────────────────────────
-- 1. El usuario de PostgreSQL que usa Prisma migrate DEBE tener BYPASSRLS:
--      ALTER ROLE prisma_user BYPASSRLS;
--
-- 2. El usuario de la app (si es distinto) necesita RLS activo.
--    Si app y migrate usan el mismo usuario, darle BYPASSRLS y confiar
--    en que la app siempre setea app.tenant_id vía el middleware de Prisma.
--
-- 3. Para verificar RLS:
--      SELECT relname, relrowsecurity FROM pg_class WHERE relrowsecurity;
