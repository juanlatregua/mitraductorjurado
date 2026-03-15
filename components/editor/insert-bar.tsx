"use client";

import { INSERT_BAR_ITEMS } from "./constants";

interface Props {
  activeSegmentId: string | null;
  onInsert: (segmentId: string, text: string) => void;
  visible: boolean;
}

export function InsertBar({ activeSegmentId, onInsert, visible }: Props) {
  if (!visible || !activeSegmentId) return null;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 4,
        padding: "6px 16px",
        background: "#F5F0E8",
        borderTop: "0.5px solid #E8E2D8",
        borderBottom: "0.5px solid #E8E2D8",
      }}
    >
      {INSERT_BAR_ITEMS.map((item) => (
        <button
          key={item.label}
          onClick={() => onInsert(activeSegmentId, item.value)}
          className="font-mono"
          style={{
            fontSize: 9,
            color: "#1A3A2A",
            background: "rgba(26,58,42,0.06)",
            border: "0.5px solid rgba(26,58,42,0.15)",
            padding: "3px 8px",
            borderRadius: 10,
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
