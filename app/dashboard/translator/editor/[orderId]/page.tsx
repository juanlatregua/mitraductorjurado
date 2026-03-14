import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { BilingualEditor } from "@/components/editor/bilingual-editor";
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
        translationData: true,
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

  // Load segments from DB
  let segments: TranslationSegment[] = [];
  let docStatus: BilingualDocument["status"] = "draft";

  if (order.translationData) {
    try {
      const data = JSON.parse(order.translationData);
      segments = data.segments || [];
      docStatus = data.status || "draft";
    } catch {
      // Corrupted data — start fresh
    }
  }

  return (
    <BilingualEditor
      orderId={order.id}
      sourceLang={order.sourceLang}
      targetLang={order.targetLang}
      documentType={order.documentType}
      originalFileUrl={order.originalFileUrl}
      price={order.price ? Number(order.price) : null}
      orderStatus={order.status}
      clientName={order.client?.name || "Cliente"}
      translatorName={session.user.name || "Traductor"}
      maecNumber={profile?.maecNumber || ""}
      initialSegments={segments}
      initialStatus={docStatus}
    />
  );
}
