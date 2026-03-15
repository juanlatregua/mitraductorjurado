"use client";

interface TemplateInfo {
  id: string;
  label: string;
  type: string;
  language: string;
  category: string;
  structure?: {
    fixedFields?: { key: string; label: string; type: string; options?: string[] }[];
    variables?: { key: string; label: string; placeholder?: string }[];
  };
  exampleAnon?: string | null;
}

interface Props {
  template: TemplateInfo;
  onUse: (template: TemplateInfo) => void;
  onSkip: () => void;
  onBrowse: () => void;
  loading?: boolean;
}

export function TemplateBanner({ template, onUse, onSkip, onBrowse, loading }: Props) {
  const fieldCount = (template.structure?.fixedFields?.length || 0) +
    (template.structure?.variables?.length || 0);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "8px 16px",
        background: "rgba(201,136,42,0.08)",
        borderBottom: "0.5px solid rgba(201,136,42,0.2)",
      }}
    >
      {/* Icon */}
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
        <rect x="2" y="2" width="12" height="12" rx="2" stroke="#C9882A" strokeWidth="1.2" />
        <line x1="5" y1="5" x2="11" y2="5" stroke="#C9882A" strokeWidth="1" />
        <line x1="5" y1="8" x2="11" y2="8" stroke="#C9882A" strokeWidth="1" />
        <line x1="5" y1="11" x2="9" y2="11" stroke="#C9882A" strokeWidth="1" />
      </svg>

      <div style={{ flex: 1, minWidth: 0 }}>
        <span className="font-sans" style={{ fontSize: 11, color: "#8A6A2A" }}>
          Plantilla detectada: <strong>{template.label}</strong>
        </span>
        {fieldCount > 0 && (
          <span className="font-mono" style={{ fontSize: 8, color: "#B8924A", marginLeft: 8 }}>
            {fieldCount} campos
          </span>
        )}
      </div>

      <button
        onClick={() => onUse(template)}
        disabled={loading}
        className="font-sans"
        style={{
          fontSize: 10,
          fontWeight: 500,
          color: "#fff",
          background: loading ? "#ccc" : "#C9882A",
          border: "none",
          padding: "4px 12px",
          borderRadius: 3,
          cursor: loading ? "default" : "pointer",
        }}
      >
        {loading ? "Cargando..." : "Usar plantilla"}
      </button>
      <button
        onClick={onBrowse}
        className="font-sans"
        style={{
          fontSize: 10,
          color: "#8A6A2A",
          background: "transparent",
          border: "0.5px solid rgba(201,136,42,0.3)",
          padding: "4px 10px",
          borderRadius: 3,
          cursor: "pointer",
        }}
      >
        Ver otras
      </button>
      <button
        onClick={onSkip}
        className="font-sans"
        style={{
          fontSize: 10,
          color: "#999",
          background: "transparent",
          border: "none",
          padding: "4px 8px",
          cursor: "pointer",
        }}
      >
        &times;
      </button>
    </div>
  );
}
