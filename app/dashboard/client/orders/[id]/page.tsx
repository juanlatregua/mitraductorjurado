import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { StatusBadge } from "@/components/orders/status-badge";
import { LANG_NAMES } from "@/lib/constants";
import { OrderActions } from "@/components/orders/order-actions";
import { SignaturePanel } from "@/components/orders/signature-panel";
import { InvoicePanel } from "@/components/orders/invoice-panel";
import type { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function ClientOrderDetailPage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      translator: {
        select: {
          name: true,
          translatorProfile: {
            select: { maecNumber: true, verified: true },
          },
        },
      },
    },
  });

  if (!order || order.clientId !== session.user.id) {
    notFound();
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-bold text-navy-900">
              Pedido {order.id.slice(0, 8)}
            </h1>
            <StatusBadge status={order.status as OrderStatus} />
          </div>
          <p className="text-navy-500 text-sm">
            Creado el{" "}
            {new Date(order.createdAt).toLocaleDateString("es-ES", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <a
          href="/dashboard/client/orders"
          className="text-sm text-navy-500 hover:text-navy-700"
        >
          Volver a pedidos
        </a>
      </div>

      {/* Detalles */}
      <div className="bg-white rounded-xl border border-navy-100 p-6 mb-6">
        <h2 className="font-bold text-navy-900 mb-4">Detalles del pedido</h2>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-navy-500">Traductor</dt>
            <dd className="font-medium text-navy-900">
              {order.translator.name || "—"}
              {order.translator.translatorProfile?.verified && (
                <span className="ml-1 text-green-600 text-xs">MAEC ✓</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-navy-500">N.º MAEC</dt>
            <dd className="font-medium text-navy-900">
              {order.translator.translatorProfile?.maecNumber || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-navy-500">Idiomas</dt>
            <dd className="font-medium text-navy-900">
              {LANG_NAMES[order.sourceLang] || order.sourceLang} →{" "}
              {LANG_NAMES[order.targetLang] || order.targetLang}
            </dd>
          </div>
          <div>
            <dt className="text-navy-500">Tipo de documento</dt>
            <dd className="font-medium text-navy-900">
              {order.documentType || "No especificado"}
            </dd>
          </div>
          {order.price && (
            <div>
              <dt className="text-navy-500">Precio presupuestado</dt>
              <dd className="font-bold text-navy-900 text-lg">
                {order.price.toFixed(2)} €
              </dd>
            </div>
          )}
          {order.expiresAt && (
            <div>
              <dt className="text-navy-500">Presupuesto válido hasta</dt>
              <dd className="font-medium text-navy-900">
                {new Date(order.expiresAt).toLocaleDateString("es-ES")}
              </dd>
            </div>
          )}
        </dl>

        {order.notes && (
          <div className="mt-4 pt-4 border-t border-navy-100">
            <dt className="text-sm text-navy-500 mb-1">Tus notas</dt>
            <dd className="text-sm text-navy-700 whitespace-pre-line bg-navy-50 p-3 rounded-lg">
              {order.notes}
            </dd>
          </div>
        )}
      </div>

      {/* Firma electrónica */}
      <div className="mb-6">
        <SignaturePanel
          orderId={order.id}
          role="client"
          orderStatus={order.status}
        />
      </div>

      {/* Factura */}
      <div className="mb-6">
        <InvoicePanel
          orderId={order.id}
          role="client"
          orderStatus={order.status}
        />
      </div>

      {/* Acciones */}
      <OrderActions
        orderId={order.id}
        status={order.status as OrderStatus}
        role="client"
        price={order.price}
      />
    </div>
  );
}
