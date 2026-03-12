import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { KPICard } from "@/components/dashboard/kpi-card";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ClientDashboard() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const [activeCount, completedCount, totalOrders] = await Promise.all([
    prisma.order.count({
      where: { clientId: session.user.id, status: { in: ["pending", "quoted", "accepted", "in_progress"] } },
    }),
    prisma.order.count({
      where: { clientId: session.user.id, status: { in: ["delivered", "closed"] } },
    }),
    prisma.order.count({
      where: { clientId: session.user.id },
    }),
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900">
          Hola, {session.user.name || "cliente"}
        </h1>
        <p className="text-navy-500 mt-1">
          Tus traducciones juradas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KPICard
          title="Pedidos activos"
          value={activeCount}
          subtitle="En curso"
          icon="📋"
        />
        <KPICard
          title="Completados"
          value={completedCount}
          subtitle="Traducciones entregadas"
          icon="✅"
        />
        <KPICard
          title="Total pedidos"
          value={totalOrders}
          icon="📊"
        />
      </div>

      {totalOrders === 0 ? (
        <div className="bg-white rounded-xl border border-navy-100 p-8 text-center">
          <div className="text-4xl mb-3">📄</div>
          <h2 className="text-lg font-bold text-navy-900 mb-2">
            Aún no tienes pedidos
          </h2>
          <p className="text-navy-500 mb-4">
            Solicita tu primera traducción jurada.
          </p>
          <a
            href="/dashboard/client/new-order"
            className="inline-block bg-accent-500 hover:bg-accent-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
          >
            Nuevo pedido
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-navy-100 p-6">
          <h2 className="text-lg font-bold text-navy-900 mb-4">
            Acciones rápidas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href="/dashboard/client/orders"
              className="p-4 border border-navy-200 rounded-lg hover:border-accent-400 transition-colors"
            >
              <div className="font-medium text-navy-900">Ver mis pedidos</div>
              <div className="text-sm text-navy-500">Historial y seguimiento</div>
            </a>
            <a
              href="/dashboard/client/new-order"
              className="p-4 border border-navy-200 rounded-lg hover:border-accent-400 transition-colors"
            >
              <div className="font-medium text-navy-900">Nuevo pedido</div>
              <div className="text-sm text-navy-500">Solicitar otra traducción</div>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
