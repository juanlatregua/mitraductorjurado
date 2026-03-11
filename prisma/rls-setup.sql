-- prisma/rls-setup.sql
-- Ejecutar DESPUÉS de la primera migración de Prisma
-- Activa Row-Level Security en todas las tablas

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

-- ─── POLÍTICAS POR TENANT ─────────────────────────────────────────────────────
-- En Fase 1 hay un solo tenant "default".
-- En Fase 2+ cada tenant tiene acceso solo a sus propios datos.
-- current_setting('app.tenant_id') se setea en cada conexión desde la app.

CREATE POLICY tenant_isolation ON "User"
  USING ("tenantId" = current_setting('app.tenant_id', true));

CREATE POLICY tenant_isolation ON "TranslatorProfile"
  USING ("tenantId" = current_setting('app.tenant_id', true));

CREATE POLICY tenant_isolation ON "Order"
  USING ("tenantId" = current_setting('app.tenant_id', true));

CREATE POLICY tenant_isolation ON "Payment"
  USING ("tenantId" = current_setting('app.tenant_id', true));

CREATE POLICY tenant_isolation ON "Invoice"
  USING ("tenantId" = current_setting('app.tenant_id', true));

CREATE POLICY tenant_isolation ON "Review"
  USING ("tenantId" = current_setting('app.tenant_id', true));

CREATE POLICY tenant_isolation ON "WidgetLead"
  USING ("tenantId" = current_setting('app.tenant_id', true));

-- DocumentTemplate es compartida (acceso global de lectura)
CREATE POLICY template_read_all ON "DocumentTemplate"
  FOR SELECT USING (true);

CREATE POLICY template_write_admin ON "DocumentTemplate"
  FOR ALL USING (current_setting('app.tenant_id', true) = 'admin');

-- ─── NOTA ─────────────────────────────────────────────────────────────────────
-- En lib/prisma.ts añadir middleware para setear app.tenant_id en cada query:
--
-- prisma.$use(async (params, next) => {
--   await prisma.$executeRaw`SELECT set_config('app.tenant_id', 'default', true)`;
--   return next(params);
-- });
