import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { BilingualEditor } from "@/components/editor/bilingual-editor";
import { head } from "@vercel/blob";
import type { TranslationSegment, BilingualDocument } from "@/types";

export const dynamic = "force-dynamic";

interface Props {
  params: { orderId: string };
}

export default async function EditorPage({ params }: Props) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const [order, profile] = await Promise.all([
    prisma.order.findUnique({
      where: { id: params.orderId },
      select: {
        id: true,
        translatorId: true,
        sourceLang: true,
        targetLang: true,
        documentType: true,
        originalFileUrl: true,
        price: true,
        status: true,
        client: { select: { name: true } },
      },
    }),
    prisma.translatorProfile.findUnique({
      where: { userId: session.user.id },
      select: { maecNumber: true },
    }),
  ]);

  if (!order || (order.translatorId !== session.user.id && session.user.role !== "admin")) {
    notFound();
  }

  // Load existing document from Blob
  let segments: TranslationSegment[] = [];
  let docStatus: BilingualDocument["status"] = "draft";

  try {
    const blob = await head(`documents/${params.orderId}/translation.json`);
    if (blob) {
      const res = await fetch(blob.url);
      const data = await res.json();
      segments = data.segments || [];
      docStatus = data.status || "draft";
    }
  } catch {
    // No saved document yet
  }

  return (
    <BilingualEditor
      orderId={order.id}
      sourceLang={order.sourceLang}
      targetLang={order.targetLang}
      documentType={order.documentType}
      originalFileUrl={order.originalFileUrl}
      price={order.price}
      orderStatus={order.status}
      clientName={order.client?.name || "Cliente"}
      translatorName={session.user.name || "Traductor"}
      maecNumber={profile?.maecNumber || ""}
      initialSegments={segments}
      initialStatus={docStatus}
    />
  );
}
