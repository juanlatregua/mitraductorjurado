import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

interface Params {
  params: { orderId: string };
}

const glossarySchema = z.object({
  source: z.string().min(1).max(500),
  target: z.string().min(1).max(500),
  languagePair: z.string().min(2).max(10),
});

// POST — Upsert glossary entry with usageCount increment
export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (session.user.role !== "translator" && session.user.role !== "admin") {
    return NextResponse.json({ error: "Solo traductores" }, { status: 403 });
  }

  // Verify order belongs to translator
  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    select: { translatorId: true },
  });

  if (!order || (order.translatorId !== session.user.id && session.user.role !== "admin")) {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = glossarySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { source, target, languagePair } = parsed.data;

  const entry = await prisma.glossaryEntry.upsert({
    where: {
      translatorId_source_languagePair: {
        translatorId: session.user.id,
        source,
        languagePair,
      },
    },
    update: {
      target,
      usageCount: { increment: 1 },
    },
    create: {
      translatorId: session.user.id,
      source,
      target,
      languagePair,
      usageCount: 1,
    },
  });

  return NextResponse.json({ ok: true, id: entry.id });
}
