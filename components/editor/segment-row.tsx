"use client";

import type { TranslationSegment } from "@/types";

interface SegmentRowProps {
  segment: TranslationSegment;
  onTranslationChange: (id: string, text: string) => void;
  onApprove: (id: string) => void;
}

export function SegmentRow({ segment, onTranslationChange, onApprove }: SegmentRowProps) {
  return (
    <div
      className={`grid grid-cols-2 gap-4 p-4 border-b border-navy-100 ${
        segment.isApproved ? "bg-green-50/50" : ""
      }`}
    >
      {/* Panel izquierdo: original */}
      <div className="text-sm text-navy-700 leading-relaxed whitespace-pre-wrap bg-navy-50 rounded-lg p-3">
        <div className="text-xs text-navy-400 mb-1 font-mono">
          #{segment.index + 1}
        </div>
        {segment.originalText}
      </div>

      {/* Panel derecho: traducción */}
      <div className="flex flex-col gap-2">
        <textarea
          value={segment.translatedText}
          onChange={(e) => onTranslationChange(segment.id, e.target.value)}
          disabled={segment.isApproved}
          rows={Math.max(3, Math.ceil(segment.originalText.length / 60))}
          className={`w-full text-sm leading-relaxed rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-accent-400 ${
            segment.isApproved
              ? "bg-green-50 border-green-200 text-navy-600"
              : "bg-white border border-navy-200 text-navy-900"
          }`}
          placeholder="Escribir traducción..."
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => onApprove(segment.id)}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
              segment.isApproved
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-navy-100 text-navy-500 hover:bg-navy-200"
            }`}
          >
            {segment.isApproved ? "✓ Aprobado" : "Aprobar"}
          </button>
          {segment.isEdited && !segment.isApproved && (
            <span className="text-xs text-navy-400">Editado</span>
          )}
        </div>
      </div>
    </div>
  );
}
