import { getSession } from "@/lib/session";
import { KPICard } from "@/components/dashboard/kpi-card";
import { redirect } from "next/navigation";

export default async function TranslatorDashboard() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900">
          Hola, {session.user.name || "traductor"}
        </h1>
        <p className="text-navy-500 mt-1">
          Resumen de tu actividad
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Pedidos nuevos"
          value={0}
          subtitle="Pendientes de presupuesto"
          icon="📥"
        />
        <KPICard
          title="En curso"
          value={0}
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
