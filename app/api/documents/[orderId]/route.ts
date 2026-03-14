import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

interface Params {
  params: { orderId: string };
}

const segmentSchema = z.object({
  id: z.string(),
  index: z.number(),
  originalText: z.string(),
  translatedText: z.string(),
  isEdited: z.boolean(),
  isApproved: z.boolean(),
});

const documentSchema = z.object({
  segments: z.array(segmentSchema),
  status: z.enum(["draft", "reviewing", "approved"]),
});

// GET — Cargar documento de traducción
export async function GET(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    select: {
      translatorId: true,
      clientId: true,
      sourceLang: true,
      targetLang: true,
      documentType: true,
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

  // Cargar desde el campo translationData
  if (order.translationData) {
    try {
      const data = JSON.parse(order.translationData);
      return NextResponse.json({
        orderId: params.orderId,
        sourceLang: order.sourceLang,
        targetLang: order.targetLang,
        documentType: order.documentType,
        ...data,
      });
    } catch {
      // JSON corrupted — devolver vacío
    }
  }

  return NextResponse.json({
    orderId: params.orderId,
    sourceLang: order.sourceLang,
    targetLang: order.targetLang,
    documentType: order.documentType,
    segments: [],
    status: "draft",
  });
}

// PUT — Guardar documento de traducción
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
    select: { translatorId: true },
  });

  if (!order || (order.translatorId !== session.user.id && session.user.role !== "admin")) {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = documentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Guardar en el campo translationData del Order
  await prisma.order.update({
    where: { id: params.orderId },
    data: { translationData: JSON.stringify(parsed.data) },
  });

  return NextResponse.json({ ok: true });
}
