import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import type { EditorSegment } from "@/types";

interface Params {
  params: { orderId: string };
}

const segmentSchema = z.object({
  id: z.string(),
  index: z.number().int().min(0),
  original: z.string(),
  translation: z.string(),
  status: z.enum(["confirmed", "suggestion", "memory", "template", "empty"]),
  source: z.enum(["deepl", "memory", "template", "manual", "claude"]),
  memoryScore: z.number().nullable().optional(),
});

const putSchema = z.object({
  segments: z.array(segmentSchema),
  docStatus: z.enum(["draft", "reviewing", "approved"]).optional(),
});

// GET — Load segments from Segment table, fallback to translationData JSON
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    select: {
      translatorId: true,
      clientId: true,
      translationData: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  const isParticipant =
    order.translatorId === session.user.id ||
    order.clientId === session.user.id ||
    session.user.role === "admin";

  if (!isParticipant) {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }

  // Try Segment table first
  const dbSegments = await prisma.segment.findMany({
    where: { orderId: params.orderId },
    orderBy: { index: "asc" },
  });

  if (dbSegments.length > 0) {
    const segments: EditorSegment[] = dbSegments.map((s) => ({
      id: s.id,
      index: s.index,
      original: s.original,
      translation: s.translation || "",
      status: s.status as EditorSegment["status"],
      source: s.source as EditorSegment["source"],
      memoryScore: s.memoryScore,
    }));
    return NextResponse.json({ segments });
  }

  // Fallback: parse translationData JSON (legacy)
  if (order.translationData) {
    try {
      const data = JSON.parse(order.translationData);
      const legacySegs = data.segments || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const segments: EditorSegment[] = legacySegs.map((s: any) => ({
        id: s.id,
        index: s.index,
        original: s.originalText || s.original || "",
        translation: s.translatedText || s.translation || "",
        status: s.isApproved
          ? "confirmed"
          : (s.translatedText || s.translation)
            ? "suggestion"
            : "empty",
        source: s.isEdited ? "manual" : (s.translatedText || s.translation) ? "deepl" : "manual",
        memoryScore: null,
      }));
      return NextResponse.json({ segments });
    } catch {
      // Corrupted JSON
    }
  }

  return NextResponse.json({ segments: [] });
}

// PUT — Upsert segments + dual-write to translationData JSON
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (session.user.role !== "translator" && session.user.role !== "admin") {
    return NextResponse.json({ error: "Solo traductores" }, { status: 403 });
  }

  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    select: { translatorId: true, tenantId: true },
  });

  if (!order || (order.translatorId !== session.user.id && session.user.role !== "admin")) {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = putSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { segments, docStatus } = parsed.data;

  await prisma.$transaction(async (tx) => {
    // Delete existing segments and recreate (simpler than individual upserts)
    await tx.segment.deleteMany({ where: { orderId: params.orderId } });

    if (segments.length > 0) {
      await tx.segment.createMany({
        data: segments.map((seg) => ({
          id: seg.id,
          tenantId: order.tenantId,
          orderId: params.orderId,
          index: seg.index,
          original: seg.original,
          translation: seg.translation || null,
          status: seg.status,
          source: seg.source,
          memoryScore: seg.memoryScore ?? null,
        })),
      });
    }

    // Dual-write to translationData JSON for backwards compat
    const legacyData = {
      segments: segments.map((seg) => ({
        id: seg.id,
        index: seg.index,
        originalText: seg.original,
        translatedText: seg.translation,
        isEdited: seg.source === "manual",
        isApproved: seg.status === "confirmed",
      })),
      status: docStatus || "draft",
    };

    await tx.order.update({
      where: { id: params.orderId },
      data: { translationData: JSON.stringify(legacyData) },
    });
  });

  return NextResponse.json({ ok: true });
}
