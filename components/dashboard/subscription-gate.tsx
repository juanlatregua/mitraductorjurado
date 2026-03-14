"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const GATED_ROUTES = [
  "/dashboard/translator/editor",
  "/dashboard/translator/orders",
  "/dashboard/translator/invoices",
  "/dashboard/translator/payments",
  "/dashboard/translator/colleagues",
  "/dashboard/translator/widget",
];

interface Props {
  subscribed: boolean;
  children: React.ReactNode;
}

export function SubscriptionGate({ subscribed, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [subscribing, setSubscribing] = useState(false);

  const isGated = GATED_ROUTES.some((route) => pathname.startsWith(route));

  if (!isGated || subscribed) {
    return <>{children}</>;
  }

  async function handleSubscribe() {
    setSubscribing(true);
    try {
      const res = await fetch("/api/stripe/subscription", { method: "POST" });
      const data = await res.json();
      if (data.clientSecret) {
        // Redirect to Stripe portal to complete payment
        const portalRes = await fetch("/api/stripe/portal", { method: "POST" });
        const portalData = await portalRes.json();
        if (portalData.url) {
          window.location.href = portalData.url;
          return;
        }
      } else if (data.status === "active") {
        window.location.reload();
        return;
      }
    } catch {
      // Fallback
    }
    setSubscribing(false);
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", paddingTop: 40 }}>
      {/* Lock icon */}
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 12,
          background: "rgba(201,136,42,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
        }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9882A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <h1
        className="font-playfair"
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: "#1A3A2A",
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        Suscripción necesaria
      </h1>

      <p
        className="font-sans"
        style={{
          fontSize: 14,
          color: "#666",
          textAlign: "center",
          lineHeight: 1.6,
          marginBottom: 32,
        }}
      >
        Esta funcionalidad requiere el Plan Fundador. Accede a todas las
        herramientas profesionales por un precio especial de lanzamiento.
      </p>

      {/* Pricing card */}
      <div
        style={{
          background: "#fff",
          border: "1.5px solid rgba(201,136,42,0.3)",
          borderRadius: 12,
          padding: "28px 24px",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
          <span
            className="font-playfair"
            style={{ fontSize: 36, fontWeight: 700, color: "#1A3A2A" }}
          >
            49€
          </span>
          <span className="font-sans" style={{ fontSize: 14, color: "#888" }}>/mes</span>
        </div>

        <div
          style={{
            display: "inline-block",
            background: "rgba(201,136,42,0.1)",
            color: "#C9882A",
            fontSize: 10,
            fontWeight: 600,
            padding: "3px 8px",
            borderRadius: 4,
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          Precio fundador — para siempre
        </div>

        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {[
            "Editor bilingue + DeepL integrado",
            "Firma eIDAS con Signaturit",
            "Facturacion Verifactu AEAT",
            "Cobros con Stripe Connect",
            "Red de colegas + Widget embebible",
            "Perfil en el directorio publico",
          ].map((feature) => (
            <li
              key={feature}
              className="font-sans"
              style={{
                fontSize: 13,
                color: "#444",
                padding: "6px 0",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span style={{ color: "#4A8A5A", fontSize: 14, flexShrink: 0 }}>&#10003;</span>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={handleSubscribe}
        disabled={subscribing}
        className="font-sans"
        style={{
          display: "block",
          width: "100%",
          padding: "14px 24px",
          background: "#C9882A",
          color: "#fff",
          fontSize: 15,
          fontWeight: 600,
          border: "none",
          borderRadius: 8,
          cursor: subscribing ? "wait" : "pointer",
          opacity: subscribing ? 0.7 : 1,
          transition: "opacity 0.15s",
          marginBottom: 12,
        }}
      >
        {subscribing ? "Procesando..." : "Suscribirse — 49\u20AC/mes"}
      </button>

      <button
        onClick={() => router.push("/dashboard/translator")}
        className="font-sans"
        style={{
          display: "block",
          width: "100%",
          padding: "10px 24px",
          background: "transparent",
          color: "#888",
          fontSize: 13,
          border: "none",
          cursor: "pointer",
        }}
      >
        Volver al panel
      </button>
    </div>
  );
}
