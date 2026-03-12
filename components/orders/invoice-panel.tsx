"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface InvoicePanelProps {
  orderId: string;
  role: "translator" | "client";
  orderStatus: string;
}

interface InvoiceData {
  id: string;
  invoiceNumber: string;
  amount: number;
  vatAmount: number;
  totalAmount: number;
  status: string;
  sentToAeat: boolean;
  pdfUrl: string | null;
  createdAt: string;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "bg-amber-100 text-amber-700" },
  sent: { label: "Enviada a AEAT", color: "bg-blue-100 text-blue-700" },
  accepted: { label: "Aceptada AEAT", color: "bg-green-100 text-green-700" },
  rejected: { label: "Rechazada AEAT", color: "bg-red-100 text-red-700" },
};

export function InvoicePanel({ orderId, role, orderStatus }: InvoicePanelProps) {
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/invoices/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        setInvoice(data.invoice);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orderId]);

  async function generateInvoice() {
    setGenerating(true);
    setError("");
    try {
      const res = await fetch(`/api/invoices/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al generar factura");
        return;
      }
      setInvoice(data.invoice);
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-navy-100 p-6">
        <div className="animate-pulse h-16 bg-navy-100 rounded-lg" />
      </div>
    );
  }

  const showPanel = ["delivered", "closed"].includes(orderStatus);
  if (!showPanel) return null;

  const statusInfo = invoice ? STATUS_MAP[invoice.status] || STATUS_MAP.pending : null;

  return (
    <div className="bg-white rounded-xl border border-navy-100 p-6">
      <h2 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
        Factura
        <span className="text-xs font-normal text-navy-400">Verifactu / AEAT</span>
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {invoice ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-medium text-navy-900">
              {invoice.invoiceNumber}
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo?.color}`}>
              {statusInfo?.label}
            </span>
          </div>

          <dl className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <dt className="text-navy-500">Base imponible</dt>
              <dd className="font-medium text-navy-900">{invoice.amount.toFixed(2)} €</dd>
            </div>
            <div>
              <dt className="text-navy-500">IVA (21%)</dt>
              <dd className="font-medium text-navy-900">{invoice.vatAmount.toFixed(2)} €</dd>
            </div>
            <div>
              <dt className="text-navy-500">Total</dt>
              <dd className="font-bold text-navy-900 text-lg">{invoice.totalAmount.toFixed(2)} €</dd>
            </div>
          </dl>

          <div className="flex items-center gap-2 text-xs text-navy-500">
            <span>
              Emitida: {new Date(invoice.createdAt).toLocaleDateString("es-ES")}
            </span>
            {invoice.sentToAeat && <span>· Enviada a AEAT</span>}
          </div>

          {invoice.pdfUrl && (
            <a
              href={invoice.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-navy-50 border border-navy-200 text-navy-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-navy-100 transition-colors"
            >
              Descargar factura (PDF)
            </a>
          )}
        </div>
      ) : (
        role === "translator" && (
          <div>
            <p className="text-sm text-navy-600 mb-3">
              Genera la factura electrónica para este pedido.
              El XML Verifactu se enviará a la AEAT automáticamente.
            </p>
            <button
              onClick={generateInvoice}
              disabled={generating}
              className="bg-navy-800 hover:bg-navy-900 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
            >
              {generating ? "Generando..." : "Generar factura"}
            </button>
          </div>
        )
      )}
    </div>
  );
}
