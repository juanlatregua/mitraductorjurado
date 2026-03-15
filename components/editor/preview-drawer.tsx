"use client";

import type { EditorSegment } from "@/types";
import { LANG_NAMES } from "@/lib/constants";

interface Props {
  segments: EditorSegment[];
  isOpen: boolean;
  onToggle: () => void;
  translatorName: string;
  maecNumber: string;
  sourceLang: string;
  targetLang: string;
  fullMode?: boolean;
}

export function PreviewDrawer({
  segments,
  isOpen,
  onToggle,
  translatorName,
  maecNumber,
  sourceLang,
  targetLang,
  fullMode = false,
}: Props) {
  const pendingCount = segments.filter((s) => s.status !== "confirmed").length;
  const sourceLangName = LANG_NAMES[sourceLang] || sourceLang;
  const targetLangName = LANG_NAMES[targetLang] || targetLang;

  const today = new Date().toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const containerStyle: React.CSSProperties = fullMode
    ? { flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }
    : {
        maxHeight: isOpen ? 200 : 28,
        transition: "max-height 0.3s",
        overflow: "hidden",
        borderTop: "0.5px solid #E8E2D8",
      };

  return (
    <div style={containerStyle}>
      {/* Collapsible header */}
      {!fullMode && (
        <div
          onClick={onToggle}
          style={{
            height: 28,
            minHeight: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
            background: "#F0EBE3",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <span className="font-mono" style={{ fontSize: 9, color: "#888", letterSpacing: 0.5 }}>
            Previsualizaci&oacute;n &middot; Documento final
          </span>
          <span className="font-mono" style={{ fontSize: 9, color: "#C9882A" }}>
            {pendingCount} pendientes {isOpen ? "\u25BC" : "\u25B2"}
          </span>
        </div>
      )}

      {/* Content */}
      <div
        className="font-sans"
        style={{
          flex: fullMode ? 1 : undefined,
          overflowY: "auto",
          padding: "16px 24px",
          background: "#fff",
          fontSize: 12,
          lineHeight: 1.8,
          color: "#1C1917",
        }}
      >
        {segments.map((seg) => (
          <p
            key={seg.id}
            style={{
              marginBottom: 8,
              background:
                seg.status === "memory"
                  ? "rgba(74,138,90,0.06)"
                  : seg.status === "template"
                    ? "rgba(201,136,42,0.06)"
                    : "transparent",
              padding: seg.status === "memory" || seg.status === "template" ? "2px 6px" : 0,
              borderRadius: 2,
            }}
          >
            {seg.status === "confirmed" || seg.status === "memory" || seg.status === "template" ? (
              seg.translation
            ) : seg.translation ? (
              <span style={{ color: "#C9882A", fontStyle: "italic" }}>
                {seg.translation}
              </span>
            ) : (
              <span style={{ color: "#C9882A", fontStyle: "italic" }}>
                [pendiente]
              </span>
            )}
          </p>
        ))}

        {segments.length > 0 && (
          <>
            <hr style={{ border: "none", borderTop: "0.5px solid #E8E2D8", margin: "20px 0" }} />

            <p style={{ fontSize: 11, lineHeight: 1.6, color: "#333" }}>
              Don/Do&ntilde;a {translatorName}, Traductor/a e Int&eacute;rprete Jurado de{" "}
              {sourceLangName} n&ordm; {maecNumber}, en virtud del t&iacute;tulo otorgado por el
              Ministerio de Asuntos Exteriores, Uni&oacute;n Europea y Cooperaci&oacute;n, certifica
              que la que antecede es traducci&oacute;n fiel y completa al{" "}
              {targetLangName.toLowerCase()} de un documento redactado en{" "}
              {sourceLangName.toLowerCase()}.
            </p>

            <p style={{ fontSize: 11, color: "#333", marginTop: 12 }}>
              En M&aacute;laga, a {today}.
            </p>

            <p style={{ fontSize: 11, color: "#333", marginTop: 4 }}>
              Fdo.: {translatorName}
            </p>

            <div
              style={{
                marginTop: 16,
                border: "0.5px solid #1A3A2A",
                borderRadius: 2,
                padding: "8px 12px",
                display: "inline-block",
                lineHeight: 1.5,
              }}
            >
              <div
                className="font-mono"
                style={{
                  fontSize: 6,
                  color: "#1A3A2A",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                }}
              >
                {translatorName}
              </div>
              <div className="font-mono" style={{ fontSize: 6, color: "#1A3A2A" }}>
                TRADUCTOR E INT&Eacute;RPRETE
              </div>
              <div className="font-mono" style={{ fontSize: 6, color: "#1A3A2A" }}>
                JURADO DE {sourceLangName.toUpperCase()}
              </div>
              <div className="font-mono" style={{ fontSize: 6, color: "#1A3A2A" }}>
                N&ordm; {maecNumber}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
