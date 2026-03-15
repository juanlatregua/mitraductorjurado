"use client";

import type { EditorSegment } from "@/types";

interface Props {
  segments: EditorSegment[];
  wordCount: number;
  price: number | null;
  lastSaved: Date | null;
}

export function StatusBar({ segments, wordCount, price, lastSaved }: Props) {
  const counts = {
    memory: 0,
    template: 0,
    confirmed: 0,
    pending: 0,
  };

  for (const seg of segments) {
    if (seg.status === "memory") counts.memory++;
    else if (seg.status === "template") counts.template++;
    else if (seg.status === "confirmed") counts.confirmed++;
    else counts.pending++;
  }

  const lastSavedLabel = lastSaved
    ? `Guardado hace ${Math.max(1, Math.round((Date.now() - lastSaved.getTime()) / 60000))} min`
    : "";

  return (
    <div
      className="font-mono"
      style={{
        height: 26,
        minHeight: 26,
        background: "#112A1C",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        gap: 16,
        fontSize: 8,
        color: "#2A5A3A",
      }}
    >
      {counts.memory > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#2D8A5A" }} />
          <span>{counts.memory} memoria</span>
        </div>
      )}
      {counts.template > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#8A6A2A" }} />
          <span>{counts.template} plantilla</span>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#4A8A5A" }} />
        <span>{counts.confirmed} confirmados</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <div
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "transparent",
            border: "1px solid #E8E2D8",
          }}
        />
        <span>{counts.pending} pendientes</span>
      </div>
      <span style={{ marginLeft: "auto" }}>
        {wordCount} palabras
        {price ? ` \u00b7 ${(price * 1.21).toFixed(0)}\u20ac + IVA` : ""}
        {lastSavedLabel ? ` \u00b7 ${lastSavedLabel}` : ""}
      </span>
    </div>
  );
}
