import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const DEFAULT_TENANT_ID = "default";

function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

  // Middleware: setear app.tenant_id en cada query para RLS
  client.$use(async (params, next) => {
    // Obtener tenantId del contexto o usar el default
    const tenantId = DEFAULT_TENANT_ID;
    await client.$executeRawUnsafe(
      `SELECT set_config('app.tenant_id', '${tenantId}', true)`
    );
    return next(params);
  });

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
