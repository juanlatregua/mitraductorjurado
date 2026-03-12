"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

interface ConnectStatus {
  configured: boolean;
  status: string;
  message: string;
  stripeOnboarded?: boolean;
  dashboardUrl?: string | null;
}

function PaymentsContent() {
  const searchParams = useSearchParams();
  const [connectStatus, setConnectStatus] = useState<ConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const stripeParam = searchParams.get("stripe");

  useEffect(() => {
    fetch("/api/stripe/connect")
      .then((res) => res.json())
      .then((data) => {
        setConnectStatus(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [stripeParam]);

  async function handleConnect() {
    setConnecting(true);
    try {
      const res = await fetch("/api/stripe/connect", { method: "POST" });
      const data = await res.json();
      if (data.onboardingUrl) {
        window.location.href = data.onboardingUrl;
      }
    } catch {
      setConnecting(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-navy-900 mb-6">Pagos</h1>
        <div className="animate-pulse h-40 bg-navy-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-navy-900 mb-6">Pagos</h1>

      {stripeParam === "success" && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm mb-6">
          Configuración de Stripe completada correctamente.
        </div>
      )}

      {stripeParam === "refresh" && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm mb-6">
          La sesión de configuración expiró. Puedes reiniciarla abajo.
        </div>
      )}

      {!connectStatus?.configured ? (
        <div className="bg-white rounded-xl border border-navy-100 p-6">
          <h2 className="font-bold text-navy-900 mb-2">Stripe no configurado</h2>
          <p className="text-sm text-navy-500">
            El sistema de pagos no está configurado en el servidor.
            Contacta al administrador.
          </p>
        </div>
      ) : connectStatus.status === "active" ? (
        <div className="space-y-6">
          <div className="bg-green-50 rounded-xl border border-green-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 text-lg">
                ✓
              </div>
              <div>
                <h2 className="font-bold text-navy-900">Cuenta Stripe activa</h2>
                <p className="text-sm text-green-600">
                  Puedes recibir pagos de clientes
                </p>
              </div>
            </div>

            {connectStatus.dashboardUrl && (
              <a
                href={connectStatus.dashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white border border-navy-200 text-navy-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-navy-50 transition-colors"
              >
                Abrir panel de Stripe
              </a>
            )}
          </div>

          <div className="bg-white rounded-xl border border-navy-100 p-6">
            <h2 className="font-bold text-navy-900 mb-2">Cómo funciona</h2>
            <ol className="text-sm text-navy-600 space-y-2 list-decimal list-inside">
              <li>El cliente acepta tu presupuesto y realiza el pago</li>
              <li>Stripe retiene el pago hasta que completes la traducción</li>
              <li>Al entregar, los fondos se transfieren a tu cuenta</li>
              <li>La plataforma retiene una comisión del servicio</li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-navy-100 p-6">
          <h2 className="font-bold text-navy-900 mb-2">Conecta tu cuenta de pagos</h2>
          <p className="text-sm text-navy-500 mb-4">
            Para recibir pagos de clientes necesitas configurar tu cuenta
            Stripe. El proceso tarda unos 5 minutos y requiere datos bancarios.
          </p>

          <button
            onClick={handleConnect}
            disabled={connecting}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
          >
            {connecting
              ? "Redirigiendo a Stripe..."
              : connectStatus.status === "pending"
              ? "Continuar configuración"
              : "Conectar con Stripe"}
          </button>

          {connectStatus.status === "pending" && (
            <p className="text-xs text-amber-600 mt-2">
              Tu verificación está pendiente. Completa los pasos en Stripe.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl">
          <h1 className="text-2xl font-bold text-navy-900 mb-6">Pagos</h1>
          <div className="animate-pulse h-40 bg-navy-100 rounded-xl" />
        </div>
      }
    >
      <PaymentsContent />
    </Suspense>
  );
}
