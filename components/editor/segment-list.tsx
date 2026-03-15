"use client";

import type { EditorSegment } from "@/types";
import { SegmentRow } from "./segment-row";

interface Props {
  segments: EditorSegment[];
  activeSegmentId: string | null;
  onTranslationChange: (id: string, text: string) => void;
  onConfirm: (id: string) => void;
  onFocus: (id: string) => void;
  onMoveNext: (currentId: string) => void;
}

export function SegmentList({
  segments,
  activeSegmentId,
  onTranslationChange,
  onConfirm,
  onFocus,
  onMoveNext,
}: Props) {
  if (segments.length === 0) {
    return null;
  }

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      {segments.map((seg) => (
        <SegmentRow
          key={seg.id}
          segment={seg}
          isActive={seg.id === activeSegmentId}
          onTranslationChange={onTranslationChange}
          onConfirm={onConfirm}
          onFocus={onFocus}
          onMoveNext={() => onMoveNext(seg.id)}
        />
      ))}
    </div>
  );
}
