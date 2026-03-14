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
    // Skip raw queries to avoid infinite recursion ($executeRawUnsafe triggers middleware)
    if (params.action === "executeRaw" || params.action === "queryRaw") {
      return next(params);
    }
    const tenantId = DEFAULT_TENANT_ID;
    try {
      await client.$executeRawUnsafe(
        `SELECT set_config('app.tenant_id', '${tenantId}', true)`
      );
    } catch {
      // RLS not configured yet — skip silently
    }
    return next(params);
  });

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
