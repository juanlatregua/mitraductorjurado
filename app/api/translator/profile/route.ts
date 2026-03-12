import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  maecNumber: z.string().min(3).optional(),
  bio: z.string().max(2000).optional().nullable(),
  province: z.string().optional(),
  ratePerWord: z.number().min(0).optional().nullable(),
  rateMinimum: z.number().min(0).optional().nullable(),
  languagePairs: z
    .array(z.object({ sourceLang: z.string(), targetLang: z.string() }))
    .optional(),
  specialties: z.array(z.string()).optional(),
  availabilityStatus: z.enum(["available", "busy", "vacation"]).optional(),
});

// GET — obtener perfil del traductor autenticado
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const profile = await prisma.translatorProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      languagePairs: true,
      specialties: true,
      user: { select: { name: true, email: true, image: true } },
    },
  });

  if (!profile) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  return NextResponse.json(profile);
}

// PUT — actualizar perfil
export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const profile = await prisma.translatorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  // Transacción: actualizar user + profile + language pairs + specialties
  await prisma.$transaction(async (tx) => {
    // Actualizar nombre del usuario
    if (data.name) {
      await tx.user.update({
        where: { id: session.user.id },
        data: { name: data.name },
      });
    }

    // Actualizar perfil
    await tx.translatorProfile.update({
      where: { id: profile.id },
      data: {
        ...(data.maecNumber && { maecNumber: data.maecNumber }),
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.province && { province: data.province }),
        ...(data.ratePerWord !== undefined && { ratePerWord: data.ratePerWord }),
        ...(data.rateMinimum !== undefined && { rateMinimum: data.rateMinimum }),
      },
    });

    // Reemplazar pares de idiomas si se envían
    if (data.languagePairs) {
      await tx.languagePair.deleteMany({ where: { translatorId: profile.id } });
      if (data.languagePairs.length > 0) {
        await tx.languagePair.createMany({
          data: data.languagePairs.map((lp) => ({
            translatorId: profile.id,
            sourceLang: lp.sourceLang,
            targetLang: lp.targetLang,
          })),
        });
      }
    }

    // Reemplazar especialidades si se envían
    if (data.specialties) {
      await tx.specialty.deleteMany({ where: { translatorId: profile.id } });
      if (data.specialties.length > 0) {
        await tx.specialty.createMany({
          data: data.specialties.map((cat) => ({
            translatorId: profile.id,
            category: cat as any,
          })),
        });
      }
    }
  });

  return NextResponse.json({ ok: true });
}
