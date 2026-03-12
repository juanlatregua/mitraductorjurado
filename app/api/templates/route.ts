import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// GET — Listar plantillas (público para traductores, filtrable)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const language = searchParams.get("language");

  const where: Record<string, unknown> = { active: true };
  if (category) where.category = category;
  if (language) where.language = language;

  const templates = await prisma.documentTemplate.findMany({
    where,
    orderBy: [{ category: "asc" }, { language: "asc" }, { label: "asc" }],
    select: {
      id: true,
      category: true,
      type: true,
      language: true,
      label: true,
      structure: true,
      exampleAnon: true,
    },
  });

  return NextResponse.json({ templates });
}

const createSchema = z.object({
  category: z.enum(["academico", "notarial", "administrativo", "economico", "juridico"]),
  type: z.string().min(2),
  language: z.string().length(2),
  label: z.string().min(3),
  structure: z.object({
    fixedFields: z.array(z.object({
      key: z.string(),
      label: z.string(),
      type: z.enum(["text", "date", "select"]).default("text"),
      options: z.array(z.string()).optional(),
    })),
    variables: z.array(z.object({
      key: z.string(),
      label: z.string(),
      placeholder: z.string().optional(),
    })),
  }),
  exampleAnon: z.string().optional(),
});

// POST — Crear plantilla (solo admin)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const result = createSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json(
      { error: result.error.issues[0].message },
      { status: 400 }
    );
  }

  const template = await prisma.documentTemplate.create({
    data: {
      ...result.data,
      createdBy: session.user.id,
    },
  });

  return NextResponse.json({ template }, { status: 201 });
}
