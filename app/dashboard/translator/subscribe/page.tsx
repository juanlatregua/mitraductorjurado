"use client";

import { useState } from "react";

const FEATURES = [
  { label: "Editor bilingue + DeepL integrado", desc: "Traduce segmento a segmento con sugerencias automaticas" },
  { label: "Firma eIDAS con Signaturit", desc: "Firma electronica cualificada en tus traducciones" },
  { label: "Facturacion Verifactu AEAT", desc: "Facturas conformes al sistema Verifactu de Hacienda" },
  { label: "Cobros con Stripe Connect", desc: "Cobra a tus clientes directamente, sin intermediarios" },
  { label: "Red de colegas", desc: "Deriva encargos a colegas de confianza con margen" },
  { label: "Widget embebible", desc: "Recibe solicitudes desde tu propia web" },
  { label: "Perfil en el directorio publico", desc: "Visible para clientes que buscan traductor jurado" },
  { label: "Plantillas de documentos", desc: "Base de 35+ tipos de documentos estructurados" },
];

export default function SubscribePage() {
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubscribe() {
    setSubscribing(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/subscription", { method: "POST" });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      if (data.error) {
        setError(data.error);
      }
    } catch {
      setError("Error al conectar con Stripe. Intentalo de nuevo.");
    }
    setSubscribing(false);
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", paddingTop: 20 }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div
          style={{
            display: "inline-block",
            background: "rgba(201,136,42,0.1)",
            color: "#C9882A",
            fontSize: 10,
            fontWeight: 600,
            padding: "4px 12px",
            borderRadius: 4,
            letterSpacing: "1px",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Plan Fundador
        </div>

        <h1
          className="font-playfair"
          style={{ fontSize: 28, fontWeight: 700, color: "#1A3A2A", margin: "0 0 8px" }}
        >
          Todo lo que necesitas por un precio
        </h1>
        <p className="font-sans" style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>
          Editor, firma eIDAS, facturacion, cobros y mas — sin fragmentar tu stack
          en 5 herramientas diferentes.
        </p>
      </div>

      {/* Pricing card */}
      <div
        style={{
          background: "#fff",
          border: "1.5px solid rgba(201,136,42,0.3)",
          borderRadius: 12,
          padding: "32px 28px",
          marginBottom: 24,
        }}
      >
        {/* Price */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
          <span
            className="font-playfair"
            style={{ fontSize: 42, fontWeight: 700, color: "#1A3A2A" }}
          >
            49&#8364;
          </span>
          <span className="font-sans" style={{ fontSize: 16, color: "#888" }}>/mes</span>
        </div>
        <p className="font-sans" style={{ fontSize: 12, color: "#888", marginBottom: 24 }}>
          IVA no incluido &middot; Precio de lanzamiento bloqueado para siempre
        </p>

        {/* Features */}
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 28px" }}>
          {FEATURES.map((f) => (
            <li
              key={f.label}
              style={{
                padding: "10px 0",
                borderBottom: "0.5px solid #F0ECE6",
                display: "flex",
                gap: 12,
              }}
            >
              <span style={{ color: "#4A8A5A", fontSize: 16, flexShrink: 0, marginTop: 1 }}>&#10003;</span>
              <div>
                <div className="font-sans" style={{ fontSize: 13, color: "#1A3A2A", fontWeight: 500 }}>
                  {f.label}
                </div>
                <div className="font-sans" style={{ fontSize: 11, color: "#999", marginTop: 2 }}>
                  {f.desc}
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* Error */}
        {error && (
          <div
            style={{
              background: "rgba(200,50,50,0.08)",
              border: "1px solid rgba(200,50,50,0.2)",
              borderRadius: 6,
              padding: "10px 14px",
              marginBottom: 16,
            }}
          >
            <p className="font-sans" style={{ fontSize: 13, color: "#C44", margin: 0 }}>{error}</p>
          </div>
        )}

        {/* CTA */}
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
          }}
        >
          {subscribing ? "Redirigiendo a Stripe..." : "Suscribirme — 49\u20AC/mes"}
        </button>

        <p className="font-sans" style={{ fontSize: 11, color: "#aaa", textAlign: "center", marginTop: 12 }}>
          Pago seguro con Stripe &middot; Cancela cuando quieras
        </p>
      </div>

      {/* Back link */}
      <div style={{ textAlign: "center" }}>
        <a
          href="/dashboard/translator"
          className="font-sans"
          style={{ fontSize: 13, color: "#888", textDecoration: "none" }}
        >
          &larr; Volver al panel
        </a>
      </div>
    </div>
  );
}
