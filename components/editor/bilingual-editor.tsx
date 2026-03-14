"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { PdfPanel } from "./pdf-panel";
import { SegmentRow } from "./segment-row";
import { PreviewDrawer } from "./preview-drawer";
import { LANG_NAMES } from "@/lib/constants";
import type { TranslationSegment, BilingualDocument } from "@/types";

/* ─── Props ─────────────────────────────────────────────────────────────────── */

interface BilingualEditorProps {
  orderId: string;
  sourceLang: string;
  targetLang: string;
  documentType: string | null;
  originalFileUrl: string | null;
  price: number | null;
  orderStatus: string;
  clientName: string;
  translatorName: string;
  maecNumber: string;
  initialSegments: TranslationSegment[];
  initialStatus: BilingualDocument["status"];
}

/* ─── Helpers ───────────────────────────────────────────────────────────────── */

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

/* ─── Component ─────────────────────────────────────────────────────────────── */

export function BilingualEditor({
  orderId,
  sourceLang,
  targetLang,
  documentType,
  originalFileUrl,
  price,
  clientName,
  translatorName,
  maecNumber,
  initialSegments,
  initialStatus,
}: BilingualEditorProps) {
  /* — State — */
  const [segments, setSegments] = useState<TranslationSegment[]>(initialSegments);
  const [docStatus, setDocStatus] = useState<BilingualDocument["status"]>(initialStatus);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [leftView, setLeftView] = useState<"pdf" | "text">("pdf");
  const [rightView, setRightView] = useState<"segments" | "preview">("segments");
  const [previewOpen, setPreviewOpen] = useState(true);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [message, setMessage] = useState("");
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfTotalPages, setPdfTotalPages] = useState(0);
  const [newText, setNewText] = useState("");

  /* — Refs for auto-save — */
  const segmentsRef = useRef(segments);
  const docStatusRef = useRef(docStatus);
  useEffect(() => { segmentsRef.current = segments; }, [segments]);
  useEffect(() => { docStatusRef.current = docStatus; }, [docStatus]);

  /* — Derived — */
  const confirmedCount = segments.filter((s) => s.isApproved).length;
  const suggestionCount = segments.filter((s) => s.translatedText && !s.isApproved).length;
  const emptyCount = segments.filter((s) => !s.translatedText).length;
  const totalCount = segments.length;
  const progress = totalCount > 0 ? (confirmedCount / totalCount) * 100 : 0;
  const wordCount = segments.reduce(
    (acc, s) => acc + s.originalText.split(/\s+/).filter(Boolean).length,
    0,
  );

  /* — Auto-dismiss message — */
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(""), 5000);
    return () => clearTimeout(t);
  }, [message]);

  /* ─── Handlers ────────────────────────────────────────────────────────────── */

  /* Add segments from pasted text */
  const addSegments = useCallback(() => {
    if (!newText.trim()) return;
    const lines = newText
      .split(/\n\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const baseIndex = segments.length;
    const newSegs: TranslationSegment[] = lines.map((text, i) => ({
      id: `seg-${Date.now()}-${baseIndex + i}`,
      index: baseIndex + i,
      originalText: text,
      translatedText: "",
      isEdited: false,
      isApproved: false,
    }));
    setSegments((prev) => [...prev, ...newSegs]);
    setNewText("");
    setMessage(`${newSegs.length} segmentos a\u00f1adidos`);
  }, [newText, segments.length]);

  /* Extract text from PDF using pdfjs */
  const extractFromPdf = useCallback(async () => {
    if (!originalFileUrl) return;
    setMessage("Extrayendo texto del PDF...");
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      const doc = await pdfjsLib.getDocument(originalFileUrl).promise;
      let fullText = "";
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pageText = content.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\n\n";
      }
      const paragraphs = fullText
        .split(/\n\n+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      const newSegs: TranslationSegment[] = paragraphs.map((text, i) => ({
        id: `seg-${Date.now()}-${i}`,
        index: i,
        originalText: text,
        translatedText: "",
        isEdited: false,
        isApproved: false,
      }));
      setSegments(newSegs);
      setMessage(`${newSegs.length} segmentos extra\u00eddos del PDF`);
    } catch {
      setMessage("Error al extraer texto del PDF");
    }
  }, [originalFileUrl]);

  /* DeepL translation */
  const translateWithDeepL = useCallback(async () => {
    const untranslated = segments.filter((s) => !s.translatedText && !s.isApproved);
    if (untranslated.length === 0) {
      setMessage("Todos los segmentos ya tienen traducci\u00f3n");
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
        setMessage(
          data.configured === false
            ? "DeepL no configurado. A\u00f1ade DEEPL_API_KEY."
            : data.error || "Error al traducir",
        );
        return;
      }
      setSegments((prev) =>
        prev.map((seg) => {
          const idx = untranslated.findIndex((u) => u.id === seg.id);
          if (idx !== -1 && data.translations[idx]) {
            return { ...seg, translatedText: data.translations[idx] };
          }
          return seg;
        }),
      );
      setMessage(`${untranslated.length} segmentos traducidos con DeepL`);
    } catch {
      setMessage("Error de conexi\u00f3n con DeepL");
    } finally {
      setTranslating(false);
    }
  }, [segments, sourceLang, targetLang]);

  /* Edit segment */
  const handleTranslationChange = useCallback((id: string, text: string) => {
    setSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, translatedText: text, isEdited: true } : s)),
    );
  }, []);

  /* Confirm segment */
  const handleConfirm = useCallback((id: string) => {
    setSegments((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        return { ...s, isApproved: s.translatedText ? true : s.isApproved };
      }),
    );
  }, []);

  /* Focus segment */
  const handleFocus = useCallback((id: string) => {
    setActiveSegmentId(id);
  }, []);

  /* Move to next segment */
  const moveToNext = useCallback(
    (currentId: string) => {
      const idx = segments.findIndex((s) => s.id === currentId);
      if (idx < segments.length - 1) {
        const nextId = segments[idx + 1].id;
        setActiveSegmentId(nextId);
        setTimeout(() => {
          document.getElementById(`seg-textarea-${nextId}`)?.focus();
        }, 50);
      }
    },
    [segments],
  );

  /* Save document to Blob */
  const save = useCallback(async () => {
    if (segmentsRef.current.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/documents/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segments: segmentsRef.current,
          status: docStatusRef.current,
        }),
      });
      if (res.ok) {
        setLastSaved(new Date());
      } else {
        const data = await res.json();
        setMessage(data.error || "Error al guardar");
      }
    } catch {
      setMessage("Error de conexi\u00f3n");
    } finally {
      setSaving(false);
    }
  }, [orderId]);

  /* Auto-save every 30s */
  const hasSegments = segments.length > 0;
  useEffect(() => {
    if (!hasSegments) return;
    const interval = setInterval(save, 30000);
    return () => clearInterval(interval);
  }, [hasSegments, save]);

  /* Deliver order */
  const deliver = useCallback(async () => {
    if (confirmedCount < totalCount) {
      setMessage(
        `Confirma todos los segmentos antes de entregar (${emptyCount + suggestionCount} pendientes)`,
      );
      return;
    }
    try {
      await save();
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "delivered" }),
      });
      if (res.ok) {
        window.location.href = "/dashboard/translator/orders";
      } else {
        const data = await res.json();
        setMessage(data.error || "Error al entregar");
      }
    } catch {
      setMessage("Error de conexi\u00f3n");
    }
  }, [confirmedCount, totalCount, emptyCount, suggestionCount, orderId, save]);

  /* Last-saved label */
  const lastSavedLabel = lastSaved
    ? `Guardado hace ${Math.max(1, Math.round((Date.now() - lastSaved.getTime()) / 60000))} min`
    : "";

  /* ─── Render ──────────────────────────────────────────────────────────────── */

  return (
    <div
      style={{
        margin: -32,
        height: "calc(100vh - 52px)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "#fff",
      }}
    >
      {/* ─── Topbar 48px ─── */}
      <div
        style={{
          height: 48,
          minHeight: 48,
          background: "#1A3A2A",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 12,
        }}
      >
        {/* Back link */}
        <a
          href="/dashboard/translator/orders"
          className="font-sans"
          style={{ fontSize: 11, color: "#4A8A5A", textDecoration: "none" }}
        >
          &larr; Pedidos
        </a>

        {/* Separator */}
        <div style={{ width: 0.5, height: 20, background: "rgba(255,255,255,0.08)" }} />

        {/* Document name */}
        <span className="font-sans" style={{ fontSize: 13, color: "#F0EBE0" }}>
          {clientName} &mdash; {documentType || "Documento"}
        </span>

        {/* Lang badge */}
        <span
          className="font-mono"
          style={{
            fontSize: 9,
            color: "#C9882A",
            background: "rgba(201,136,42,0.12)",
            padding: "2px 8px",
            borderRadius: 3,
          }}
        >
          {LANG_NAMES[sourceLang] || sourceLang} &rarr; {LANG_NAMES[targetLang] || targetLang}
        </span>

        {/* Progress (centered) */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 160,
              height: 3,
              background: "rgba(255,255,255,0.08)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progress}%`,
                background: "#C9882A",
                transition: "width 0.3s",
              }}
            />
          </div>
          <span className="font-mono" style={{ fontSize: 9, color: "#4A8A5A" }}>
            {confirmedCount} / {totalCount} segmentos &middot; {Math.round(progress)}%
          </span>
        </div>

        {/* Save ghost */}
        <button
          onClick={save}
          disabled={saving}
          className="font-sans"
          style={{
            background: "transparent",
            border: "0.5px solid rgba(255,255,255,0.15)",
            color: "#F0EBE0",
            fontSize: 11,
            padding: "5px 14px",
            borderRadius: 4,
            cursor: "pointer",
            opacity: saving ? 0.5 : 1,
          }}
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>

        {/* Deliver amber */}
        <button
          onClick={deliver}
          className="font-sans"
          style={{
            background: "#C9882A",
            border: "none",
            color: "#fff",
            fontSize: 11,
            fontWeight: 500,
            padding: "5px 14px",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Entregar &rarr;
        </button>
      </div>

      {/* ─── Panel Headers 32px ─── */}
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
            <button onClick={() => setLeftView("pdf")} style={tabStyle(leftView === "pdf")}>
              PDF
            </button>
            <button onClick={() => setLeftView("text")} style={tabStyle(leftView === "text")}>
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
              onClick={translateWithDeepL}
              disabled={translating || segments.length === 0}
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
              onClick={() => setRightView("segments")}
              style={tabStyle(rightView === "segments")}
            >
              Segmentos
            </button>
            <button
              onClick={() => setRightView("preview")}
              style={tabStyle(rightView === "preview")}
            >
              Preview
            </button>
          </div>
        </div>
      </div>

      {/* ─── Message bar ─── */}
      {message && (
        <div
          className="font-sans"
          style={{
            padding: "5px 16px",
            background: "rgba(201,136,42,0.08)",
            fontSize: 11,
            color: "#C9882A",
          }}
        >
          {message}
        </div>
      )}

      {/* ─── Body ─── */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Left: PDF Panel */}
        <div style={{ width: "50%", borderRight: "0.5px solid #E8E2D8" }}>
          <PdfPanel
            pdfUrl={originalFileUrl}
            viewMode={leftView}
            segments={segments.map((s) => ({ originalText: s.originalText, id: s.id }))}
            activeSegmentId={activeSegmentId}
            currentPage={pdfPage}
            totalPages={pdfTotalPages}
            onPageChange={setPdfPage}
            onTotalPagesChange={setPdfTotalPages}
          />
        </div>

        {/* Right: Segments / Preview */}
        <div
          style={{
            width: "50%",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {rightView === "segments" ? (
            <>
              {/* Segments */}
              <div style={{ flex: 1, overflowY: "auto" }}>
                {segments.length === 0 ? (
                  /* ─ Empty state ─ */
                  <div
                    style={{
                      padding: 32,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                      gap: 16,
                    }}
                  >
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                      <rect x="2" y="6" width="20" height="36" rx="2" stroke="#E8E2D8" strokeWidth="1.5" />
                      <rect x="26" y="6" width="20" height="36" rx="2" stroke="#E8E2D8" strokeWidth="1.5" />
                      <line x1="6" y1="14" x2="18" y2="14" stroke="#E8E2D8" strokeWidth="1" />
                      <line x1="6" y1="20" x2="18" y2="20" stroke="#E8E2D8" strokeWidth="1" />
                      <line x1="6" y1="26" x2="14" y2="26" stroke="#E8E2D8" strokeWidth="1" />
                      <line x1="30" y1="14" x2="42" y2="14" stroke="#E8E2D8" strokeWidth="1" />
                      <line x1="30" y1="20" x2="42" y2="20" stroke="#E8E2D8" strokeWidth="1" />
                    </svg>
                    <p className="font-sans" style={{ color: "#888", fontSize: 13 }}>
                      No hay segmentos cargados.
                    </p>

                    {originalFileUrl && (
                      <button
                        onClick={extractFromPdf}
                        className="font-sans"
                        style={{
                          background: "#1A3A2A",
                          color: "#F0EBE0",
                          border: "none",
                          fontSize: 12,
                          padding: "8px 20px",
                          borderRadius: 4,
                          cursor: "pointer",
                          fontWeight: 500,
                        }}
                      >
                        Extraer texto del PDF
                      </button>
                    )}

                    <div style={{ width: "100%", maxWidth: 420, marginTop: 8 }}>
                      <textarea
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        placeholder="O pega aqu\u00ed el texto original (separa p\u00e1rrafos con l\u00ednea en blanco)..."
                        rows={5}
                        style={{
                          width: "100%",
                          border: "0.5px solid #E8E2D8",
                          borderRadius: 4,
                          padding: "10px 12px",
                          fontSize: 12,
                          fontFamily: "inherit",
                          resize: "none",
                          outline: "none",
                          color: "#1C1917",
                        }}
                      />
                      <button
                        onClick={addSegments}
                        disabled={!newText.trim()}
                        className="font-sans"
                        style={{
                          marginTop: 8,
                          background: newText.trim() ? "#C9882A" : "#E8E2D8",
                          color: newText.trim() ? "#fff" : "#999",
                          border: "none",
                          fontSize: 11,
                          padding: "6px 16px",
                          borderRadius: 4,
                          cursor: newText.trim() ? "pointer" : "default",
                          fontWeight: 500,
                        }}
                      >
                        A&ntilde;adir segmentos
                      </button>
                    </div>
                  </div>
                ) : (
                  segments.map((seg) => (
                    <SegmentRow
                      key={seg.id}
                      segment={seg}
                      isActive={seg.id === activeSegmentId}
                      onTranslationChange={handleTranslationChange}
                      onConfirm={handleConfirm}
                      onFocus={handleFocus}
                      onMoveNext={() => moveToNext(seg.id)}
                    />
                  ))
                )}
              </div>

              {/* Preview drawer (collapsible at bottom) */}
              {segments.length > 0 && (
                <PreviewDrawer
                  segments={segments}
                  isOpen={previewOpen}
                  onToggle={() => setPreviewOpen(!previewOpen)}
                  translatorName={translatorName}
                  maecNumber={maecNumber}
                  sourceLang={sourceLang}
                  targetLang={targetLang}
                />
              )}
            </>
          ) : (
            /* Full preview mode */
            <PreviewDrawer
              segments={segments}
              isOpen={true}
              onToggle={() => {}}
              translatorName={translatorName}
              maecNumber={maecNumber}
              sourceLang={sourceLang}
              targetLang={targetLang}
              fullMode
            />
          )}
        </div>
      </div>

      {/* ─── Statusbar 26px ─── */}
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
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#4A8A5A" }} />
          <span>{confirmedCount} confirmados</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#C9882A" }} />
          <span>{suggestionCount} sugerencia DeepL</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#3A3A3A" }} />
          <span>{emptyCount} pendientes</span>
        </div>
        <span style={{ marginLeft: "auto" }}>
          {wordCount} palabras
          {price ? ` \u00b7 ${(price * 1.21).toFixed(0)}\u20ac + IVA` : ""}
          {lastSavedLabel ? ` \u00b7 ${lastSavedLabel}` : ""}
        </span>
      </div>
    </div>
  );
}
