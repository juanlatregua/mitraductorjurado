import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

interface Params {
  params: { translatorId: string };
}

const leadSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
  documentType: z.string().optional(),
  message: z.string().max(2000).optional(),
});

// GET — Info pública del traductor para el widget
export async function GET(req: NextRequest, { params }: Params) {
  const profile = await prisma.translatorProfile.findUnique({
    where: { userId: params.translatorId },
    select: {
      userId: true,
      maecNumber: true,
      verified: true,
      availabilityStatus: true,
      user: { select: { name: true } },
      languagePairs: { select: { sourceLang: true, targetLang: true } },
    },
  });

  if (!profile) {
    return NextResponse.json({ error: "Traductor no encontrado" }, { status: 404 });
  }

  // CORS headers para permitir embeber desde cualquier dominio
  return NextResponse.json(
    {
      translator: {
        id: profile.userId,
        name: profile.user.name,
        maecNumber: profile.maecNumber,
        verified: profile.verified,
        available: profile.availabilityStatus === "available",
        languagePairs: profile.languagePairs,
      },
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    }
  );
}

// POST — Crear lead desde el widget
export async function POST(req: NextRequest, { params }: Params) {
  const origin = req.headers.get("origin") || req.headers.get("referer") || "unknown";
  const sourceDomain = new URL(origin).hostname || origin;

  let body;
  try {
    body = await req.json();
  } catch {
    return corsResponse({ error: "JSON inválido" }, 400);
  }

  const result = leadSchema.safeParse(body);
  if (!result.success) {
    return corsResponse(
      { error: result.error.issues[0].message },
      400
    );
  }

  // Verificar que el traductor existe
  const profile = await prisma.translatorProfile.findUnique({
    where: { userId: params.translatorId },
    select: { userId: true },
  });

  if (!profile) {
    return corsResponse({ error: "Traductor no encontrado" }, 404);
  }

  const lead = await prisma.widgetLead.create({
    data: {
      translatorId: params.translatorId,
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone || null,
      documentType: result.data.documentType || null,
      message: result.data.message || null,
      sourceDomain,
    },
  });

  return corsResponse({ ok: true, leadId: lead.id }, 201);
}

// OPTIONS — Preflight CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}

function corsResponse(data: unknown, status: number) {
  return NextResponse.json(data, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
