"use client";

import { LANG_NAMES } from "@/lib/constants";

interface Props {
  isNarrow: boolean;
  leftView: "pdf" | "text";
  rightView: "segments" | "preview";
  mobilePanel: "pdf" | "editor";
  targetLang: string;
  pdfPage: number;
  pdfTotalPages: number;
  translating: boolean;
  segmentCount: number;
  onLeftViewChange: (view: "pdf" | "text") => void;
  onRightViewChange: (view: "segments" | "preview") => void;
  onMobilePanelChange: (panel: "pdf" | "editor") => void;
  onTranslateDeepL: () => void;
}

function tabStyle(active: boolean): React.CSSProperties {
  return {
    background: active ? "rgba(201,136,42,0.1)" : "transparent",
    color: active ? "#C9882A" : "#3A6A4A",
    border: "none",
    fontSize: 9,
    fontFamily: "var(--font-mono)",
    padding: "3px 8px",
    cursor: "pointer",
    borderRadius: 2,
    letterSpacing: 0.5,
  };
}

function panelToggleStyle(active: boolean): React.CSSProperties {
  return {
    flex: 1,
    background: active ? "rgba(201,136,42,0.15)" : "transparent",
    color: active ? "#C9882A" : "#6A9A7A",
    border: "none",
    fontSize: 11,
    fontFamily: "var(--font-mono)",
    fontWeight: active ? 600 : 400,
    padding: "6px 0",
    cursor: "pointer",
    letterSpacing: 0.5,
    textTransform: "uppercase" as const,
    borderBottom: active ? "2px solid #C9882A" : "2px solid transparent",
    transition: "all 0.15s ease",
  };
}

export function PanelHeaders({
  isNarrow,
  leftView,
  rightView,
  mobilePanel,
  targetLang,
  pdfPage,
  pdfTotalPages,
  translating,
  segmentCount,
  onLeftViewChange,
  onRightViewChange,
  onMobilePanelChange,
  onTranslateDeepL,
}: Props) {
  if (isNarrow) {
    return (
      <div
        style={{
          height: 36,
          minHeight: 36,
          background: "#112A1C",
          display: "flex",
          alignItems: "stretch",
        }}
      >
        <button
          onClick={() => onMobilePanelChange("pdf")}
          style={panelToggleStyle(mobilePanel === "pdf")}
        >
          PDF
        </button>
        <div style={{ width: 1, background: "rgba(255,255,255,0.08)" }} />
        <button
          onClick={() => onMobilePanelChange("editor")}
          style={panelToggleStyle(mobilePanel === "editor")}
        >
          Traducci&oacute;n
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        height: 32,
        minHeight: 32,
        background: "#112A1C",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
      }}
    >
      {/* Left header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            className="font-mono"
            style={{ fontSize: 9, color: "#3A6A4A", textTransform: "uppercase", letterSpacing: 1 }}
          >
            Documento original
          </span>
          {pdfTotalPages > 0 && (
            <span className="font-mono" style={{ fontSize: 8, color: "#6A9A7A" }}>
              PDF &middot; P&aacute;g. {pdfPage}/{pdfTotalPages}
            </span>
          )}
        </div>
        <div style={{ display: "flex" }}>
          <button onClick={() => onLeftViewChange("pdf")} style={tabStyle(leftView === "pdf")}>
            PDF
          </button>
          <button onClick={() => onLeftViewChange("text")} style={tabStyle(leftView === "text")}>
            Texto
          </button>
        </div>
      </div>

      {/* Right header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          borderLeft: "0.5px solid rgba(255,255,255,0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            className="font-mono"
            style={{ fontSize: 9, color: "#3A6A4A", textTransform: "uppercase", letterSpacing: 1 }}
          >
            Traducci&oacute;n
          </span>
          <span
            className="font-mono"
            style={{
              fontSize: 8,
              color: "#C9882A",
              background: "rgba(201,136,42,0.12)",
              padding: "1px 6px",
              borderRadius: 2,
            }}
          >
            {LANG_NAMES[targetLang] || targetLang}
          </span>
          <button
            onClick={onTranslateDeepL}
            disabled={translating || segmentCount === 0}
            className="font-mono"
            style={{
              fontSize: 8,
              color: "#4A8A5A",
              background: "rgba(74,138,90,0.12)",
              border: "none",
              padding: "1px 6px",
              borderRadius: 2,
              cursor: "pointer",
              opacity: translating ? 0.5 : 1,
            }}
          >
            {translating ? "Traduciendo..." : "DeepL"}
          </button>
        </div>
        <div style={{ display: "flex" }}>
          <button
            onClick={() => onRightViewChange("segments")}
            style={tabStyle(rightView === "segments")}
          >
            Segmentos
          </button>
          <button
            onClick={() => onRightViewChange("preview")}
            style={tabStyle(rightView === "preview")}
          >
            Preview
          </button>
        </div>
      </div>
    </div>
  );
}
