"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  pdfUrl: string | null;
  viewMode: "pdf" | "text";
  segments: { id: string; original: string }[];
  activeSegmentId: string | null;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onTotalPagesChange: (total: number) => void;
}

const toolBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "#aaa",
  fontSize: 14,
  fontFamily: "var(--font-mono)",
  cursor: "pointer",
  padding: "2px 6px",
  borderRadius: 3,
};

const toolLabel: React.CSSProperties = {
  color: "#aaa",
  fontSize: 10,
  fontFamily: "var(--font-mono)",
  minWidth: 40,
  textAlign: "center" as const,
};

export function PdfPanel({
  pdfUrl,
  viewMode,
  segments,
  activeSegmentId,
  currentPage,
  totalPages,
  onPageChange,
  onTotalPagesChange,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [zoom, setZoom] = useState(1.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load PDF document
  useEffect(() => {
    if (!pdfUrl) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
        const doc = await pdfjsLib.getDocument(pdfUrl).promise;
        if (cancelled) return;
        setPdfDoc(doc);
        onTotalPagesChange(doc.numPages);
      } catch (err) {
        console.error("PDF load error:", err);
        if (!cancelled) setError("Error al cargar el PDF");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfUrl]);

  // Render current page
  useEffect(() => {
    if (!pdfDoc || !canvasRef.current || viewMode !== "pdf") return;
    let cancelled = false;

    (async () => {
      try {
        const page = await pdfDoc.getPage(currentPage);
        if (cancelled) return;
        const viewport = page.getViewport({ scale: zoom * 1.5 });
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d")!;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport }).promise;
      } catch {
        // Page render failed silently
      }
    })();

    return () => { cancelled = true; };
  }, [pdfDoc, currentPage, zoom, viewMode]);

  // Text mode: show segment original texts with active highlighting
  if (viewMode === "text") {
    return (
      <div
        style={{
          height: "100%",
          overflowY: "auto",
          padding: "24px 28px",
          background: "#FAF7F2",
          fontSize: 13,
          lineHeight: 1.8,
          color: "#1C1917",
        }}
      >
        {segments.length === 0 ? (
          <p className="font-sans" style={{ color: "#888", textAlign: "center", marginTop: 60 }}>
            No hay segmentos cargados.
          </p>
        ) : (
          segments.map((seg) => (
            <p
              key={seg.id}
              className="font-sans"
              style={{
                marginBottom: 12,
                padding: "4px 8px",
                borderRadius: 3,
                background: seg.id === activeSegmentId ? "rgba(201,136,42,0.15)" : "transparent",
                transition: "background 0.15s",
              }}
            >
              {seg.original}
            </p>
          ))
        )}
      </div>
    );
  }

  // No PDF placeholder
  if (!pdfUrl) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#3A3A3A",
          color: "#888",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="8" y="4" width="32" height="40" rx="3" stroke="#666" strokeWidth="2" />
          <line x1="16" y1="16" x2="32" y2="16" stroke="#666" strokeWidth="1.5" />
          <line x1="16" y1="22" x2="32" y2="22" stroke="#666" strokeWidth="1.5" />
          <line x1="16" y1="28" x2="28" y2="28" stroke="#666" strokeWidth="1.5" />
        </svg>
        <span className="font-sans" style={{ fontSize: 13 }}>Sin documento PDF</span>
        <span className="font-sans" style={{ fontSize: 11, color: "#666" }}>
          Sube un PDF desde el detalle del pedido
        </span>
      </div>
    );
  }

  // PDF mode
  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#3A3A3A" }}>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: "6px 12px",
          background: "rgba(0,0,0,0.2)",
          borderRadius: 4,
          margin: "8px 12px 4px",
        }}
      >
        <button onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))} style={toolBtn}>
          −
        </button>
        <span style={toolLabel}>{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom((z) => Math.min(z + 0.25, 3))} style={toolBtn}>
          +
        </button>

        <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.1)" }} />

        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          style={{ ...toolBtn, opacity: currentPage <= 1 ? 0.3 : 1 }}
          disabled={currentPage <= 1}
        >
          ‹
        </button>
        <span style={toolLabel}>
          {currentPage} / {totalPages || "—"}
        </span>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          style={{ ...toolBtn, opacity: currentPage >= totalPages ? 0.3 : 1 }}
          disabled={currentPage >= totalPages}
        >
          ›
        </button>

        <span style={{ width: 1, height: 14, background: "rgba(255,255,255,0.1)" }} />

        <a href={pdfUrl} download style={{ ...toolBtn, textDecoration: "none" }}>
          ↓
        </a>
      </div>

      {/* Canvas area */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          display: "flex",
          justifyContent: "center",
          padding: "8px",
        }}
      >
        {loading ? (
          <div
            className="font-mono"
            style={{ color: "#888", alignSelf: "center", fontSize: 11 }}
          >
            Cargando PDF...
          </div>
        ) : error ? (
          <div
            className="font-sans"
            style={{ color: "#C44", alignSelf: "center", fontSize: 12 }}
          >
            {error}
          </div>
        ) : (
          <canvas ref={canvasRef} style={{ maxWidth: "100%", height: "auto" }} />
        )}
      </div>
    </div>
  );
}
