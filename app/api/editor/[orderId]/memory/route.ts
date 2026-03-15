import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getMemoryStats } from "@/lib/translation-memory";

interface Params {
  params: { orderId: string };
}

// GET — Translation memory stats + matches for this order's segments
export async function GET(_req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    select: {
      translatorId: true,
      sourceLang: true,
      targetLang: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  if (order.translatorId !== session.user.id && session.user.role !== "admin") {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }

  // Load current order's segments
  const segments = await prisma.segment.findMany({
    where: { orderId: params.orderId },
    orderBy: { index: "asc" },
    select: { original: true, index: true },
  });

  if (segments.length === 0) {
    return NextResponse.json({
      identicalCount: 0,
      similarCount: 0,
      glossaryCount: 0,
      matches: [],
    });
  }

  const texts = segments.map((s) => s.original);
  const languagePair = `${order.sourceLang}-${order.targetLang}`;

  try {
    const stats = await getMemoryStats(
      order.translatorId,
      params.orderId,
      texts,
      languagePair,
    );

    return NextResponse.json(stats);
  } catch (err) {
    // pg_trgm might not be enabled — return zeros gracefully
    console.error("Translation memory error:", err);
    return NextResponse.json({
      identicalCount: 0,
      similarCount: 0,
      glossaryCount: 0,
      matches: [],
    });
  }
}
