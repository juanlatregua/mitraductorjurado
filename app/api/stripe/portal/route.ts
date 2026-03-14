import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isStripeConfigured, getCustomerPortalLink } from "@/lib/stripe";

// POST — generar enlace al Customer Portal de Stripe
export async function POST() {
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe no configurado" }, { status: 503 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const profile = await prisma.translatorProfile.findUnique({
    where: { userId: session.user.id },
    select: { stripeCustomerId: true },
  });

  if (!profile?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No hay cuenta de facturación" },
      { status: 400 }
    );
  }

  const url = await getCustomerPortalLink(profile.stripeCustomerId);
  return NextResponse.json({ url });
}
