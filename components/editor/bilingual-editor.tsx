"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SegmentRow } from "./segment-row";
import { LANG_NAMES } from "@/lib/constants";
import type { TranslationSegment, BilingualDocument } from "@/types";

interface BilingualEditorProps {
  orderId: string;
  sourceLang: string;
  targetLang: string;
  documentType: string | null;
  initialSegments: TranslationSegment[];
  initialStatus: BilingualDocument["status"];
}

export function BilingualEditor({
  orderId,
  sourceLang,
  targetLang,
  documentType,
  initialSegments,
  initialStatus,
}: BilingualEditorProps) {
  const router = useRouter();
  const [segments, setSegments] = useState<TranslationSegment[]>(initialSegments);
  const [status, setStatus] = useState<BilingualDocument["status"]>(initialStatus);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [newText, setNewText] = useState("");
  const [message, setMessage] = useState("");

  const approvedCount = segments.filter((s) => s.isApproved).length;
  const progress = segments.length > 0 ? Math.round((approvedCount / segments.length) * 100) : 0;

  // Añadir segmentos desde texto pegado
  const addSegments = useCallback(() => {
    if (!newText.trim()) return;

    const lines = newText
      .split(/\n\n+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const newSegments: TranslationSegment[] = lines.map((text, i) => ({
      id: `seg-${Date.now()}-${segments.length + i}`,
      index: segments.length + i,
      originalText: text,
      translatedText: "",
      isEdited: false,
      isApproved: false,
    }));

    setSegments((prev) => [...prev, ...newSegments]);
    setNewText("");
  }, [newText, segments.length]);

  // Traducir con DeepL
  const translateWithDeepL = useCallback(async () => {
    const untranslated = segments.filter((s) => !s.translatedText && !s.isApproved);
    if (untranslated.length === 0) {
      setMessage("Todos los segmentos ya tienen traducción");
      return;
    }

    setTranslating(true);
    setMessage("");

    try {
      const res = await fetch("/api/documents/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segments: untranslated.map((s) => s.originalText),
          sourceLang,
          targetLang,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.configured === false) {
          setMessage("DeepL no configurado. Añade DEEPL_API_KEY en las variables de entorno.");
        } else {
          setMessage(data.error || "Error al traducir");
        }
        return;
      }

      setSegments((prev) =>
        prev.map((seg) => {
          const idx = untranslated.findIndex((u) => u.id === seg.id);
          if (idx !== -1 && data.translations[idx]) {
            return { ...seg, translatedText: data.translations[idx] };
          }
          return seg;
        })
      );

      setMessage(`${untranslated.length} segmentos traducidos con DeepL`);
    } catch {
      setMessage("Error de conexión con DeepL");
    } finally {
      setTranslating(false);
    }
  }, [segments, sourceLang, targetLang]);

  // Editar traducción de un segmento
  const handleTranslationChange = useCallback((id: string, text: string) => {
    setSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, translatedText: text, isEdited: true } : s))
    );
  }, []);

  // Aprobar/desaprobar segmento
  const handleApprove = useCallback((id: string) => {
    setSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isApproved: !s.isApproved } : s))
    );
  }, []);

  // Guardar documento
  const save = useCallback(async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch(`/api/documents/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ segments, status }),
      });
      if (!res.ok) {
        const data = await res.json();
        setMessage(data.error || "Error al guardar");
        return;
      }
      setMessage("Documento guardado");
    } catch {
      setMessage("Error de conexión");
    } finally {
      setSaving(false);
    }
  }, [orderId, segments, status]);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="bg-white border-b border-navy-200 px-6 py-3 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-sm">
          <span className="bg-navy-100 text-navy-700 font-medium px-2 py-0.5 rounded-full text-xs">
            {LANG_NAMES[sourceLang] || sourceLang} → {LANG_NAMES[targetLang] || targetLang}
          </span>
          {documentType && (
            <span className="text-navy-500 text-xs">{documentType}</span>
          )}
        </div>

        {/* Progress bar */}
        <div className="flex items-center gap-2 flex-1">
          <div className="w-32 h-2 bg-navy-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs text-navy-500">
            {approvedCount}/{segments.length} aprobados
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={translateWithDeepL}
            disabled={translating || segments.length === 0}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
          >
            {translating ? "Traduciendo..." : "DeepL"}
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as BilingualDocument["status"])}
            className="border border-navy-200 rounded-lg px-2 py-1.5 text-sm"
          >
            <option value="draft">Borrador</option>
            <option value="reviewing">En revisión</option>
            <option value="approved">Aprobado</option>
          </select>
        </div>
      </div>

      {/* Mensajes */}
      {message && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-2 text-sm text-blue-700">
          {message}
        </div>
      )}

      {/* Column headers */}
      <div className="grid grid-cols-2 gap-4 px-4 py-2 bg-navy-50 border-b border-navy-200 text-xs font-semibold text-navy-500 uppercase">
        <div>Texto original</div>
        <div>Traducción</div>
      </div>

      {/* Segments */}
      <div className="flex-1 overflow-y-auto">
        {segments.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-navy-500 mb-4">
              Pega el texto original del documento para empezar a traducir.
            </p>
          </div>
        ) : (
          segments.map((segment) => (
            <SegmentRow
              key={segment.id}
              segment={segment}
              onTranslationChange={handleTranslationChange}
              onApprove={handleApprove}
            />
          ))
        )}
      </div>

      {/* Input para añadir texto */}
      <div className="bg-white border-t border-navy-200 p-4">
        <div className="flex gap-3">
          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            placeholder="Pega aquí el texto original del documento (separa párrafos con línea en blanco)..."
            rows={3}
            className="flex-1 border border-navy-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-accent-400"
          />
          <button
            onClick={addSegments}
            disabled={!newText.trim()}
            className="self-end bg-navy-800 hover:bg-navy-900 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            Añadir segmentos
          </button>
        </div>
        <p className="text-xs text-navy-400 mt-1">
          Cada párrafo (separado por línea en blanco) se convierte en un segmento independiente.
          TODO: upload PDF + OCR automático en futuras versiones.
        </p>
      </div>
    </div>
  );
}
