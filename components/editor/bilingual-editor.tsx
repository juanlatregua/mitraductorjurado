"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { PdfPanel } from "./pdf-panel";
import { SegmentList } from "./segment-list";
import { PreviewDrawer } from "./preview-drawer";
import { PanelHeaders } from "./panel-headers";
import { StatusBar } from "./status-bar";
import { ToolsSidebar } from "./tools-sidebar";
import { InsertBar } from "./insert-bar";
import { TemplateBanner } from "./template-banner";
import { MemoryBar } from "./memory-bar";
import { LANG_NAMES } from "@/lib/constants";
import type { EditorSegment } from "@/types";

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
  initialSegments: EditorSegment[];
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
}: BilingualEditorProps) {
  /* — State — */
  const [segments, setSegments] = useState<EditorSegment[]>(initialSegments);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [leftView, setLeftView] = useState<"pdf" | "text">("pdf");
  const [rightView, setRightView] = useState<"segments" | "preview">("segments");
  const [previewOpen, setPreviewOpen] = useState(true);
  const [insertBarVisible, setInsertBarVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [message, setMessage] = useState("");
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfTotalPages, setPdfTotalPages] = useState(0);
  const [newText, setNewText] = useState("");
  const [isNarrow, setIsNarrow] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"pdf" | "editor">("editor");

  // Template state
  const [templateInfo, setTemplateInfo] = useState<{
    id: string;
    label: string;
    type: string;
    language: string;
    category: string;
  } | null>(null);
  const [templateDismissed, setTemplateDismissed] = useState(false);

  // Memory stats (stub)
  const [memoryStats, setMemoryStats] = useState({ identicalCount: 0, similarCount: 0, glossaryCount: 0 });

  /* — Responsive: detect < 1200px — */
  useEffect(() => {
    const mql = window.matchMedia("(max-width: 1199px)");
    setIsNarrow(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsNarrow(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  /* — Refs for auto-save — */
  const segmentsRef = useRef(segments);
  useEffect(() => { segmentsRef.current = segments; }, [segments]);

  /* — Fetch template info on mount — */
  useEffect(() => {
    fetch(`/api/editor/${orderId}/template`)
      .then((r) => r.json())
      .then((data) => {
        if (data.template) setTemplateInfo(data.template);
      })
      .catch(() => {});
  }, [orderId]);

  /* — Fetch memory stats on mount — */
  useEffect(() => {
    fetch(`/api/editor/${orderId}/memory`)
      .then((r) => r.json())
      .then((data) => setMemoryStats(data))
      .catch(() => {});
  }, [orderId]);

  /* — Derived — */
  const confirmedCount = segments.filter((s) => s.status === "confirmed").length;
  const totalCount = segments.length;
  const pendingCount = totalCount - confirmedCount;
  const progress = totalCount > 0 ? (confirmedCount / totalCount) * 100 : 0;
  const wordCount = segments.reduce(
    (acc, s) => acc + s.original.split(/\s+/).filter(Boolean).length,
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
    const newSegs: EditorSegment[] = lines.map((text, i) => ({
      id: `seg-${Date.now()}-${baseIndex + i}`,
      index: baseIndex + i,
      original: text,
      translation: "",
      status: "empty" as const,
      source: "manual" as const,
      memoryScore: null,
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
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
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
      const newSegs: EditorSegment[] = paragraphs.map((text, i) => ({
        id: `seg-${Date.now()}-${i}`,
        index: i,
        original: text,
        translation: "",
        status: "empty" as const,
        source: "manual" as const,
        memoryScore: null,
      }));
      setSegments(newSegs);
      setMessage(`${newSegs.length} segmentos extra\u00eddos del PDF`);
    } catch {
      setMessage("Error al extraer texto del PDF");
    }
  }, [originalFileUrl]);

  /* DeepL translation */
  const translateWithDeepL = useCallback(async () => {
    const untranslated = segments.filter((s) => !s.translation && s.status !== "confirmed");
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
          segments: untranslated.map((s) => s.original),
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
            return {
              ...seg,
              translation: data.translations[idx],
              status: "suggestion" as const,
              source: "deepl" as const,
            };
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
      prev.map((s) => {
        if (s.id !== id) return s;
        return {
          ...s,
          translation: text,
          source: "manual" as const,
          status: text ? "suggestion" as const : "empty" as const,
        };
      }),
    );
  }, []);

  /* Confirm segment */
  const handleConfirm = useCallback((id: string) => {
    setSegments((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        return {
          ...s,
          status: s.translation ? "confirmed" as const : s.status,
        };
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
          const el = document.getElementById(`seg-textarea-${nextId}`);
          if (el) {
            el.focus();
            el.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 50);
      }
    },
    [segments],
  );

  /* Insert text at cursor in active segment */
  const handleInsert = useCallback((segmentId: string, text: string) => {
    const textarea = document.getElementById(`seg-textarea-${segmentId}`) as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    setSegments((prev) =>
      prev.map((s) => {
        if (s.id !== segmentId) return s;
        const before = s.translation.slice(0, start);
        const after = s.translation.slice(end);
        return {
          ...s,
          translation: before + text + after,
          source: "manual" as const,
          status: "suggestion" as const,
        };
      }),
    );

    // Restore cursor position after React re-render
    setTimeout(() => {
      textarea.focus();
      const newPos = start + text.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  }, []);

  /* Save to API */
  const save = useCallback(async () => {
    if (segmentsRef.current.length === 0) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/editor/${orderId}/segments`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          segments: segmentsRef.current,
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
        `Confirma todos los segmentos antes de entregar (${pendingCount} pendientes)`,
      );
      return;
    }
    if (!window.confirm(`\u00bfEntregar la traducci\u00f3n al cliente? Esta acci\u00f3n no se puede deshacer.\n\n${confirmedCount} segmentos confirmados, ${wordCount} palabras.`)) {
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
  }, [confirmedCount, totalCount, pendingCount, wordCount, orderId, save]);

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
        <a
          href="/dashboard/translator/orders"
          className="font-sans"
          style={{ fontSize: 11, color: "#4A8A5A", textDecoration: "none" }}
        >
          &larr; Pedidos
        </a>

        <div style={{ width: 0.5, height: 20, background: "rgba(255,255,255,0.08)" }} />

        <span className="font-sans" style={{ fontSize: 13, color: "#F0EBE0" }}>
          {clientName} &mdash; {documentType || "Documento"}
        </span>

        {!isNarrow && (
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
        )}

        {!isNarrow && (
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
        )}

        {isNarrow && <div style={{ flex: 1 }} />}

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

      {/* ─── Panel Headers ─── */}
      <PanelHeaders
        isNarrow={isNarrow}
        leftView={leftView}
        rightView={rightView}
        mobilePanel={mobilePanel}
        targetLang={targetLang}
        pdfPage={pdfPage}
        pdfTotalPages={pdfTotalPages}
        translating={translating}
        segmentCount={segments.length}
        onLeftViewChange={setLeftView}
        onRightViewChange={setRightView}
        onMobilePanelChange={setMobilePanel}
        onTranslateDeepL={translateWithDeepL}
      />

      {/* ─── Template Banner ─── */}
      {templateInfo && !templateDismissed && segments.length === 0 && (
        <TemplateBanner
          template={templateInfo}
          onUse={() => {
            setMessage(`Plantilla "${templateInfo.label}" seleccionada (carga en próxima versión)`);
            setTemplateDismissed(true);
          }}
          onSkip={() => setTemplateDismissed(true)}
          onBrowse={() => {
            setMessage("Explorar plantillas (próximamente)");
          }}
        />
      )}

      {/* ─── Memory Bar ─── */}
      <MemoryBar
        identicalCount={memoryStats.identicalCount}
        similarCount={memoryStats.similarCount}
        glossaryCount={memoryStats.glossaryCount}
      />

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
        <div
          style={{
            width: isNarrow ? "100%" : "50%",
            borderRight: isNarrow ? "none" : "0.5px solid #E8E2D8",
            display: isNarrow && mobilePanel !== "pdf" ? "none" : "block",
          }}
        >
          <PdfPanel
            pdfUrl={originalFileUrl}
            viewMode={leftView}
            segments={segments.map((s) => ({ original: s.original, id: s.id }))}
            activeSegmentId={activeSegmentId}
            currentPage={pdfPage}
            totalPages={pdfTotalPages}
            onPageChange={setPdfPage}
            onTotalPagesChange={setPdfTotalPages}
          />
        </div>

        {/* Right: Segments / Preview + Tools sidebar */}
        <div
          style={{
            width: isNarrow ? "100%" : "50%",
            display: isNarrow && mobilePanel !== "editor" ? "none" : "flex",
            overflow: "hidden",
          }}
        >
          {/* Main editor area */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            {rightView === "segments" ? (
              <>
                {/* DeepL button row — shown on narrow */}
                {isNarrow && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "6px 16px",
                      background: "#FAFAF5",
                      borderBottom: "0.5px solid #E8E2D8",
                    }}
                  >
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
                )}

                {/* Segments or empty state */}
                {segments.length === 0 ? (
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
                  <SegmentList
                    segments={segments}
                    activeSegmentId={activeSegmentId}
                    onTranslationChange={handleTranslationChange}
                    onConfirm={handleConfirm}
                    onFocus={handleFocus}
                    onMoveNext={moveToNext}
                  />
                )}

                {/* Insert bar */}
                <InsertBar
                  activeSegmentId={activeSegmentId}
                  onInsert={handleInsert}
                  visible={insertBarVisible && segments.length > 0}
                />

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

          {/* Tools sidebar — hidden on narrow */}
          {!isNarrow && (
            <ToolsSidebar
              saving={saving}
              translating={translating}
              insertBarVisible={insertBarVisible}
              previewOpen={previewOpen}
              onSave={save}
              onTranslateDeepL={translateWithDeepL}
              onToggleInsertBar={() => setInsertBarVisible(!insertBarVisible)}
              onTogglePreview={() => setPreviewOpen(!previewOpen)}
            />
          )}
        </div>
      </div>

      {/* ─── Status bar ─── */}
      <StatusBar
        segments={segments}
        wordCount={wordCount}
        price={price}
        lastSaved={lastSaved}
      />
    </div>
  );
}
