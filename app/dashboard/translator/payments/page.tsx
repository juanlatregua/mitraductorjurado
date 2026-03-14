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

interface SubStatus {
  status: string;
  currentPeriodEnd: string;
  cancelledAt: string | null;
}

function PaymentsContent() {
  const searchParams = useSearchParams();
  const [connectStatus, setConnectStatus] = useState<ConnectStatus | null>(null);
  const [subStatus, setSubStatus] = useState<SubStatus | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const stripeParam = searchParams.get("stripe");

  useEffect(() => {
    Promise.all([
      fetch("/api/stripe/connect").then((r) => r.json()),
      fetch("/api/stripe/subscription").then((r) => r.json()),
    ])
      .then(([connect, sub]) => {
        setConnectStatus(connect);
        setSubStatus(sub.subscription);
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

  async function handleSubscribe() {
    setSubscribing(true);
    try {
      const res = await fetch("/api/stripe/subscription", { method: "POST" });
      const data = await res.json();
      if (data.clientSecret) {
        // TODO: Abrir Stripe Elements para completar pago
        // Por ahora redirigir al portal
        const portalRes = await fetch("/api/stripe/portal", { method: "POST" });
        const portalData = await portalRes.json();
        if (portalData.url) {
          window.location.href = portalData.url;
        }
      } else if (data.status === "active") {
        window.location.reload();
      }
    } catch {
      setSubscribing(false);
    }
  }

  async function handleCancel() {
    if (!confirm("¿Seguro que quieres cancelar tu suscripción? Seguirás teniendo acceso hasta el final del período actual.")) {
      return;
    }
    setCancelling(true);
    try {
      await fetch("/api/stripe/subscription", { method: "DELETE" });
      window.location.reload();
    } catch {
      setCancelling(false);
    }
  }

  async function handlePortal() {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-navy-900 mb-6">Pagos y suscripción</h1>
        <div className="animate-pulse h-40 bg-navy-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-navy-900 mb-6">Pagos y suscripción</h1>

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

      {/* ─── Suscripción Plan Fundador ─── */}
      <div className="bg-white rounded-xl border border-navy-100 p-6 mb-6">
        <h2 className="font-bold text-navy-900 mb-1">Plan Fundador</h2>
        <p className="text-sm text-navy-500 mb-4">49€/mes — Acceso completo a la plataforma</p>

        {subStatus === undefined ? null : subStatus === null ? (
          // Sin suscripción
          <div>
            <div className="bg-accent-50 border border-accent-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-navy-700 font-medium mb-2">Incluido en el plan:</p>
              <ul className="text-xs text-navy-600 space-y-1">
                <li>Editor bilingüe + DeepL integrado</li>
                <li>Firma eIDAS con Signaturit</li>
                <li>Facturación Verifactu AEAT</li>
                <li>Cobros con Stripe Connect</li>
                <li>Red de colegas + Widget embebible</li>
                <li>Perfil en el directorio público</li>
              </ul>
            </div>
            <button
              onClick={handleSubscribe}
              disabled={subscribing}
              className="bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
            >
              {subscribing ? "Procesando..." : "Suscribirse — 49€/mes"}
            </button>
          </div>
        ) : subStatus.status === "active" && !subStatus.cancelledAt ? (
          // Suscripción activa
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-sm text-green-700 font-medium">Suscripción activa</span>
            </div>
            <p className="text-xs text-navy-500 mb-4">
              Próxima renovación:{" "}
              {new Date(subStatus.currentPeriodEnd).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <div className="flex gap-3">
              <button
                onClick={handlePortal}
                className="bg-white border border-navy-200 text-navy-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-navy-50 transition-colors"
              >
                Gestionar suscripción
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="text-sm text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
              >
                {cancelling ? "Cancelando..." : "Cancelar suscripción"}
              </button>
            </div>
          </div>
        ) : subStatus.cancelledAt ? (
          // Cancelada (aún activa hasta fin de período)
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-sm text-amber-700 font-medium">Cancelada — acceso hasta fin del período</span>
            </div>
            <p className="text-xs text-navy-500 mb-4">
              Tu acceso termina el{" "}
              {new Date(subStatus.currentPeriodEnd).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <button
              onClick={handleSubscribe}
              disabled={subscribing}
              className="bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
            >
              {subscribing ? "Procesando..." : "Reactivar suscripción"}
            </button>
          </div>
        ) : (
          // Estado incompleto o past_due
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-sm text-red-700 font-medium">
                Pago pendiente ({subStatus.status})
              </span>
            </div>
            <button
              onClick={handlePortal}
              className="bg-accent-500 hover:bg-accent-600 text-white font-semibold px-5 py-2 rounded-lg text-sm transition-colors"
            >
              Completar pago
            </button>
          </div>
        )}
      </div>

      {/* ─── Stripe Connect (cobros) ─── */}
      {!connectStatus?.configured ? (
        <div className="bg-white rounded-xl border border-navy-100 p-6">
          <h2 className="font-bold text-navy-900 mb-2">Stripe Connect</h2>
          <p className="text-sm text-navy-500">
            El sistema de pagos no está configurado en el servidor.
            Contacta al administrador.
          </p>
        </div>
      ) : connectStatus.status === "active" ? (
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
          <h1 className="text-2xl font-bold text-navy-900 mb-6">Pagos y suscripción</h1>
          <div className="animate-pulse h-40 bg-navy-100 rounded-xl" />
        </div>
      }
    >
      <PaymentsContent />
    </Suspense>
  );
}
