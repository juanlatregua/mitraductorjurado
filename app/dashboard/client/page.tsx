import { getSession } from "@/lib/session";
import { KPICard } from "@/components/dashboard/kpi-card";
import { redirect } from "next/navigation";

export default async function ClientDashboard() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

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
          value={0}
          subtitle="En curso"
          icon="📋"
        />
        <KPICard
          title="Completados"
          value={0}
          subtitle="Traducciones entregadas"
          icon="✅"
        />
        <KPICard
          title="Pendientes de pago"
          value="0 €"
          icon="💳"
        />
      </div>

      {/* Estado vacío */}
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
    </div>
  );
}
