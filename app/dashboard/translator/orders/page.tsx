import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StatusBadge } from "@/components/orders/status-badge";
import { LANG_NAMES } from "@/lib/constants";
import Link from "next/link";
import { calculateVAT } from "@/lib/verifactu";
import type { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function TranslatorOrdersPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const orders = await prisma.order.findMany({
    where: { translatorId: session.user.id },
    include: {
      client: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const activeCount = orders.filter((o) =>
    ["quoted", "accepted", "in_progress"].includes(o.status)
  ).length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900">Pedidos</h1>
        <p className="text-navy-500 mt-1">
          {pendingCount > 0 && (
            <span className="text-amber-600 font-medium">
              {pendingCount} pendientes de presupuesto ·{" "}
            </span>
          )}
          {activeCount} activos · {orders.length} total
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-navy-100 p-12 text-center">
          <p className="text-4xl mb-4">📥</p>
          <h3 className="text-lg font-semibold text-navy-900 mb-2">
            No tienes pedidos
          </h3>
          <p className="text-navy-500">
            Los pedidos de clientes aparecerán aquí.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-navy-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-navy-100 bg-navy-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 uppercase">
                  Pedido
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 uppercase">
                  Cliente
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 uppercase">
                  Idiomas
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 uppercase">
                  Tipo
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 uppercase">
                  Estado
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 uppercase">
                  Precio
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 uppercase">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className={`border-b border-navy-50 hover:bg-navy-50 transition-colors ${
                    order.status === "pending" ? "bg-amber-50/50" : ""
                  }`}
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/dashboard/translator/orders/${order.id}`}
                      className="text-sm font-medium text-accent-600 hover:underline"
                    >
                      {order.id.slice(0, 8)}...
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-navy-700">
                    {order.client.name || order.client.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-navy-600">
                    {LANG_NAMES[order.sourceLang] || order.sourceLang} →{" "}
                    {LANG_NAMES[order.targetLang] || order.targetLang}
                  </td>
                  <td className="px-6 py-4 text-sm text-navy-600">
                    {order.documentType || "—"}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status as OrderStatus} />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-navy-900">
                    {order.price ? `${calculateVAT(Number(order.price)).totalAmount.toFixed(2)} €` : "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-navy-500">
                    {new Date(order.createdAt).toLocaleDateString("es-ES")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
