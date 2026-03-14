import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSignedDocumentUrl } from "@/lib/signaturit";
import crypto from "crypto";

// POST — Webhook de Signaturit
// Signaturit envía eventos cuando el estado de una firma cambia
// Configurar en: Signaturit Dashboard → Settings → Webhooks
// URL: https://mitraductorjurado.es/api/webhooks/signaturit
export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  // Verify HMAC signature from Signaturit
  const webhookSecret = process.env.SIGNATURIT_WEBHOOK_SECRET;
  if (webhookSecret) {
    const signature = req.headers.get("x-signaturit-signature");
    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 401 });
    }
    const expected = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Signaturit envía el evento con la estructura:
  // { type: "signature_completed", signature: { id, status, documents: [...] } }
  const eventType = body.type;
  const signatureData = body.signature;

  if (!signatureData?.id) {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  const signaturitId = signatureData.id;

  // Buscar la firma en nuestra DB
  const signature = await prisma.signature.findFirst({
    where: { signaturitId },
  });

  if (!signature) {
    // Ignorar — puede ser de otro entorno
    return NextResponse.json({ ok: true, ignored: true });
  }

  switch (eventType) {
    case "signature_completed":
    case "document_signed": {
      // Descargar el documento firmado
      let signedDocUrl: string | null = null;
      if (signatureData.documents?.[0]?.id) {
        try {
          signedDocUrl = await getSignedDocumentUrl(
            signaturitId,
            signatureData.documents[0].id
          );
        } catch (err) {
          console.error("Failed to download signed document:", err);
        }
      }

      await prisma.signature.update({
        where: { id: signature.id },
        data: {
          status: "signed",
          signedAt: new Date(),
          signedDocumentUrl: signedDocUrl,
        },
      });

      // Actualizar el pedido con la URL del documento firmado
      if (signedDocUrl) {
        await prisma.order.update({
          where: { id: signature.orderId },
          data: { translatedFileUrl: signedDocUrl },
        });
      }

      break;
    }

    case "signature_declined":
    case "document_declined": {
      await prisma.signature.update({
        where: { id: signature.id },
        data: { status: "rejected" },
      });
      break;
    }

    default:
      // Otros eventos (ej: email_delivered, reminder_sent) — ignorar
      break;
  }

  return NextResponse.json({ ok: true });
}
