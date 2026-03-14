import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canTransition } from "@/lib/order-status";
import { z } from "zod";
import type { OrderStatus } from "@prisma/client";
import {
  sendQuoteNotification,
  sendOrderAcceptedNotification,
  sendDeliveryNotification,
  sendOrderClosedNotification,
} from "@/lib/email";

interface Params {
  params: { id: string };
}

// GET — Detalle de un pedido
export async function GET(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      client: { select: { id: true, name: true, email: true } },
      translator: { select: { id: true, name: true, email: true } },
      assignment: true,
      payment: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  // Solo participantes o admin pueden ver el pedido
  const isParticipant =
    order.clientId === session.user.id ||
    order.translatorId === session.user.id ||
    session.user.role === "admin";

  if (!isParticipant) {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }

  return NextResponse.json(order);
}

const updateOrderSchema = z.object({
  status: z.enum([
    "pending", "quoted", "accepted", "in_progress",
    "delivered", "closed", "cancelled",
  ]).optional(),
  price: z.number().positive().optional(),
  expiresAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});

// PUT — Actualizar pedido (cambiar estado, poner precio, etc.)
export async function PUT(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = updateOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      client: { select: { name: true, email: true } },
      translator: { select: { name: true, email: true } },
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  // Verificar que el usuario es participante
  const isParticipant =
    order.clientId === session.user.id ||
    order.translatorId === session.user.id ||
    session.user.role === "admin";

  if (!isParticipant) {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }

  const data = parsed.data;
  const updateData: any = {};

  // Transición de estado
  if (data.status) {
    if (!canTransition(order.status, data.status as OrderStatus, session.user.role)) {
      return NextResponse.json(
        { error: `No puedes cambiar de ${order.status} a ${data.status}` },
        { status: 403 }
      );
    }

    // Validaciones específicas por transición
    if (data.status === "quoted") {
      if (!data.price) {
        return NextResponse.json(
          { error: "Se requiere precio para presupuestar" },
          { status: 400 }
        );
      }
      updateData.price = data.price;
      if (data.expiresAt) {
        updateData.expiresAt = new Date(data.expiresAt);
      }
    }

    updateData.status = data.status;
  }

  if (data.notes !== undefined) {
    updateData.notes = data.notes;
  }

  const updated = await prisma.order.update({
    where: { id: params.id },
    data: updateData,
  });

  // Enviar notificaciones por email según la transición
  if (data.status === "quoted" && updateData.price) {
    sendQuoteNotification(
      order.client.email!,
      order.client.name || "Cliente",
      order.id,
      order.translator.name || "Traductor",
      updateData.price
    );
  } else if (data.status === "accepted") {
    sendOrderAcceptedNotification(
      order.translator.email!,
      order.translator.name || "Traductor",
      order.id,
      order.client.name || "Cliente"
    );
  } else if (data.status === "delivered") {
    sendDeliveryNotification(
      order.client.email!,
      order.client.name || "Cliente",
      order.id,
      order.translator.name || "Traductor"
    );
  } else if (data.status === "closed") {
    sendOrderClosedNotification(
      order.client.email!,
      order.client.name || "Cliente",
      order.id,
      order.translator.name || "Traductor"
    );
  }

  return NextResponse.json(updated);
}
