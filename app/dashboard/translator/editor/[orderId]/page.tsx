import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { BilingualEditor } from "@/components/editor/bilingual-editor";
import type { EditorSegment } from "@/types";

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

  // Load segments: try Segment table first, fallback to translationData JSON
  let segments: EditorSegment[] = [];

  const dbSegments = await prisma.segment.findMany({
    where: { orderId: order.id },
    orderBy: { index: "asc" },
  });

  if (dbSegments.length > 0) {
    segments = dbSegments.map((s) => ({
      id: s.id,
      index: s.index,
      original: s.original,
      translation: s.translation || "",
      status: s.status as EditorSegment["status"],
      source: s.source as EditorSegment["source"],
      memoryScore: s.memoryScore,
    }));
  } else if (order.translationData) {
    try {
      const data = JSON.parse(order.translationData);
      const legacySegs = data.segments || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      segments = legacySegs.map((s: any) => ({
        id: s.id || `seg-${s.index}`,
        index: s.index,
        original: s.originalText || s.original || "",
        translation: s.translatedText || s.translation || "",
        status: s.isApproved
          ? "confirmed" as const
          : (s.translatedText || s.translation)
            ? "suggestion" as const
            : "empty" as const,
        source: s.isEdited ? "manual" as const : (s.translatedText || s.translation) ? "deepl" as const : "manual" as const,
        memoryScore: null,
      }));
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
    />
  );
}
