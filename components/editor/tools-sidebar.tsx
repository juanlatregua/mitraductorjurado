"use client";

interface Props {
  saving: boolean;
  translating: boolean;
  insertBarVisible: boolean;
  previewOpen: boolean;
  onSave: () => void;
  onTranslateDeepL: () => void;
  onToggleInsertBar: () => void;
  onTogglePreview: () => void;
}

const btnStyle: React.CSSProperties = {
  width: 36,
  height: 32,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: 0,
  borderBottom: "0.5px solid #E8E2D8",
};

export function ToolsSidebar({
  saving,
  translating,
  insertBarVisible,
  previewOpen,
  onSave,
  onTranslateDeepL,
  onToggleInsertBar,
  onTogglePreview,
}: Props) {
  return (
    <div
      style={{
        width: 36,
        minWidth: 36,
        background: "#FAFAF5",
        borderLeft: "0.5px solid #E8E2D8",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Save */}
      <button onClick={onSave} disabled={saving} style={btnStyle} title="Guardar">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="2" y="2" width="10" height="10" rx="1.5" stroke={saving ? "#ccc" : "#4A8A5A"} strokeWidth="1.2" />
          <rect x="4" y="2" width="4" height="4" fill={saving ? "#ccc" : "#4A8A5A"} opacity="0.3" />
          <rect x="4" y="8" width="6" height="3" rx="0.5" fill={saving ? "#ccc" : "#4A8A5A"} opacity="0.5" />
        </svg>
      </button>

      {/* DeepL */}
      <button onClick={onTranslateDeepL} disabled={translating} style={btnStyle} title="Traducir con DeepL">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 7h10M7 2v10" stroke={translating ? "#ccc" : "#0F2B46"} strokeWidth="1.2" />
          <circle cx="7" cy="7" r="5" stroke={translating ? "#ccc" : "#0F2B46"} strokeWidth="1" />
        </svg>
      </button>

      {/* Insert bar toggle */}
      <button
        onClick={onToggleInsertBar}
        style={{
          ...btnStyle,
          background: insertBarVisible ? "rgba(201,136,42,0.08)" : "transparent",
        }}
        title="Inserciones rápidas"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="5" width="12" height="4" rx="2" stroke="#C9882A" strokeWidth="1" />
          <line x1="5" y1="7" x2="9" y2="7" stroke="#C9882A" strokeWidth="1" />
        </svg>
      </button>

      {/* Glossary (stub) */}
      <button style={{ ...btnStyle, opacity: 0.4, cursor: "default" }} title="Glosario (próximamente)" disabled>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <rect x="2" y="1" width="10" height="12" rx="1" stroke="#888" strokeWidth="1" />
          <line x1="4" y1="4" x2="10" y2="4" stroke="#888" strokeWidth="0.8" />
          <line x1="4" y1="7" x2="10" y2="7" stroke="#888" strokeWidth="0.8" />
          <line x1="4" y1="10" x2="8" y2="10" stroke="#888" strokeWidth="0.8" />
        </svg>
      </button>

      {/* Memory (stub) */}
      <button style={{ ...btnStyle, opacity: 0.4, cursor: "default" }} title="Memoria (próximamente)" disabled>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="5" stroke="#888" strokeWidth="1" />
          <path d="M7 4v3l2 2" stroke="#888" strokeWidth="1" />
        </svg>
      </button>

      {/* Preview toggle */}
      <button
        onClick={onTogglePreview}
        style={{
          ...btnStyle,
          background: previewOpen ? "rgba(74,138,90,0.08)" : "transparent",
        }}
        title="Previsualización"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" stroke="#4A8A5A" strokeWidth="1" />
          <circle cx="7" cy="7" r="2" stroke="#4A8A5A" strokeWidth="1" />
        </svg>
      </button>
    </div>
  );
}
