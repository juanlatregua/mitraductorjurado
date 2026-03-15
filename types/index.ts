// types/index.ts
import { Role, OrderStatus, DocumentCategory } from "@prisma/client";

// ─── AUTH ─────────────────────────────────────────────────────────────────────

declare module "next-auth" {
  interface User {
    role: Role;
  }
  interface Session {
    user: {
      id: string;
      role: Role;
      email: string;
      name?: string | null;
      image?: string | null;
      onboarded: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: Role;
    id: string;
    onboarded: boolean;
  }
}

// ─── EDITOR BILINGÜE ──────────────────────────────────────────────────────────

/** @deprecated Use EditorSegment instead */
export interface TranslationSegment {
  id: string;
  index: number;
  originalText: string;
  translatedText: string;
  isEdited: boolean;
  isApproved: boolean;
}

/** @deprecated Use EditorState instead */
export interface BilingualDocument {
  orderId: string;
  documentType: string | null;
  templateId: string | null;
  sourceLang: string;
  targetLang: string;
  segments: TranslationSegment[];
  status: "draft" | "reviewing" | "approved";
}

// ─── S16a: EDITOR SEGMENT MODEL ─────────────────────────────────────────────

export type SegmentStatus = "confirmed" | "suggestion" | "memory" | "template" | "empty";
export type SegmentSource = "deepl" | "memory" | "template" | "manual" | "claude";

export interface EditorSegment {
  id: string;
  index: number;
  original: string;
  translation: string;
  status: SegmentStatus;
  source: SegmentSource;
  memoryScore?: number | null;
}

export interface EditorState {
  segments: EditorSegment[];
  docStatus: "draft" | "reviewing" | "approved";
}

export const SEGMENT_STATUS_COLORS: Record<SegmentStatus, { dot: string; text: string; bg: string; style: "normal" | "italic" }> = {
  confirmed: { dot: "#4A8A5A", text: "#1C1917", bg: "transparent", style: "normal" },
  suggestion: { dot: "#C9882A", text: "#2D6A4F", bg: "transparent", style: "italic" },
  memory: { dot: "#2D8A5A", text: "#1C1917", bg: "rgba(74,138,90,0.1)", style: "normal" },
  template: { dot: "#8A6A2A", text: "#1C1917", bg: "rgba(201,136,42,0.1)", style: "normal" },
  empty: { dot: "#E8E2D8", text: "#bbb", bg: "transparent", style: "normal" },
};

// ─── PLANTILLAS ───────────────────────────────────────────────────────────────

export interface TemplateVariable {
  key: string;
  label: string;
  type: "text" | "date" | "number" | "select";
  options?: string[];
  required: boolean;
}

export interface TemplateStructure {
  fixedFields: { key: string; value: string }[];
  variables: TemplateVariable[];
}

// ─── DISPONIBILIDAD ───────────────────────────────────────────────────────────

export interface AvailabilitySlot {
  day: "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
  from: string; // "09:00"
  to: string;   // "14:00"
}

// ─── DERIVACIÓN ───────────────────────────────────────────────────────────────

export interface ColleagueAvailability {
  translatorId: string;
  name: string;
  maecNumber: string;
  photoUrl: string | null;
  languagePairs: { sourceLang: string; targetLang: string }[];
  rateMinimum: number | null;
  ratePerWord: number | null;
  availableThisWeek: boolean;
  slots: AvailabilitySlot[];
}

// ─── DASHBOARD KPIs ───────────────────────────────────────────────────────────

export interface TranslatorDashboardKPIs {
  newOrders: number;
  pendingDelivery: number;
  earnedThisMonth: number;
  activeColleagues: number;
}

export interface AdminDashboardKPIs {
  mrr: number;
  activeTranslators: number;
  activeOrders: number;
  churnRate: number;
  phase2Gate: {
    current: number;
    target: number; // 50 traductores, 2000€ MRR
    reached: boolean;
  };
}
