import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StatusBadge } from "@/components/orders/status-badge";
import { LANG_NAMES } from "@/lib/constants";
import Link from "next/link";
import type { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function ClientOrdersPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const orders = await prisma.order.findMany({
    where: { clientId: session.user.id },
    include: {
      translator: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy-900">Mis pedidos</h1>
          <p className="text-navy-500 mt-1">{orders.length} pedidos</p>
        </div>
        <Link
          href="/dashboard/client/new-order"
          className="bg-accent-500 hover:bg-accent-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          Nuevo pedido
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-navy-100 p-12 text-center">
          <p className="text-4xl mb-4">📄</p>
          <h3 className="text-lg font-semibold text-navy-900 mb-2">
            No tienes pedidos todavía
          </h3>
          <p className="text-navy-500 mb-4">
            Solicita tu primera traducción jurada.
          </p>
          <Link
            href="/dashboard/client/new-order"
            className="inline-block bg-accent-500 hover:bg-accent-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
          >
            Crear pedido
          </Link>
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
                  Traductor
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-navy-500 uppercase">
                  Idiomas
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
                  className="border-b border-navy-50 hover:bg-navy-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <Link
                      href={`/dashboard/client/orders/${order.id}`}
                      className="text-sm font-medium text-accent-600 hover:underline"
                    >
                      {order.id.slice(0, 8)}...
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-navy-700">
                    {order.translator.name || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-navy-600">
                    {LANG_NAMES[order.sourceLang] || order.sourceLang} →{" "}
                    {LANG_NAMES[order.targetLang] || order.targetLang}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status as OrderStatus} />
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-navy-900">
                    {order.price ? `${order.price.toFixed(2)} €` : "—"}
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
