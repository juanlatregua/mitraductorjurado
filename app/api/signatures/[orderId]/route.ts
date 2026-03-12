import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createSignatureRequest,
  getSignatureStatus,
  isSignaturitConfigured,
} from "@/lib/signaturit";

interface Params {
  params: { orderId: string };
}

// GET — Estado de la firma de un pedido
export async function GET(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    select: { clientId: true, translatorId: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  const isParticipant =
    order.clientId === session.user.id ||
    order.translatorId === session.user.id ||
    session.user.role === "admin";

  if (!isParticipant) {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }

  const signature = await prisma.signature.findUnique({
    where: { orderId: params.orderId },
  });

  if (!signature) {
    return NextResponse.json({ signature: null, configured: isSignaturitConfigured() });
  }

  // Si tiene signaturitId, consultar estado actual en Signaturit
  if (signature.signaturitId && isSignaturitConfigured()) {
    const remote = await getSignatureStatus(signature.signaturitId);
    if (remote && remote.status !== signature.status) {
      // Actualizar estado local
      await prisma.signature.update({
        where: { id: signature.id },
        data: { status: remote.status as any },
      });
    }
  }

  return NextResponse.json({ signature, configured: isSignaturitConfigured() });
}

// POST — Solicitar firma electrónica para un pedido
export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  if (session.user.role !== "translator" && session.user.role !== "admin") {
    return NextResponse.json({ error: "Solo traductores" }, { status: 403 });
  }

  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: {
      translator: { select: { name: true, email: true } },
      signature: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  if (order.translatorId !== session.user.id && session.user.role !== "admin") {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }

  if (order.signature) {
    return NextResponse.json({ error: "Ya existe una solicitud de firma" }, { status: 409 });
  }

  if (!["in_progress", "delivered"].includes(order.status)) {
    return NextResponse.json(
      { error: "El pedido debe estar en curso o entregado para firmar" },
      { status: 400 }
    );
  }

  // Obtener URL del documento traducido (desde Blob)
  const body = await req.json().catch(() => ({}));
  const documentUrl = body.documentUrl || order.translatedFileUrl;

  if (!isSignaturitConfigured()) {
    // Modo sin Signaturit: crear registro local como placeholder
    const signature = await prisma.signature.create({
      data: {
        orderId: params.orderId,
        status: "pending",
      },
    });

    return NextResponse.json({
      signature,
      warning: "Signaturit no configurado. Firma registrada localmente.",
    });
  }

  if (!documentUrl) {
    return NextResponse.json(
      { error: "No hay documento para firmar. Sube el PDF traducido primero." },
      { status: 400 }
    );
  }

  // Crear solicitud en Signaturit
  const result = await createSignatureRequest({
    signerId: session.user.id,
    signerEmail: order.translator.email,
    signerName: order.translator.name || "Traductor Jurado",
    documentUrl,
    orderId: params.orderId,
  });

  if (!result) {
    return NextResponse.json({ error: "Error al crear solicitud en Signaturit" }, { status: 502 });
  }

  const signature = await prisma.signature.create({
    data: {
      orderId: params.orderId,
      signaturitId: result.id,
      status: "sent",
    },
  });

  return NextResponse.json({ signature });
}
