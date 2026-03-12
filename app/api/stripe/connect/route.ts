import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createConnectAccount,
  getOnboardingLink,
  checkAccountStatus,
  getStripeDashboardLink,
  isStripeConfigured,
} from "@/lib/stripe";

// GET — Estado de la cuenta Stripe Connect del traductor
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (session.user.role !== "translator" && session.user.role !== "admin") {
    return NextResponse.json({ error: "Solo traductores" }, { status: 403 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json({
      configured: false,
      status: "not_configured",
      message: "Stripe no configurado",
    });
  }

  const profile = await prisma.translatorProfile.findUnique({
    where: { userId: session.user.id },
    select: { stripeAccountId: true, stripeOnboarded: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  if (!profile.stripeAccountId) {
    return NextResponse.json({
      configured: true,
      status: "no_account",
      message: "No has conectado Stripe todavía",
    });
  }

  const accountStatus = await checkAccountStatus(profile.stripeAccountId);

  // Actualizar stripeOnboarded si cambió
  if (accountStatus.ready !== profile.stripeOnboarded) {
    await prisma.translatorProfile.update({
      where: { userId: session.user.id },
      data: { stripeOnboarded: accountStatus.ready },
    });
  }

  let dashboardUrl: string | null = null;
  if (accountStatus.ready) {
    dashboardUrl = await getStripeDashboardLink(profile.stripeAccountId);
  }

  return NextResponse.json({
    configured: true,
    status: accountStatus.ready ? "active" : "pending",
    message: accountStatus.details,
    stripeOnboarded: accountStatus.ready,
    dashboardUrl,
  });
}

// POST — Crear o continuar onboarding Stripe Connect
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (session.user.role !== "translator" && session.user.role !== "admin") {
    return NextResponse.json({ error: "Solo traductores" }, { status: 403 });
  }

  if (!isStripeConfigured()) {
    return NextResponse.json(
      { error: "Stripe no configurado en el servidor" },
      { status: 503 }
    );
  }

  const profile = await prisma.translatorProfile.findUnique({
    where: { userId: session.user.id },
    select: { stripeAccountId: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  // Si ya tiene cuenta, generar nuevo enlace de onboarding
  if (profile.stripeAccountId) {
    const url = await getOnboardingLink(profile.stripeAccountId);
    return NextResponse.json({ onboardingUrl: url });
  }

  // Crear nueva cuenta Express
  const { accountId, onboardingUrl } = await createConnectAccount(
    session.user.email!,
    session.user.name || "Traductor"
  );

  await prisma.translatorProfile.update({
    where: { userId: session.user.id },
    data: { stripeAccountId: accountId },
  });

  return NextResponse.json({ onboardingUrl }, { status: 201 });
}
