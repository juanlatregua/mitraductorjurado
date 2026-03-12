import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Params {
  params: { orderId: string };
}

// GET — Descargar XML Verifactu de una factura
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

  const invoice = await prisma.invoice.findUnique({
    where: { orderId: params.orderId },
    select: { invoiceNumber: true, xmlContent: true },
  });

  if (!invoice || !invoice.xmlContent) {
    return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });
  }

  return new NextResponse(invoice.xmlContent, {
    headers: {
      "Content-Type": "application/xml",
      "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.xml"`,
    },
  });
}
