import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createReviewSchema = z.object({
  orderId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

// POST — Crear review (solo el cliente del pedido)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const parsed = createReviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { orderId, rating, comment } = parsed.data;

  // Verify order exists and user is the client
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    select: {
      id: true,
      clientId: true,
      translatorId: true,
      status: true,
      review: { select: { id: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  if (order.clientId !== session.user.id && session.user.role !== "admin") {
    return NextResponse.json({ error: "Solo el cliente puede dejar review" }, { status: 403 });
  }

  if (order.status !== "delivered" && order.status !== "closed") {
    return NextResponse.json(
      { error: "Solo puedes valorar pedidos entregados o cerrados" },
      { status: 400 },
    );
  }

  if (order.review) {
    return NextResponse.json({ error: "Ya existe una review para este pedido" }, { status: 409 });
  }

  // Create review and recalculate avgRating in a transaction
  const review = await prisma.$transaction(async (tx) => {
    const newReview = await tx.review.create({
      data: {
        orderId,
        clientId: session.user.id,
        translatorId: order.translatorId,
        rating,
        comment: comment || null,
      },
    });

    // Recalculate translator's avgRating and reviewCount
    const agg = await tx.review.aggregate({
      where: { translatorId: order.translatorId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const translatorProfile = await tx.translatorProfile.findFirst({
      where: { userId: order.translatorId },
      select: { id: true },
    });

    if (translatorProfile) {
      await tx.translatorProfile.update({
        where: { id: translatorProfile.id },
        data: {
          avgRating: agg._avg.rating || 0,
          reviewCount: agg._count.rating,
        },
      });
    }

    return newReview;
  });

  return NextResponse.json({ review }, { status: 201 });
}
