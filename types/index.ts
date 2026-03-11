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

export interface TranslationSegment {
  id: string;
  index: number;
  originalText: string;
  translatedText: string;
  isEdited: boolean;
  isApproved: boolean;
}

export interface BilingualDocument {
  orderId: string;
  documentType: string | null;
  templateId: string | null;
  sourceLang: string;
  targetLang: string;
  segments: TranslationSegment[];
  status: "draft" | "reviewing" | "approved";
}

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
