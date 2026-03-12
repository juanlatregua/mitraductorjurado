import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { StatusBadge } from "@/components/orders/status-badge";
import { LANG_NAMES } from "@/lib/constants";
import { STATUS_LABELS } from "@/lib/order-status";
import { OrderActions } from "@/components/orders/order-actions";
import { SignaturePanel } from "@/components/orders/signature-panel";
import { AssignColleague } from "@/components/orders/assign-colleague";
import type { OrderStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

interface Props {
  params: { id: string };
}

export default async function TranslatorOrderDetailPage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      client: { select: { name: true, email: true } },
      assignment: {
        include: {
          assignedTo: { select: { name: true, email: true } },
        },
      },
    },
  });

  if (!order || order.translatorId !== session.user.id) {
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
          href="/dashboard/translator/orders"
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
            <dt className="text-navy-500">Cliente</dt>
            <dd className="font-medium text-navy-900">
              {order.client.name || order.client.email}
            </dd>
          </div>
          <div>
            <dt className="text-navy-500">Email</dt>
            <dd className="font-medium text-navy-900">{order.client.email}</dd>
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
              <dt className="text-navy-500">Precio</dt>
              <dd className="font-medium text-navy-900">
                {order.price.toFixed(2)} €
              </dd>
            </div>
          )}
          {order.expiresAt && (
            <div>
              <dt className="text-navy-500">Vence</dt>
              <dd className="font-medium text-navy-900">
                {new Date(order.expiresAt).toLocaleDateString("es-ES")}
              </dd>
            </div>
          )}
        </dl>

        {order.notes && (
          <div className="mt-4 pt-4 border-t border-navy-100">
            <dt className="text-sm text-navy-500 mb-1">Notas del cliente</dt>
            <dd className="text-sm text-navy-700 whitespace-pre-line bg-navy-50 p-3 rounded-lg">
              {order.notes}
            </dd>
          </div>
        )}
      </div>

      {/* Derivación a colega */}
      {order.assignment ? (
        <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-6 mb-6">
          <h2 className="font-bold text-navy-900 mb-3">Colega asignado</h2>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-navy-500">Nombre</dt>
              <dd className="font-medium text-navy-900">
                {order.assignment.assignedTo.name || order.assignment.assignedTo.email}
              </dd>
            </div>
            <div>
              <dt className="text-navy-500">Precio acordado</dt>
              <dd className="font-medium text-navy-900">{order.assignment.agreedPrice.toFixed(2)} €</dd>
            </div>
            <div>
              <dt className="text-navy-500">Tu margen</dt>
              <dd className="font-medium text-green-600">{order.assignment.brokerMargin.toFixed(2)} €</dd>
            </div>
            {order.assignment.acceptedAt && (
              <div>
                <dt className="text-navy-500">Aceptado</dt>
                <dd className="font-medium text-navy-900">
                  {new Date(order.assignment.acceptedAt).toLocaleDateString("es-ES")}
                </dd>
              </div>
            )}
          </dl>
        </div>
      ) : (
        ["pending", "quoted", "accepted"].includes(order.status) && (
          <div className="mb-6">
            <AssignColleague
              orderId={order.id}
              sourceLang={order.sourceLang}
              targetLang={order.targetLang}
              orderPrice={order.price}
            />
          </div>
        )
      )}

      {/* Enlace al editor */}
      {(order.status === "accepted" || order.status === "in_progress") && (
        <div className="bg-accent-50 rounded-xl border border-accent-200 p-6 mb-6 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-navy-900">Editor bilingüe</h2>
            <p className="text-sm text-navy-500">Abre el editor para trabajar en esta traducción</p>
          </div>
          <a
            href={`/dashboard/translator/editor/${order.id}`}
            className="bg-accent-500 hover:bg-accent-600 text-white font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            Abrir editor
          </a>
        </div>
      )}

      {/* Firma electrónica */}
      <div className="mb-6">
        <SignaturePanel
          orderId={order.id}
          role="translator"
          orderStatus={order.status}
        />
      </div>

      {/* Acciones */}
      <OrderActions
        orderId={order.id}
        status={order.status as OrderStatus}
        role="translator"
        price={order.price}
      />
    </div>
  );
}
