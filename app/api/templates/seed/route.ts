import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TEMPLATE_SEEDS } from "@/lib/template-seeds";

// POST — Cargar plantillas predefinidas (solo admin)
export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Solo administradores" }, { status: 403 });
  }

  const existing = await prisma.documentTemplate.count();
  if (existing > 0) {
    return NextResponse.json(
      { error: "Ya existen plantillas. Elimínalas primero si quieres recargar." },
      { status: 409 }
    );
  }

  const created = await prisma.$transaction(
    TEMPLATE_SEEDS.map((seed) =>
      prisma.documentTemplate.create({
        data: {
          ...seed,
          createdBy: session.user.id,
        },
      })
    )
  );

  return NextResponse.json(
    { message: `${created.length} plantillas creadas`, count: created.length },
    { status: 201 }
  );
}
