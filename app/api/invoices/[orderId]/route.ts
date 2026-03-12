import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateInvoiceNumber } from "@/lib/invoice-number";
import {
  generateVerifactuXML,
  submitToAEAT,
  calculateVAT,
  isVerifactuConfigured,
} from "@/lib/verifactu";
import { generateInvoicePdf } from "@/lib/invoice-pdf";
import { put } from "@vercel/blob";

interface Params {
  params: { orderId: string };
}

// GET — Obtener factura de un pedido
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
  });

  return NextResponse.json({
    invoice,
    verifactuConfigured: isVerifactuConfigured(),
  });
}

// POST — Generar factura para un pedido cerrado
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
      client: { select: { id: true, name: true, email: true } },
      translator: {
        select: {
          id: true,
          name: true,
          translatorProfile: { select: { maecNumber: true } },
        },
      },
      invoice: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  if (order.translatorId !== session.user.id && session.user.role !== "admin") {
    return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
  }

  if (order.invoice) {
    return NextResponse.json({ error: "Ya existe una factura para este pedido" }, { status: 409 });
  }

  if (!["delivered", "closed"].includes(order.status)) {
    return NextResponse.json(
      { error: "El pedido debe estar entregado o cerrado para facturar" },
      { status: 400 }
    );
  }

  if (!order.price) {
    return NextResponse.json({ error: "El pedido no tiene precio" }, { status: 400 });
  }

  const invoiceNumber = await generateInvoiceNumber();
  const { vatRate, vatAmount, totalAmount } = calculateVAT(order.price);

  // Generar XML Verifactu
  const xmlContent = generateVerifactuXML({
    invoiceNumber,
    issuerNif: process.env.VERIFACTU_NIF || "PENDIENTE",
    issuerName: order.translator.name || "Traductor Jurado",
    recipientName: order.client.name || order.client.email,
    amount: order.price,
    vatRate,
    vatAmount,
    totalAmount,
    concept: `Traducción jurada — Pedido ${order.id.slice(0, 8)}`,
    issueDate: new Date(),
  });

  // Intentar enviar a AEAT
  let sentToAeat = false;
  let aeatResponse: string | null = null;

  if (isVerifactuConfigured()) {
    const result = await submitToAEAT(xmlContent);
    sentToAeat = result.ok;
    aeatResponse = result.response || result.error || null;
  }

  // Generar PDF
  const concept = `Traducción jurada — Pedido ${order.id.slice(0, 8)}`;
  let pdfUrl: string | null = null;

  try {
    const pdfBuffer = await generateInvoicePdf({
      invoiceNumber,
      issueDate: new Date(),
      issuerName: order.translator.name || "Traductor Jurado",
      issuerNif: process.env.VERIFACTU_NIF || "PENDIENTE",
      issuerMaec: order.translator.translatorProfile?.maecNumber || undefined,
      recipientName: order.client.name || "Cliente",
      recipientEmail: order.client.email,
      concept,
      amount: order.price,
      vatRate,
      vatAmount,
      totalAmount,
      sentToAeat,
      aeatStatus: aeatResponse || undefined,
    });

    const blob = await put(
      `invoices/${invoiceNumber}.pdf`,
      pdfBuffer,
      { access: "public", contentType: "application/pdf" }
    );
    pdfUrl = blob.url;
  } catch (err) {
    console.error("[Invoice PDF] Error generating PDF:", err);
  }

  const invoice = await prisma.invoice.create({
    data: {
      orderId: params.orderId,
      invoiceNumber,
      issuerId: order.translatorId,
      recipientId: order.clientId,
      amount: order.price,
      vatAmount,
      totalAmount,
      xmlContent,
      pdfUrl,
      status: sentToAeat ? "sent" : "pending",
      sentToAeat,
      aeatResponse,
    },
  });

  return NextResponse.json({ invoice }, { status: 201 });
}
