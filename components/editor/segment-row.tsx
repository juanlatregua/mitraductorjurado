"use client";

import type { EditorSegment } from "@/types";
import { SEGMENT_STATUS_CONFIG } from "./constants";

interface Props {
  segment: EditorSegment;
  isActive: boolean;
  onTranslationChange: (id: string, text: string) => void;
  onConfirm: (id: string) => void;
  onFocus: (id: string) => void;
  onMoveNext: () => void;
}

function isHeaderSegment(text: string): boolean {
  if (text.length > 80 || text.length < 3) return false;
  const letters = text.replace(/[^a-zA-Z\xC0-\xFF]/g, "");
  if (letters.length === 0) return false;
  const upperCount = letters.split("").filter((c) => c === c.toUpperCase()).length;
  return upperCount / letters.length > 0.6;
}

const SOURCE_BADGES: Record<string, { label: string; color: string; bg: string } | null> = {
  deepl: { label: "DeepL", color: "#0F2B46", bg: "rgba(15,43,70,0.12)" },
  memory: { label: "MEM", color: "#2D8A5A", bg: "rgba(45,138,90,0.12)" },
  template: { label: "TPL", color: "#8A6A2A", bg: "rgba(138,106,42,0.12)" },
  claude: { label: "IA", color: "#6B21A8", bg: "rgba(107,33,168,0.12)" },
  manual: null,
};

export function SegmentRow({
  segment,
  isActive,
  onTranslationChange,
  onConfirm,
  onFocus,
  onMoveNext,
}: Props) {
  const config = SEGMENT_STATUS_CONFIG[segment.status];
  const header = isHeaderSegment(segment.original);
  const badge = SOURCE_BADGES[segment.source];
  const isConfirmed = segment.status === "confirmed";

  const handleBlur = () => {
    if (segment.translation && segment.status !== "confirmed") {
      onConfirm(segment.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (segment.translation) {
        onConfirm(segment.id);
      }
      onMoveNext();
    }
    if (e.key === "Tab") {
      e.preventDefault();
      if (segment.translation) {
        onConfirm(segment.id);
      }
      onMoveNext();
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        borderBottom: "0.5px solid #E8E2D8",
        background: config.bg !== "transparent"
          ? config.bg
          : isActive
            ? "rgba(201,136,42,0.02)"
            : "transparent",
        transition: "background 0.15s",
      }}
    >
      {/* Original text */}
      <div
        style={{
          padding: "12px 16px",
          background: config.bg !== "transparent" ? "transparent" : "#FAF7F2",
          borderRight: "0.5px solid #E8E2D8",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          <span
            className="font-mono"
            style={{
              fontSize: 8,
              color: "#999",
              marginTop: 3,
              minWidth: 20,
              flexShrink: 0,
            }}
          >
            {String(segment.index + 1).padStart(2, "0")}
          </span>
          <div
            className="font-sans"
            style={{
              fontSize: 12,
              lineHeight: 1.7,
              color: header ? "#1A3A2A" : "#1C1917",
              fontWeight: header ? 500 : 400,
              whiteSpace: "pre-wrap",
            }}
          >
            {segment.original}
          </div>
        </div>
      </div>

      {/* Translation */}
      <div style={{ padding: "12px 16px", background: config.bg !== "transparent" ? "transparent" : "#fff" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          {/* Status dot */}
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: segment.status === "empty" ? "transparent" : config.dot,
              border: segment.status === "empty" ? `1.5px solid ${config.dot}` : "none",
              marginTop: 7,
              flexShrink: 0,
            }}
          />

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Source badge */}
            {badge && segment.translation && (
              <span
                className="font-mono"
                style={{
                  fontSize: 7,
                  color: badge.color,
                  background: badge.bg,
                  padding: "1px 5px",
                  borderRadius: 2,
                  marginBottom: 4,
                  display: "inline-block",
                }}
              >
                {badge.label}
              </span>
            )}

            <textarea
              id={`seg-textarea-${segment.id}`}
              value={segment.translation}
              onChange={(e) => onTranslationChange(segment.id, e.target.value)}
              onFocus={() => onFocus(segment.id)}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              disabled={isConfirmed}
              placeholder="Pendiente..."
              rows={Math.max(2, Math.ceil(segment.original.length / 50))}
              style={{
                width: "100%",
                resize: "none",
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 12,
                lineHeight: 1.7,
                fontFamily: "inherit",
                color: config.text,
                fontStyle: config.style,
                fontWeight: header ? 500 : 400,
                padding: 0,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
