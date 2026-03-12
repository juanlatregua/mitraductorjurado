import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { translateSegments, isDeepLConfigured } from "@/lib/deepl";
import { z } from "zod";

const translateSchema = z.object({
  segments: z.array(z.string()).min(1).max(100),
  sourceLang: z.string().min(2),
  targetLang: z.string().min(2),
});

// POST — Traducir segmentos con DeepL
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (session.user.role !== "translator" && session.user.role !== "admin") {
    return NextResponse.json({ error: "Solo traductores" }, { status: 403 });
  }

  if (!isDeepLConfigured()) {
    return NextResponse.json(
      { error: "DeepL API no configurada", configured: false },
      { status: 503 }
    );
  }

  const body = await req.json();
  const parsed = translateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { segments, sourceLang, targetLang } = parsed.data;

  const translations = await translateSegments(segments, sourceLang, targetLang);

  return NextResponse.json({ translations });
}
