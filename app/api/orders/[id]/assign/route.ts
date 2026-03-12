import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

interface Params {
  params: { id: string };
}

const assignSchema = z.object({
  assignedToId: z.string().min(1),
  agreedPrice: z.number().positive(),
  brokerMargin: z.number().min(0),
});

// POST — Derivar pedido a un colega
export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }
  if (session.user.role !== "translator" && session.user.role !== "admin") {
    return NextResponse.json({ error: "Solo traductores" }, { status: 403 });
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { assignment: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  if (order.translatorId !== session.user.id && session.user.role !== "admin") {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }

  if (order.assignment) {
    return NextResponse.json({ error: "Este pedido ya tiene un colega asignado" }, { status: 409 });
  }

  if (!["pending", "quoted", "accepted"].includes(order.status)) {
    return NextResponse.json(
      { error: "Solo se puede derivar en estados: pendiente, presupuestado o aceptado" },
      { status: 400 }
    );
  }

  const body = await req.json();
  const parsed = assignSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { assignedToId, agreedPrice, brokerMargin } = parsed.data;

  // Verificar que el colega existe y es traductor
  const colleague = await prisma.user.findFirst({
    where: { id: assignedToId, role: "translator" },
  });
  if (!colleague) {
    return NextResponse.json({ error: "Colega no encontrado" }, { status: 404 });
  }

  // No derivar a uno mismo
  if (assignedToId === session.user.id) {
    return NextResponse.json({ error: "No puedes derivar a ti mismo" }, { status: 400 });
  }

  const assignment = await prisma.orderAssignment.create({
    data: {
      orderId: params.id,
      assignedToId,
      agreedPrice,
      brokerMargin,
    },
  });

  return NextResponse.json({ ok: true, assignment }, { status: 201 });
}

// DELETE — Quitar asignación de colega
export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: { assignment: true },
  });

  if (!order || !order.assignment) {
    return NextResponse.json({ error: "No hay asignación" }, { status: 404 });
  }

  if (order.translatorId !== session.user.id && session.user.role !== "admin") {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }

  // Solo si el colega no ha aceptado aún
  if (order.assignment.acceptedAt) {
    return NextResponse.json({ error: "El colega ya aceptó. No se puede quitar." }, { status: 400 });
  }

  await prisma.orderAssignment.delete({
    where: { id: order.assignment.id },
  });

  return NextResponse.json({ ok: true });
}
