"use client";

import type { TranslationSegment } from "@/types";

interface Props {
  segment: TranslationSegment;
  isActive: boolean;
  onTranslationChange: (id: string, text: string) => void;
  onConfirm: (id: string) => void;
  onFocus: (id: string) => void;
  onMoveNext: () => void;
}

function getStatus(seg: TranslationSegment): "confirmed" | "suggestion" | "empty" {
  if (seg.isApproved) return "confirmed";
  if (seg.translatedText) return "suggestion";
  return "empty";
}

function isHeaderSegment(text: string): boolean {
  if (text.length > 80 || text.length < 3) return false;
  const letters = text.replace(/[^a-zA-Z\xC0-\xFF]/g, "");
  if (letters.length === 0) return false;
  const upperCount = letters.split("").filter((c) => c === c.toUpperCase()).length;
  return upperCount / letters.length > 0.6;
}

export function SegmentRow({
  segment,
  isActive,
  onTranslationChange,
  onConfirm,
  onFocus,
  onMoveNext,
}: Props) {
  const status = getStatus(segment);
  const header = isHeaderSegment(segment.originalText);

  const dotColor =
    status === "confirmed"
      ? "#4A8A5A"
      : status === "suggestion"
        ? "#C9882A"
        : "#E8E2D8";

  const handleBlur = () => {
    if (segment.translatedText && !segment.isApproved) {
      onConfirm(segment.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (segment.translatedText) {
        onConfirm(segment.id);
      }
      onMoveNext();
    }
    if (e.key === "Tab") {
      e.preventDefault();
      if (segment.translatedText) {
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
        background: isActive ? "rgba(201,136,42,0.02)" : "transparent",
        transition: "background 0.15s",
      }}
    >
      {/* Original text */}
      <div
        style={{
          padding: "12px 16px",
          background: "#FAF7F2",
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
            {segment.originalText}
          </div>
        </div>
      </div>

      {/* Translation */}
      <div style={{ padding: "12px 16px", background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
          {/* Status dot */}
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: dotColor,
              marginTop: 7,
              flexShrink: 0,
            }}
          />

          <textarea
            id={`seg-textarea-${segment.id}`}
            value={segment.translatedText}
            onChange={(e) => onTranslationChange(segment.id, e.target.value)}
            onFocus={() => onFocus(segment.id)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            disabled={segment.isApproved}
            placeholder="Pendiente..."
            rows={Math.max(2, Math.ceil(segment.originalText.length / 50))}
            style={{
              width: "100%",
              resize: "none",
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 12,
              lineHeight: 1.7,
              fontFamily: "inherit",
              color:
                status === "confirmed"
                  ? "#1C1917"
                  : status === "suggestion"
                    ? "#2D6A4F"
                    : "#bbb",
              fontStyle: status === "suggestion" ? "italic" : "normal",
              fontWeight: header ? 500 : 400,
              padding: 0,
            }}
          />
        </div>
      </div>
    </div>
  );
}
