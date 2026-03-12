import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Params {
  params: { id: string };
}

// GET — Obtener plantilla por ID
export async function GET(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const template = await prisma.documentTemplate.findUnique({
    where: { id: params.id },
  });

  if (!template || !template.active) {
    return NextResponse.json({ error: "Plantilla no encontrada" }, { status: 404 });
  }

  return NextResponse.json({ template });
}

// PUT — Actualizar plantilla (solo admin)
export async function PUT(req: NextRequest, { params }: Params) {
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

  const template = await prisma.documentTemplate.update({
    where: { id: params.id },
    data: body,
  });

  return NextResponse.json({ template });
}

// DELETE — Desactivar plantilla (soft delete)
export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
  }

  await prisma.documentTemplate.update({
    where: { id: params.id },
    data: { active: false },
  });

  return NextResponse.json({ ok: true });
}
