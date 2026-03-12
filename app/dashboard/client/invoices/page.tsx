import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "bg-amber-100 text-amber-700" },
  sent: { label: "Enviada AEAT", color: "bg-blue-100 text-blue-700" },
  accepted: { label: "Aceptada AEAT", color: "bg-green-100 text-green-700" },
  rejected: { label: "Rechazada AEAT", color: "bg-red-100 text-red-700" },
};

export default async function ClientInvoicesPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const invoices = await prisma.invoice.findMany({
    where: { recipientId: session.user.id },
    include: {
      order: {
        select: {
          id: true,
          sourceLang: true,
          targetLang: true,
          translator: { select: { name: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalPaid = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-navy-900 mb-6">Mis facturas recibidas</h1>

      {/* Resumen */}
      <div className="bg-white rounded-xl border border-navy-100 p-5 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-navy-500">Total facturado</p>
            <p className="text-xl font-bold text-navy-900">{totalPaid.toFixed(2)} €</p>
          </div>
          <p className="text-sm text-navy-400">{invoices.length} factura{invoices.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="bg-white rounded-xl border border-navy-100 p-12 text-center">
          <p className="text-navy-500">No tienes facturas todavía.</p>
          <p className="text-sm text-navy-400 mt-1">
            Recibirás facturas cuando tus pedidos se completen.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-navy-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-navy-50 text-navy-600 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">N.º Factura</th>
                <th className="px-4 py-3 font-medium">Traductor</th>
                <th className="px-4 py-3 font-medium">Base</th>
                <th className="px-4 py-3 font-medium">IVA</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-100">
              {invoices.map((inv) => {
                const status = STATUS_MAP[inv.status] || STATUS_MAP.pending;
                return (
                  <tr key={inv.id} className="hover:bg-navy-50/50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/client/orders/${inv.orderId}`}
                        className="font-mono font-medium text-accent-600 hover:underline"
                      >
                        {inv.invoiceNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-navy-700">
                      {inv.order.translator.name || "—"}
                    </td>
                    <td className="px-4 py-3 text-navy-900">
                      {inv.amount.toFixed(2)} €
                    </td>
                    <td className="px-4 py-3 text-navy-900">
                      {inv.vatAmount.toFixed(2)} €
                    </td>
                    <td className="px-4 py-3 text-navy-900 font-bold">
                      {inv.totalAmount.toFixed(2)} €
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-navy-500">
                      {new Date(inv.createdAt).toLocaleDateString("es-ES")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
