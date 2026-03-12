"use client";

import { useState, useEffect } from "react";

interface PaymentPanelProps {
  orderId: string;
  role: "translator" | "client";
  orderStatus: string;
  price: number | null;
}

interface PaymentData {
  id: string;
  amount: number;
  platformFee: number;
  translatorAmount: number;
  status: string;
  createdAt: string;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente", color: "bg-amber-100 text-amber-700" },
  succeeded: { label: "Pagado", color: "bg-green-100 text-green-700" },
  failed: { label: "Fallido", color: "bg-red-100 text-red-700" },
};

export function PaymentPanel({ orderId, role, orderStatus, price }: PaymentPanelProps) {
  const [payment, setPayment] = useState<PaymentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.order?.payment) {
          setPayment(data.order.payment);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orderId]);

  async function handlePay() {
    setPaying(true);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al procesar pago");
        return;
      }
      // En producción aquí se abriría Stripe Elements / Checkout
      // Por ahora mostramos que el PaymentIntent se creó
      setPayment({
        id: data.paymentIntentId,
        amount: data.amount,
        platformFee: data.platformFee,
        translatorAmount: data.translatorAmount,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
    } catch {
      setError("Error de conexión");
    } finally {
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-navy-100 p-6">
        <div className="animate-pulse h-16 bg-navy-100 rounded-lg" />
      </div>
    );
  }

  // Solo mostrar en estados relevantes
  const showPanel = ["accepted", "in_progress", "delivered", "closed"].includes(orderStatus);
  if (!showPanel) return null;

  const statusInfo = payment ? STATUS_MAP[payment.status] || STATUS_MAP.pending : null;

  return (
    <div className="bg-white rounded-xl border border-navy-100 p-6">
      <h2 className="font-bold text-navy-900 mb-4">Pago</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {payment ? (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo?.color}`}>
              {statusInfo?.label}
            </span>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-navy-500">Total</dt>
              <dd className="font-bold text-navy-900 text-lg">
                {payment.amount.toFixed(2)} €
              </dd>
            </div>
            {role === "translator" && (
              <div>
                <dt className="text-navy-500">Recibirás</dt>
                <dd className="font-bold text-green-600 text-lg">
                  {payment.translatorAmount.toFixed(2)} €
                </dd>
              </div>
            )}
          </dl>

          {payment.status === "succeeded" && (
            <p className="text-xs text-green-600">
              Pago confirmado el{" "}
              {new Date(payment.createdAt).toLocaleDateString("es-ES")}
            </p>
          )}
        </div>
      ) : (
        role === "client" &&
        orderStatus === "accepted" &&
        price && (
          <div>
            <p className="text-sm text-navy-600 mb-3">
              Realiza el pago de <strong>{price.toFixed(2)} €</strong> para
              que el traductor comience a trabajar.
            </p>
            <button
              onClick={handlePay}
              disabled={paying}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors"
            >
              {paying ? "Procesando..." : `Pagar ${price.toFixed(2)} €`}
            </button>
          </div>
        )
      )}
    </div>
  );
}
