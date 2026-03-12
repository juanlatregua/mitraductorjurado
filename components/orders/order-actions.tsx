"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderStatus } from "@prisma/client";

interface OrderActionsProps {
  orderId: string;
  status: OrderStatus;
  role: "translator" | "client";
  price: number | null;
}

export function OrderActions({ orderId, status, role, price }: OrderActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [quotePrice, setQuotePrice] = useState("");
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  async function updateOrder(data: Record<string, any>) {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok) {
        setError(result.error || "Error al actualizar");
        return;
      }
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-xl border border-navy-100 p-6">
      <h2 className="font-bold text-navy-900 mb-4">Acciones</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {/* Traductor: pendiente → presupuestar */}
      {role === "translator" && status === "pending" && (
        <div>
          {showQuoteForm ? (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Precio (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={quotePrice}
                  onChange={(e) => setQuotePrice(e.target.value)}
                  placeholder="Ej: 85.00"
                  className="w-48 border border-navy-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-400"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    updateOrder({
                      status: "quoted",
                      price: parseFloat(quotePrice),
                    })
                  }
                  disabled={loading || !quotePrice}
                  className="bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
                >
                  {loading ? "Enviando..." : "Enviar presupuesto"}
                </button>
                <button
                  onClick={() => setShowQuoteForm(false)}
                  className="border border-navy-200 text-navy-700 px-5 py-2 rounded-lg text-sm hover:bg-navy-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => setShowQuoteForm(true)}
                className="bg-accent-500 hover:bg-accent-600 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
              >
                Presupuestar
              </button>
              <button
                onClick={() => updateOrder({ status: "cancelled" })}
                disabled={loading}
                className="border border-red-200 text-red-600 px-5 py-2 rounded-lg text-sm hover:bg-red-50"
              >
                Rechazar
              </button>
            </div>
          )}
        </div>
      )}

      {/* Cliente: presupuestado → aceptar o cancelar */}
      {role === "client" && status === "quoted" && (
        <div>
          <p className="text-sm text-navy-600 mb-3">
            Presupuesto recibido:{" "}
            <span className="font-bold text-navy-900 text-lg">
              {price?.toFixed(2)} €
            </span>
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => updateOrder({ status: "accepted" })}
              disabled={loading}
              className="bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
            >
              {loading ? "Procesando..." : "Aceptar presupuesto"}
            </button>
            <button
              onClick={() => updateOrder({ status: "cancelled" })}
              disabled={loading}
              className="border border-red-200 text-red-600 px-5 py-2 rounded-lg text-sm hover:bg-red-50"
            >
              Rechazar
            </button>
          </div>
        </div>
      )}

      {/* Traductor: aceptado → marcar en curso */}
      {role === "translator" && status === "accepted" && (
        <button
          onClick={() => updateOrder({ status: "in_progress" })}
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
        >
          {loading ? "Actualizando..." : "Comenzar traducción"}
        </button>
      )}

      {/* Traductor: en curso → entregar */}
      {role === "translator" && status === "in_progress" && (
        <button
          onClick={() => updateOrder({ status: "delivered" })}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
        >
          {loading ? "Enviando..." : "Marcar como entregado"}
        </button>
      )}

      {/* Cliente: entregado → cerrar */}
      {role === "client" && status === "delivered" && (
        <button
          onClick={() => updateOrder({ status: "closed" })}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
        >
          {loading ? "Cerrando..." : "Confirmar recepción y cerrar"}
        </button>
      )}

      {/* Estados finales */}
      {(status === "closed" || status === "cancelled") && (
        <p className="text-sm text-navy-500">
          Este pedido está {status === "closed" ? "cerrado" : "cancelado"}.
        </p>
      )}

      {/* Esperando al otro */}
      {role === "translator" && status === "quoted" && (
        <p className="text-sm text-navy-500">
          Esperando respuesta del cliente al presupuesto de {price?.toFixed(2)} €.
        </p>
      )}
      {role === "client" && status === "pending" && (
        <p className="text-sm text-navy-500">
          El traductor está revisando tu solicitud.
        </p>
      )}
      {role === "translator" && status === "delivered" && (
        <p className="text-sm text-navy-500">
          Esperando que el cliente confirme la recepción.
        </p>
      )}
      {role === "client" && (status === "accepted" || status === "in_progress") && (
        <p className="text-sm text-navy-500">
          El traductor está trabajando en tu traducción.
        </p>
      )}
    </div>
  );
}
