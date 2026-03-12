"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LANG_NAMES } from "@/lib/constants";

interface Colleague {
  userId: string;
  name: string;
  email: string;
  maecNumber: string;
  verified: boolean;
  province: string | null;
  photoUrl: string | null;
  ratePerWord: number | null;
  rateMinimum: number | null;
  avgRating: number;
  languagePairs: { sourceLang: string; targetLang: string }[];
}

interface AssignColleagueProps {
  orderId: string;
  sourceLang: string;
  targetLang: string;
  orderPrice: number | null;
}

export function AssignColleague({ orderId, sourceLang, targetLang, orderPrice }: AssignColleagueProps) {
  const router = useRouter();
  const [colleagues, setColleagues] = useState<Colleague[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [agreedPrice, setAgreedPrice] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Buscar colegas disponibles para este par de idiomas
  useEffect(() => {
    setLoading(true);
    fetch(`/api/colleagues?sourceLang=${sourceLang}&targetLang=${targetLang}`)
      .then((res) => res.json())
      .then((data) => {
        setColleagues(data.colleagues || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sourceLang, targetLang]);

  const selectedColleague = colleagues.find((c) => c.userId === selectedId);
  const price = parseFloat(agreedPrice) || 0;
  const margin = orderPrice ? orderPrice - price : 0;

  async function handleAssign() {
    if (!selectedId || !agreedPrice) return;
    setAssigning(true);
    setError("");

    try {
      const res = await fetch(`/api/orders/${orderId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assignedToId: selectedId,
          agreedPrice: price,
          brokerMargin: Math.max(0, margin),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al asignar");
        return;
      }
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setAssigning(false);
    }
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
      >
        Derivar a un colega
      </button>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-navy-100 p-6">
      <h2 className="font-bold text-navy-900 mb-4">Derivar a colega</h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-navy-100 rounded-lg" />
          ))}
        </div>
      ) : colleagues.length === 0 ? (
        <p className="text-sm text-navy-500">
          No hay colegas disponibles para{" "}
          {LANG_NAMES[sourceLang] || sourceLang} → {LANG_NAMES[targetLang] || targetLang}.
        </p>
      ) : (
        <div className="space-y-4">
          {/* Lista de colegas */}
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {colleagues.map((c) => (
              <label
                key={c.userId}
                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedId === c.userId
                    ? "border-accent-400 bg-accent-50"
                    : "border-navy-100 hover:border-navy-200"
                }`}
              >
                <input
                  type="radio"
                  name="colleague"
                  value={c.userId}
                  checked={selectedId === c.userId}
                  onChange={() => setSelectedId(c.userId)}
                  className="text-accent-500"
                />
                <div className="w-10 h-10 rounded-full bg-navy-200 overflow-hidden flex-shrink-0">
                  {c.photoUrl ? (
                    <img src={c.photoUrl} alt={c.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-navy-400 text-sm">
                      👤
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-navy-900 truncate">{c.name}</span>
                    {c.verified && (
                      <span className="text-xs text-green-600">MAEC ✓</span>
                    )}
                  </div>
                  <div className="text-xs text-navy-500">
                    {c.maecNumber} · {c.province || "España"}
                    {c.rateMinimum && ` · Desde ${c.rateMinimum}€`}
                  </div>
                </div>
              </label>
            ))}
          </div>

          {/* Precio acordado */}
          {selectedId && (
            <div className="pt-4 border-t border-navy-100 space-y-3">
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1">
                  Precio acordado con el colega (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={agreedPrice}
                  onChange={(e) => setAgreedPrice(e.target.value)}
                  placeholder="Ej: 70.00"
                  className="w-48 border border-navy-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-400"
                />
              </div>

              {orderPrice && price > 0 && (
                <div className="text-sm text-navy-600 bg-navy-50 p-3 rounded-lg">
                  <div>Precio al cliente: <strong>{orderPrice.toFixed(2)} €</strong></div>
                  <div>Pago al colega: <strong>{price.toFixed(2)} €</strong></div>
                  <div>
                    Tu margen:{" "}
                    <strong className={margin >= 0 ? "text-green-600" : "text-red-600"}>
                      {margin.toFixed(2)} €
                    </strong>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleAssign}
                  disabled={assigning || !agreedPrice}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
                >
                  {assigning ? "Asignando..." : "Asignar colega"}
                </button>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setSelectedId("");
                    setAgreedPrice("");
                  }}
                  className="border border-navy-200 text-navy-700 px-5 py-2 rounded-lg text-sm hover:bg-navy-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
