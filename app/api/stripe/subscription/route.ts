import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  isStripeConfigured,
  getOrCreateCustomer,
  createSubscription,
  cancelSubscription,
} from "@/lib/stripe";
import { z } from "zod";

// GET — obtener estado de suscripción del traductor
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const profile = await prisma.translatorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "No es traductor" }, { status: 403 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { translatorId: profile.id },
  });

  if (!subscription) {
    return NextResponse.json({ subscription: null });
  }

  return NextResponse.json({
    subscription: {
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
      cancelledAt: subscription.cancelledAt,
    },
  });
}

// POST — crear suscripción al plan fundador
export async function POST(req: NextRequest) {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe no configurado" }, { status: 503 });
  }

  const priceId = process.env.STRIPE_PRICE_ID_MONTHLY;
  if (!priceId) {
    return NextResponse.json({ error: "Price ID no configurado" }, { status: 503 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { translatorProfile: true },
  });

  if (!user || user.role !== "translator" || !user.translatorProfile) {
    return NextResponse.json({ error: "No es traductor" }, { status: 403 });
  }

  // Comprobar si ya tiene suscripción activa
  const existing = await prisma.subscription.findUnique({
    where: { translatorId: user.translatorProfile.id },
  });

  if (existing && existing.status === "active") {
    return NextResponse.json({ error: "Ya tienes suscripción activa" }, { status: 400 });
  }

  // Obtener o crear Stripe Customer
  const customerId = await getOrCreateCustomer(
    user.email!,
    user.name || "Traductor",
    user.translatorProfile.stripeCustomerId
  );

  // Guardar customerId si es nuevo
  if (!user.translatorProfile.stripeCustomerId) {
    await prisma.translatorProfile.update({
      where: { id: user.translatorProfile.id },
      data: { stripeCustomerId: customerId },
    });
  }

  // Crear suscripción en Stripe
  const result = await createSubscription({
    customerId,
    priceId,
  });

  // Guardar en BD (status será "incomplete" hasta que se pague)
  await prisma.subscription.upsert({
    where: { translatorId: user.translatorProfile.id },
    create: {
      translatorId: user.translatorProfile.id,
      stripeSubscriptionId: result.subscriptionId,
      stripeCustomerId: customerId,
      priceId,
      status: result.status,
      currentPeriodEnd: new Date(), // se actualiza por webhook
    },
    update: {
      stripeSubscriptionId: result.subscriptionId,
      stripeCustomerId: customerId,
      status: result.status,
    },
  });

  return NextResponse.json({
    subscriptionId: result.subscriptionId,
    clientSecret: result.clientSecret,
    status: result.status,
  }, { status: 201 });
}

// DELETE — cancelar suscripción (al final del período)
export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const profile = await prisma.translatorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "No es traductor" }, { status: 403 });
  }

  const subscription = await prisma.subscription.findUnique({
    where: { translatorId: profile.id },
  });

  if (!subscription || subscription.status !== "active") {
    return NextResponse.json({ error: "No hay suscripción activa" }, { status: 400 });
  }

  const result = await cancelSubscription(subscription.stripeSubscriptionId);

  await prisma.subscription.update({
    where: { translatorId: profile.id },
    data: {
      status: result.status,
      cancelledAt: result.cancelAt,
    },
  });

  return NextResponse.json({
    status: result.status,
    cancelAt: result.cancelAt,
  });
}
