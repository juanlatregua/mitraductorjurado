import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPaymentIntent, isStripeConfigured } from "@/lib/stripe";
import { calculateVAT } from "@/lib/verifactu";
import { z } from "zod";

const checkoutSchema = z.object({
  orderId: z.string().min(1),
});

// POST — Crear PaymentIntent para pagar un pedido
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe no configurado" },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const result = checkoutSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: result.data.orderId },
    include: {
      translator: {
        select: {
          translatorProfile: {
            select: { stripeAccountId: true, stripeOnboarded: true },
          },
        },
      },
      payment: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  if (order.clientId !== session.user.id) {
    return NextResponse.json({ error: "No es tu pedido" }, { status: 403 });
  }

  if (order.status !== "accepted") {
    return NextResponse.json(
      { error: "El pedido debe estar aceptado para pagar" },
      { status: 400 }
    );
  }

  if (!order.price) {
    return NextResponse.json({ error: "Pedido sin precio" }, { status: 400 });
  }

  if (order.payment) {
    return NextResponse.json(
      { error: "Ya existe un pago para este pedido" },
      { status: 409 }
    );
  }

  const stripeAccountId =
    order.translator.translatorProfile?.stripeAccountId;
  if (!stripeAccountId || !order.translator.translatorProfile?.stripeOnboarded) {
    return NextResponse.json(
      { error: "El traductor no ha completado su verificación de pagos" },
      { status: 400 }
    );
  }

  // Cobrar el total con IVA (order.price es base imponible)
  const { totalAmount } = calculateVAT(order.price);

  const pi = await createPaymentIntent({
    amount: totalAmount,
    translatorStripeAccountId: stripeAccountId,
    orderId: order.id,
    customerEmail: session.user.email!,
  });

  // Crear Payment en estado pending (amount = total cobrado con IVA)
  await prisma.payment.create({
    data: {
      orderId: order.id,
      stripePaymentIntentId: pi.paymentIntentId,
      amount: totalAmount,
      platformFee: pi.platformFee,
      translatorAmount: pi.translatorAmount,
      status: "pending",
    },
  });

  return NextResponse.json({
    clientSecret: pi.clientSecret,
    paymentIntentId: pi.paymentIntentId,
    amount: totalAmount,
    platformFee: pi.platformFee,
    translatorAmount: pi.translatorAmount,
  });
}
