import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { StatusBadge } from "@/components/orders/status-badge";
import { LANG_NAMES } from "@/lib/constants";
import Link from "next/link";
import type { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function EditorListPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  // Mostrar pedidos que están en curso o aceptados (listos para traducir)
  const orders = await prisma.order.findMany({
    where: {
      translatorId: session.user.id,
      status: { in: ["accepted", "in_progress"] },
    },
    include: {
      client: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900">Editor bilingüe</h1>
        <p className="text-navy-500 mt-1">
          Selecciona un pedido para abrir el editor de traducción
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-navy-100 p-12 text-center">
          <p className="text-4xl mb-4">✍️</p>
          <h3 className="text-lg font-semibold text-navy-900 mb-2">
            No hay pedidos listos para traducir
          </h3>
          <p className="text-navy-500 mb-4">
            Los pedidos aceptados o en curso aparecerán aquí.
          </p>
          <Link
            href="/dashboard/translator/orders"
            className="text-accent-500 hover:underline text-sm"
          >
            Ver todos los pedidos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/translator/editor/${order.id}`}
              className="bg-white rounded-xl border border-navy-100 p-6 hover:border-accent-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-mono text-navy-400">
                  {order.id.slice(0, 8)}
                </span>
                <StatusBadge status={order.status as OrderStatus} />
              </div>
              <div className="mb-2">
                <span className="text-sm font-medium text-navy-900">
                  {order.client.name || "Cliente"}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-navy-100 text-navy-700 text-xs font-medium px-2 py-0.5 rounded-full">
                  {LANG_NAMES[order.sourceLang] || order.sourceLang} →{" "}
                  {LANG_NAMES[order.targetLang] || order.targetLang}
                </span>
                {order.documentType && (
                  <span className="text-xs text-navy-500">
                    {order.documentType}
                  </span>
                )}
              </div>
              <div className="text-xs text-navy-400">
                Actualizado:{" "}
                {new Date(order.updatedAt).toLocaleDateString("es-ES")}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
