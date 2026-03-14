import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendWelcomeDay3, sendWelcomeDay7, sendAbandonedSignupEmail } from "@/lib/email";

// Vercel Cron — runs daily, sends day-3, day-7 welcome emails + abandoned signup recovery
// Configure in vercel.json: { "crons": [{ "path": "/api/cron/welcome-emails", "schedule": "0 9 * * *" }] }
export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  // Abandoned signup: translators created ~24h ago (±6h window) without TranslatorProfile
  const abandonedStart = new Date(now.getTime() - 30 * 60 * 60 * 1000); // 30h ago
  const abandonedEnd = new Date(now.getTime() - 18 * 60 * 60 * 1000);   // 18h ago

  // Day 3: users created 3 days ago (±12h window)
  const day3Start = new Date(now.getTime() - 3.5 * 24 * 60 * 60 * 1000);
  const day3End = new Date(now.getTime() - 2.5 * 24 * 60 * 60 * 1000);

  // Day 7: translators created 7 days ago without subscription
  const day7Start = new Date(now.getTime() - 7.5 * 24 * 60 * 60 * 1000);
  const day7End = new Date(now.getTime() - 6.5 * 24 * 60 * 60 * 1000);

  let abandonedSent = 0;
  let day3Sent = 0;
  let day7Sent = 0;

  try {
    // Abandoned signup: translators who registered ~24h ago but never completed onboarding
    const abandonedUsers = await prisma.user.findMany({
      where: {
        role: "translator",
        createdAt: { gte: abandonedStart, lte: abandonedEnd },
        translatorProfile: null,
      },
      select: { email: true, name: true },
    });

    for (const user of abandonedUsers) {
      await sendAbandonedSignupEmail(user.email, user.name || "Traductor");
      abandonedSent++;
    }

    // Day 3: translators who registered 3 days ago
    const day3Users = await prisma.user.findMany({
      where: {
        role: "translator",
        createdAt: { gte: day3Start, lte: day3End },
        translatorProfile: { isNot: null },
      },
      select: { email: true, name: true },
    });

    for (const user of day3Users) {
      await sendWelcomeDay3(user.email, user.name || "Traductor");
      day3Sent++;
    }

    // Day 7: translators who registered 7 days ago without active subscription
    const day7Users = await prisma.user.findMany({
      where: {
        role: "translator",
        createdAt: { gte: day7Start, lte: day7End },
        translatorProfile: { isNot: null },
      },
      select: {
        email: true,
        name: true,
        translatorProfile: {
          select: { id: true },
        },
      },
    });

    for (const user of day7Users) {
      if (!user.translatorProfile) continue;
      // Check if already subscribed
      const sub = await prisma.subscription.findUnique({
        where: { translatorId: user.translatorProfile.id },
        select: { status: true },
      });
      if (!sub || sub.status !== "active") {
        await sendWelcomeDay7(user.email, user.name || "Traductor");
        day7Sent++;
      }
    }
  } catch (err) {
    console.error("[Cron] Welcome emails error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, abandonedSent, day3Sent, day7Sent });
}
