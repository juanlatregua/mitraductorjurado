import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { KPICard } from "@/components/dashboard/kpi-card";
import { AvailabilityToggle } from "@/components/dashboard/availability-toggle";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function TranslatorDashboard() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const [profile, pendingCount, activeCount] = await Promise.all([
    prisma.translatorProfile.findUnique({
      where: { userId: session.user.id },
      select: { availabilityStatus: true, verified: true, id: true },
    }),
    prisma.order.count({
      where: { translatorId: session.user.id, status: "pending" },
    }),
    prisma.order.count({
      where: { translatorId: session.user.id, status: { in: ["quoted", "accepted", "in_progress"] } },
    }),
  ]);

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">
            Hola, {session.user.name || "traductor"}
          </h1>
          <p className="text-navy-500 mt-1">
            Resumen de tu actividad
            {profile?.verified && (
              <span className="ml-2 text-green-600 text-xs font-medium">
                MAEC Verificado
              </span>
            )}
          </p>
        </div>
        {profile && (
          <AvailabilityToggle initialStatus={profile.availabilityStatus} />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Pedidos nuevos"
          value={pendingCount}
          subtitle="Pendientes de presupuesto"
          icon="📥"
        />
        <KPICard
          title="En curso"
          value={activeCount}
          subtitle="Pendientes de entrega"
          icon="⏳"
        />
        <KPICard
          title="Ingresos este mes"
          value="0 €"
          subtitle="Marzo 2026"
          icon="💰"
        />
        <KPICard
          title="Colegas activos"
          value={0}
          subtitle="En tu red de derivación"
          icon="🤝"
        />
      </div>

      {/* Acciones rápidas */}
      <div className="bg-white rounded-xl border border-navy-100 p-6">
        <h2 className="text-lg font-bold text-navy-900 mb-4">
          Acciones rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/dashboard/translator/availability"
            className="p-4 border border-navy-200 rounded-lg hover:border-accent-400 transition-colors"
          >
            <div className="font-medium text-navy-900">
              Gestionar disponibilidad
            </div>
            <div className="text-sm text-navy-500">
              Actualiza tus franjas horarias
            </div>
          </a>
          <a
            href="/dashboard/translator/profile"
            className="p-4 border border-navy-200 rounded-lg hover:border-accent-400 transition-colors"
          >
            <div className="font-medium text-navy-900">Editar perfil</div>
            <div className="text-sm text-navy-500">
              Idiomas, tarifas, especialidades
            </div>
          </a>
          <a
            href="/dashboard/translator/orders"
            className="p-4 border border-navy-200 rounded-lg hover:border-accent-400 transition-colors"
          >
            <div className="font-medium text-navy-900">Ver pedidos</div>
            <div className="text-sm text-navy-500">
              Historial y pedidos activos
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
