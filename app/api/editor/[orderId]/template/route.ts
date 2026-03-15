import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Params {
  params: { orderId: string };
}

// GET — Detect matching DocumentTemplate by type + language
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    select: {
      translatorId: true,
      documentType: true,
      sourceLang: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  if (order.translatorId !== session.user.id && session.user.role !== "admin") {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }

  // No document type detected — no template match
  if (!order.documentType) {
    return NextResponse.json({ template: null });
  }

  const template = await prisma.documentTemplate.findFirst({
    where: {
      type: order.documentType,
      language: order.sourceLang,
      active: true,
    },
    select: {
      id: true,
      label: true,
      type: true,
      language: true,
      category: true,
    },
  });

  return NextResponse.json({ template: template || null });
}
