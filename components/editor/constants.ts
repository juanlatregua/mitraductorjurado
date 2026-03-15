import type { SegmentStatus } from "@/types";

export const SEGMENT_STATUS_CONFIG: Record<
  SegmentStatus,
  { dot: string; text: string; bg: string; style: "normal" | "italic"; label: string }
> = {
  confirmed: { dot: "#4A8A5A", text: "#1C1917", bg: "transparent", style: "normal", label: "confirmados" },
  suggestion: { dot: "#C9882A", text: "#2D6A4F", bg: "transparent", style: "italic", label: "sugerencia" },
  memory: { dot: "#2D8A5A", text: "#1C1917", bg: "rgba(74,138,90,0.1)", style: "normal", label: "memoria" },
  template: { dot: "#8A6A2A", text: "#1C1917", bg: "rgba(201,136,42,0.1)", style: "normal", label: "plantilla" },
  empty: { dot: "#E8E2D8", text: "#bbb", bg: "transparent", style: "normal", label: "pendientes" },
};

export const INSERT_BAR_ITEMS = [
  { label: "Sello:", value: "[Sello:]" },
  { label: "Firma y sello", value: "[Firma y sello del organismo emisor]" },
  { label: "ilegible", value: "[ilegible]" },
  { label: "en blanco", value: "[en blanco]" },
  { label: "Apostilla", value: "[Apostilla de La Haya]" },
  { label: "manuscrito:", value: "[manuscrito:]" },
  { label: "no traducir", value: "[N. del T.: texto no traducido por ser irrelevante]" },
] as const;
