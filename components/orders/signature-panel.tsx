"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface SignaturePanelProps {
  orderId: string;
  role: "translator" | "client";
  orderStatus: string;
}

interface SignatureData {
  id: string;
  status: string;
  signaturitId: string | null;
  signedDocumentUrl: string | null;
  signedAt: string | null;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "Pendiente de envío", color: "bg-amber-100 text-amber-700" },
  sent: { label: "Enviada para firma", color: "bg-blue-100 text-blue-700" },
  signed: { label: "Firmado (eIDAS)", color: "bg-green-100 text-green-700" },
  rejected: { label: "Rechazada", color: "bg-red-100 text-red-700" },
};

export function SignaturePanel({ orderId, role, orderStatus }: SignaturePanelProps) {
  const router = useRouter();
  const [signature, setSignature] = useState<SignatureData | null>(null);
  const [configured, setConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/signatures/${orderId}`)
      .then((res) => res.json())
      .then((data) => {
        setSignature(data.signature);
        setConfigured(data.configured);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [orderId]);

  async function requestSignature() {
    setRequesting(true);
    setError("");
    try {
      const res = await fetch(`/api/signatures/${orderId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al solicitar firma");
        return;
      }
      setSignature(data.signature);
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setRequesting(false);
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
  const showPanel = ["in_progress", "delivered", "closed"].includes(orderStatus);
  if (!showPanel) return null;

  const statusInfo = signature
    ? STATUS_MAP[signature.status] || STATUS_MAP.pending
    : null;

  return (
    <div className="bg-white rounded-xl border border-navy-100 p-6">
      <h2 className="font-bold text-navy-900 mb-4 flex items-center gap-2">
        Firma electrónica
        <span className="text-xs font-normal text-navy-400">eIDAS / Signaturit</span>
      </h2>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      {!configured && !signature && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm mb-4">
          Signaturit no configurado. La firma se registrará localmente.
          Añade SIGNATURIT_API_KEY para firma eIDAS real.
        </div>
      )}

      {signature ? (
        <div className="space-y-3">
          {/* Estado */}
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo?.color}`}>
              {statusInfo?.label}
            </span>
            {signature.signedAt && (
              <span className="text-xs text-navy-500">
                Firmado: {new Date(signature.signedAt).toLocaleDateString("es-ES", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </span>
            )}
          </div>

          {/* Documento firmado */}
          {signature.signedDocumentUrl && (
            <a
              href={signature.signedDocumentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-100 transition-colors"
            >
              Descargar documento firmado (PDF)
            </a>
          )}

          {/* Info ID Signaturit */}
          {signature.signaturitId && (
            <p className="text-xs text-navy-400">
              ID Signaturit: {signature.signaturitId}
            </p>
          )}
        </div>
      ) : (
        /* Botón para solicitar firma — solo traductor */
        role === "translator" && (
          <div>
            <p className="text-sm text-navy-600 mb-3">
              Solicita la firma electrónica eIDAS del documento traducido.
              {!configured && " (Se registrará localmente sin Signaturit)"}
            </p>
            <button
              onClick={requestSignature}
              disabled={requesting}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
            >
              {requesting ? "Solicitando..." : "Solicitar firma eIDAS"}
            </button>
          </div>
        )
      )}
    </div>
  );
}
