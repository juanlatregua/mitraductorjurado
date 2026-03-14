"use client";

import { useState } from "react";

const TABS = ["Editor", "Dashboard", "Directorio"] as const;
type Tab = (typeof TABS)[number];

function EditorMockup() {
  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[9px] px-2 py-0.5 rounded" style={{ backgroundColor: "var(--color-primary)", color: "#fff" }}>
            FR
          </span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M4 2L8 6L4 10" stroke="#C9882A" strokeWidth="1.5" strokeLinecap="round"/></svg>
          <span className="font-mono text-[9px] px-2 py-0.5 rounded" style={{ backgroundColor: "var(--color-surface)", color: "var(--color-primary)" }}>
            ES
          </span>
        </div>
        <div className="flex-1" />
        <span className="font-mono text-[8px] px-2 py-0.5 rounded" style={{ backgroundColor: "#E8F5E9", color: "#2E7D32" }}>
          75% completado
        </span>
        <span className="font-mono text-[8px] px-2 py-0.5 rounded" style={{ backgroundColor: "#FFF3E0", color: "#E65100" }}>
          DeepL
        </span>
      </div>
      {/* Progress bar */}
      <div className="h-1 w-full" style={{ backgroundColor: "var(--color-surface)" }}>
        <div className="h-full rounded-r" style={{ width: "75%", backgroundColor: "var(--color-primary)" }} />
      </div>
      {/* Segments */}
      <div className="flex-1 overflow-hidden">
        {[
          { fr: "Acte de naissance", es: "Acta de nacimiento", done: true },
          { fr: "Lieu de naissance: Paris", es: "Lugar de nacimiento: Par\u00eds", done: true },
          { fr: "Date de naissance", es: "Fecha de nacimiento", done: true },
          { fr: "Nationalit\u00e9 fran\u00e7aise", es: "", done: false },
        ].map((seg, i) => (
          <div
            key={i}
            className="flex border-b"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div className="flex-1 px-3 py-2 text-[10px] font-sans border-r" style={{ borderColor: "var(--color-border)", color: "var(--color-text-gray)" }}>
              {seg.fr}
            </div>
            <div className="flex-1 px-3 py-2 text-[10px] font-sans" style={{ color: seg.done ? "var(--color-text-dark)" : "#ccc" }}>
              {seg.done ? seg.es : (
                <span className="inline-block w-24 h-2 rounded" style={{ backgroundColor: "var(--color-border)" }} />
              )}
            </div>
            <div className="w-6 flex items-center justify-center">
              {seg.done && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5L4 7L8 3" stroke="#2E7D32" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DashboardMockup() {
  const kpis = [
    { label: "Pedidos activos", value: "12", color: "var(--color-primary)" },
    { label: "Ingresos mes", value: "2.340\u20AC", color: "var(--color-accent)" },
    { label: "Por cobrar", value: "890\u20AC", color: "#E65100" },
    { label: "Completados", value: "47", color: "#2E7D32" },
  ];
  const orders = [
    { id: "MTJ-2401-0012", client: "Garc\u00eda L\u00f3pez", lang: "FR\u2192ES", status: "En curso", statusColor: "#E8F5E9", statusText: "#2E7D32" },
    { id: "MTJ-2401-0013", client: "Mart\u00ednez D\u00edaz", lang: "EN\u2192ES", status: "Pendiente", statusColor: "#FFF3E0", statusText: "#E65100" },
    { id: "MTJ-2401-0014", client: "Fern\u00e1ndez R.", lang: "DE\u2192ES", status: "Entregado", statusColor: "var(--color-surface)", statusText: "var(--color-text-gray)" },
  ];

  return (
    <div className="flex flex-col h-full p-4">
      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-lg p-2 text-center" style={{ backgroundColor: "var(--color-surface)" }}>
            <p className="font-mono text-xs font-semibold" style={{ color: kpi.color }}>{kpi.value}</p>
            <p className="font-sans text-[8px] mt-0.5" style={{ color: "var(--color-text-gray)" }}>{kpi.label}</p>
          </div>
        ))}
      </div>
      {/* Orders table */}
      <div className="rounded-lg border overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
        <div className="grid grid-cols-4 gap-0 px-3 py-1.5 text-[8px] font-mono font-medium" style={{ backgroundColor: "var(--color-surface)", color: "var(--color-text-gray)" }}>
          <span>Pedido</span><span>Cliente</span><span>Idioma</span><span>Estado</span>
        </div>
        {orders.map((o) => (
          <div key={o.id} className="grid grid-cols-4 gap-0 px-3 py-2 text-[9px] font-sans border-t" style={{ borderColor: "var(--color-border)" }}>
            <span className="font-mono" style={{ color: "var(--color-primary)" }}>{o.id}</span>
            <span style={{ color: "var(--color-text-dark)" }}>{o.client}</span>
            <span style={{ color: "var(--color-text-gray)" }}>{o.lang}</span>
            <span className="px-1.5 py-0.5 rounded text-[8px] text-center w-fit" style={{ backgroundColor: o.statusColor, color: o.statusText }}>{o.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DirectoryMockup() {
  const translators = [
    { name: "Ana Mart\u00ednez Ruiz", lang: "FR \u2192 ES", prov: "Madrid", badge: "MAEC N.1234" },
    { name: "Carlos L\u00f3pez Garc\u00eda", lang: "EN \u2192 ES", prov: "Barcelona", badge: "MAEC N.5678" },
    { name: "Laura S\u00e1nchez Fern\u00e1ndez", lang: "DE \u2192 ES", prov: "Sevilla", badge: "MAEC N.9012" },
  ];

  return (
    <div className="flex flex-col h-full p-4">
      {/* Search bar */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-8 rounded-lg border px-3 flex items-center gap-2" style={{ borderColor: "var(--color-border)" }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="5" cy="5" r="3.5" stroke="#999" strokeWidth="1.2" />
            <path d="M8 8L10.5 10.5" stroke="#999" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span className="font-sans text-[10px]" style={{ color: "#bbb" }}>Buscar traductor jurado...</span>
        </div>
      </div>
      {/* Filter pills */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        {["Franc\u00e9s", "Madrid", "Jur\u00eddico", "Disponible"].map((pill) => (
          <span
            key={pill}
            className="font-mono text-[8px] px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "var(--color-primary)", color: "#fff" }}
          >
            {pill}
          </span>
        ))}
      </div>
      {/* Translator cards */}
      {translators.map((t, i) => (
        <div
          key={i}
          className="flex items-center gap-3 py-2.5"
          style={{ borderTop: i > 0 ? "1px solid var(--color-border)" : "none" }}
        >
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-[10px] font-sans font-medium" style={{ backgroundColor: "var(--color-primary)", color: "#fff" }}>
            {t.name.split(" ").map(n => n[0]).slice(0,2).join("")}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-sans text-[10px] font-medium truncate" style={{ color: "var(--color-text-dark)" }}>{t.name}</p>
            <p className="font-sans text-[8px]" style={{ color: "var(--color-text-gray)" }}>{t.prov} &middot; {t.lang}</p>
          </div>
          <span className="font-mono text-[7px] px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--color-surface)", color: "var(--color-accent)" }}>
            {t.badge}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ProductShowcase() {
  const [active, setActive] = useState<Tab>("Editor");

  return (
    <div className="max-w-4xl mx-auto">
      {/* Browser frame */}
      <div className="rounded-xl overflow-hidden shadow-2xl" style={{ border: "1px solid var(--color-border)" }}>
        {/* Title bar */}
        <div className="flex items-center gap-3 px-4 py-2.5" style={{ backgroundColor: "#f5f5f5", borderBottom: "1px solid var(--color-border)" }}>
          {/* Traffic lights */}
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#FF5F57" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#FEBC2E" }} />
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#28C840" }} />
          </div>
          {/* URL bar */}
          <div className="flex-1 h-6 rounded-md flex items-center px-3" style={{ backgroundColor: "#fff", border: "1px solid #e0e0e0" }}>
            <span className="font-mono text-[9px]" style={{ color: "#999" }}>
              mitraductorjurado.es/dashboard
            </span>
          </div>
        </div>
        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: "var(--color-border)", backgroundColor: "#fafafa" }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className="px-5 py-2.5 font-sans text-xs font-medium transition-colors relative"
              style={{
                color: active === tab ? "var(--color-primary)" : "var(--color-text-gray)",
                backgroundColor: active === tab ? "#fff" : "transparent",
              }}
            >
              {tab}
              {active === tab && (
                <div
                  className="absolute bottom-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: "var(--color-accent)" }}
                />
              )}
            </button>
          ))}
        </div>
        {/* Content */}
        <div className="bg-white" style={{ minHeight: 280 }}>
          {active === "Editor" && <EditorMockup />}
          {active === "Dashboard" && <DashboardMockup />}
          {active === "Directorio" && <DirectoryMockup />}
        </div>
      </div>
    </div>
  );
}
