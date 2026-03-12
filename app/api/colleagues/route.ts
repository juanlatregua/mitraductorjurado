import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET — Buscar colegas disponibles por idioma
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (session.user.role !== "translator" && session.user.role !== "admin") {
    return NextResponse.json({ error: "Solo traductores" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const sourceLang = searchParams.get("sourceLang");
  const targetLang = searchParams.get("targetLang");

  const where: any = {
    userId: { not: session.user.id }, // Excluir al propio traductor
    availabilityStatus: "available",
    user: { name: { not: null } },
  };

  if (sourceLang) {
    where.languagePairs = {
      some: {
        sourceLang,
        ...(targetLang ? { targetLang } : {}),
      },
    };
  }

  const colleagues = await prisma.translatorProfile.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true } },
      languagePairs: { select: { sourceLang: true, targetLang: true } },
    },
    orderBy: [{ verified: "desc" }, { avgRating: "desc" }],
    take: 20,
  });

  return NextResponse.json({
    colleagues: colleagues.map((c) => ({
      userId: c.user.id,
      name: c.user.name,
      email: c.user.email,
      maecNumber: c.maecNumber,
      verified: c.verified,
      province: c.province,
      photoUrl: c.photoUrl,
      ratePerWord: c.ratePerWord,
      rateMinimum: c.rateMinimum,
      avgRating: c.avgRating,
      availabilityStatus: c.availabilityStatus,
      languagePairs: c.languagePairs,
    })),
  });
}
