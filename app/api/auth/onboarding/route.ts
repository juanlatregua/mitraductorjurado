import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateMAEC } from "@/lib/maec-validator";
import { sendWelcomeDay0 } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { z } from "zod";

const translatorSchema = z.object({
  role: z.literal("translator"),
  name: z.string().min(2),
  maecNumber: z.string().regex(/^N\.\d{1,5}$/, "Formato: N.1234"),
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

  const rateLimited = await checkRateLimit("onboarding", session.user.id);
  if (rateLimited) return rateLimited;

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

    // Validar número MAEC contra el registro oficial
    const maecResult = await validateMAEC(data.maecNumber);
    if (!maecResult.valid) {
      return NextResponse.json(
        {
          error:
            "Número MAEC no encontrado en el registro oficial. Comprueba que el número es correcto.",
        },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      // Actualizar role y nombre del usuario
      prisma.user.update({
        where: { id: session.user.id },
        data: { role: "translator", name: data.name },
      }),
      // Crear perfil de traductor — maecVerified automático
      prisma.translatorProfile.create({
        data: {
          userId: session.user.id,
          maecNumber: data.maecNumber,
          province: data.province,
          maecVerified: true,
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

    // Send welcome email (fire-and-forget)
    sendWelcomeDay0(session.user.email!, data.name, "translator").catch(() => {});

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

    // Send welcome email (fire-and-forget)
    sendWelcomeDay0(session.user.email!, data.name, "client").catch(() => {});

    return NextResponse.json({ ok: true, redirect: "/dashboard/client" });
  }

  return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
}
