import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const translatorSchema = z.object({
  role: z.literal("translator"),
  name: z.string().min(2),
  maecNumber: z.string().min(3), // ej: N.3850
  province: z.string().min(2),
  languagePairs: z
    .array(
      z.object({
        sourceLang: z.string().min(2),
        targetLang: z.string().min(2),
      })
    )
    .min(1),
  specialties: z.array(z.string()).optional(),
});

const clientSchema = z.object({
  role: z.literal("client"),
  name: z.string().min(2),
  company: z.string().optional(),
  documentType: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json();

  // Onboarding de traductor
  if (body.role === "translator") {
    const parsed = translatorSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    await prisma.$transaction([
      // Actualizar role y nombre del usuario
      prisma.user.update({
        where: { id: session.user.id },
        data: { role: "translator", name: data.name },
      }),
      // Crear perfil de traductor
      prisma.translatorProfile.create({
        data: {
          userId: session.user.id,
          maecNumber: data.maecNumber,
          province: data.province,
          languagePairs: {
            create: data.languagePairs.map((lp) => ({
              sourceLang: lp.sourceLang,
              targetLang: lp.targetLang,
            })),
          },
          ...(data.specialties?.length
            ? {
                specialties: {
                  create: data.specialties.map((cat) => ({
                    category: cat as any,
                  })),
                },
              }
            : {}),
        },
      }),
    ]);

    return NextResponse.json({ ok: true, redirect: "/dashboard/translator" });
  }

  // Onboarding de cliente
  if (body.role === "client") {
    const parsed = clientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: "client", name: data.name },
    });

    return NextResponse.json({ ok: true, redirect: "/dashboard/client" });
  }

  return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
}
