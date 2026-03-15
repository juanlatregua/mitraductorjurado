"use client";

import { useState, useEffect } from "react";

interface TemplateItem {
  id: string;
  label: string;
  type: string;
  language: string;
  category: string;
  structure?: unknown;
  exampleAnon?: string | null;
}

interface Props {
  orderId: string;
  onSelect: (template: TemplateItem) => void;
  onClose: () => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  academico: "Acad\u00e9mico",
  notarial: "Notarial",
  administrativo: "Administrativo",
  juridico: "Jur\u00eddico",
  economico: "Econ\u00f3mico",
};

export function TemplatePicker({ orderId, onSelect, onClose }: Props) {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/editor/${orderId}/template?all=1`)
      .then((r) => r.json())
      .then((data) => setTemplates(data.templates || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [orderId]);

  // Group by category
  const grouped = templates.reduce<Record<string, TemplateItem[]>>((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {});

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.4)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          width: "100%",
          maxWidth: 480,
          maxHeight: "70vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 12px 40px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px",
            borderBottom: "0.5px solid #E8E2D8",
          }}
        >
          <span className="font-sans" style={{ fontSize: 14, fontWeight: 600, color: "#1A3A2A" }}>
            Plantillas disponibles
          </span>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: 18,
              color: "#999",
              cursor: "pointer",
              padding: "0 4px",
            }}
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {loading ? (
            <div className="font-sans" style={{ padding: 32, textAlign: "center", color: "#888", fontSize: 12 }}>
              Cargando plantillas...
            </div>
          ) : templates.length === 0 ? (
            <div className="font-sans" style={{ padding: 32, textAlign: "center", color: "#888", fontSize: 12 }}>
              No hay plantillas para este idioma.
            </div>
          ) : (
            Object.entries(grouped).map(([cat, items]) => (
              <div key={cat}>
                <div
                  className="font-mono"
                  style={{
                    fontSize: 9,
                    color: "#888",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    padding: "10px 20px 4px",
                  }}
                >
                  {CATEGORY_LABELS[cat] || cat}
                </div>
                {items.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onSelect(t)}
                    className="font-sans"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      padding: "10px 20px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: 12,
                      color: "#1C1917",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(201,136,42,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                      <rect x="1" y="1" width="12" height="12" rx="2" stroke="#C9882A" strokeWidth="1" />
                      <line x1="4" y1="4" x2="10" y2="4" stroke="#C9882A" strokeWidth="0.8" />
                      <line x1="4" y1="7" x2="10" y2="7" stroke="#C9882A" strokeWidth="0.8" />
                      <line x1="4" y1="10" x2="8" y2="10" stroke="#C9882A" strokeWidth="0.8" />
                    </svg>
                    <span style={{ flex: 1 }}>{t.label}</span>
                    {t.exampleAnon && (
                      <span className="font-mono" style={{ fontSize: 8, color: "#4A8A5A" }}>
                        con ejemplo
                      </span>
                    )}
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
