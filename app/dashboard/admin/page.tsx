import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { KPICard } from "@/components/dashboard/kpi-card";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session || session.user.role !== "admin") redirect("/auth/login");

  const [totalUsers, translators, pendingVerifications, activeOrders] =
    await Promise.all([
      prisma.user.count(),
      prisma.translatorProfile.count(),
      prisma.translatorProfile.count({ where: { verified: false } }),
      prisma.order.count({
        where: { status: { in: ["pending", "quoted", "accepted", "in_progress"] } },
      }),
    ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900">Panel de administración</h1>
        <p className="text-navy-500 mt-1">mitraductorjurado.es</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard title="Usuarios totales" value={totalUsers} icon="👥" />
        <KPICard
          title="Traductores"
          value={translators}
          subtitle={`${pendingVerifications} pendientes de verificar`}
          icon="🔤"
        />
        <KPICard title="Pedidos activos" value={activeOrders} icon="📋" />
        <KPICard
          title="MRR"
          value="0 €"
          subtitle="Gate Fase 2: 2.000 €"
          icon="💰"
        />
      </div>

      {/* Gate de Fase 2 */}
      <div className="bg-white rounded-xl border border-navy-100 p-6 mb-6">
        <h2 className="text-lg font-bold text-navy-900 mb-3">
          Progreso hacia Fase 2
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-navy-500">Traductores activos</span>
              <span className="font-medium text-navy-900">
                {translators} / 50
              </span>
            </div>
            <div className="w-full bg-navy-100 rounded-full h-2.5">
              <div
                className="bg-accent-500 h-2.5 rounded-full transition-all"
                style={{ width: `${Math.min((translators / 50) * 100, 100)}%` }}
              />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-navy-500">MRR</span>
              <span className="font-medium text-navy-900">0 € / 2.000 €</span>
            </div>
            <div className="w-full bg-navy-100 rounded-full h-2.5">
              <div
                className="bg-accent-500 h-2.5 rounded-full"
                style={{ width: "0%" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de usuarios recientes */}
      <div className="bg-white rounded-xl border border-navy-100 p-6">
        <h2 className="text-lg font-bold text-navy-900 mb-4">
          Usuarios recientes
        </h2>
        <UserList />
      </div>
    </div>
  );
}

async function UserList() {
  const users = await prisma.user.findMany({
    take: 20,
    orderBy: { createdAt: "desc" },
    include: { translatorProfile: { select: { verified: true, maecNumber: true } } },
  });

  if (users.length === 0) {
    return <p className="text-navy-500 text-sm">No hay usuarios registrados.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-navy-100">
            <th className="text-left py-2 px-3 font-medium text-navy-500">Nombre</th>
            <th className="text-left py-2 px-3 font-medium text-navy-500">Email</th>
            <th className="text-left py-2 px-3 font-medium text-navy-500">Rol</th>
            <th className="text-left py-2 px-3 font-medium text-navy-500">MAEC</th>
            <th className="text-left py-2 px-3 font-medium text-navy-500">Verificado</th>
            <th className="text-left py-2 px-3 font-medium text-navy-500">Registro</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-navy-50 hover:bg-navy-50">
              <td className="py-2.5 px-3 text-navy-900">{user.name || "—"}</td>
              <td className="py-2.5 px-3 text-navy-600">{user.email}</td>
              <td className="py-2.5 px-3">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    user.role === "admin"
                      ? "bg-purple-100 text-purple-700"
                      : user.role === "translator"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {user.role}
                </span>
              </td>
              <td className="py-2.5 px-3 text-navy-600">
                {user.translatorProfile?.maecNumber || "—"}
              </td>
              <td className="py-2.5 px-3">
                {user.translatorProfile ? (
                  user.translatorProfile.verified ? (
                    <span className="text-green-600">Sí</span>
                  ) : (
                    <span className="text-amber-600">Pendiente</span>
                  )
                ) : (
                  "—"
                )}
              </td>
              <td className="py-2.5 px-3 text-navy-400">
                {user.createdAt.toLocaleDateString("es-ES")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
