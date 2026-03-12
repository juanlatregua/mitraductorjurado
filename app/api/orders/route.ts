import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createOrderSchema = z.object({
  translatorId: z.string().min(1),
  sourceLang: z.string().min(2),
  targetLang: z.string().min(2),
  documentType: z.string().optional(),
  notes: z.string().optional(),
});

// POST — Cliente crea un pedido
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (session.user.role !== "client" && session.user.role !== "admin") {
    return NextResponse.json({ error: "Solo clientes pueden crear pedidos" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  // Verificar que el traductor existe
  const translator = await prisma.user.findFirst({
    where: { id: data.translatorId, role: "translator" },
    select: { id: true },
  });
  if (!translator) {
    return NextResponse.json({ error: "Traductor no encontrado" }, { status: 404 });
  }

  const order = await prisma.order.create({
    data: {
      clientId: session.user.id,
      translatorId: data.translatorId,
      sourceLang: data.sourceLang,
      targetLang: data.targetLang,
      documentType: data.documentType,
      notes: data.notes,
      status: "pending",
    },
  });

  return NextResponse.json({ ok: true, orderId: order.id }, { status: 201 });
}

// GET — Listar pedidos del usuario según su rol
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const pageSize = 10;

  const where: any = {};

  // Filtrar por rol
  if (session.user.role === "client") {
    where.clientId = session.user.id;
  } else if (session.user.role === "translator") {
    where.translatorId = session.user.id;
  }
  // admin ve todos

  if (status) {
    where.status = status;
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        client: { select: { name: true, email: true } },
        translator: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ]);

  return NextResponse.json({ orders, total, page, pageSize });
}
