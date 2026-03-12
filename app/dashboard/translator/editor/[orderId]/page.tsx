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

  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    select: {
      id: true,
      translatorId: true,
      sourceLang: true,
      targetLang: true,
      documentType: true,
      status: true,
      client: { select: { name: true } },
    },
  });

  if (!order || (order.translatorId !== session.user.id && session.user.role !== "admin")) {
    notFound();
  }

  // Cargar documento existente desde Blob
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
    // No document saved yet
  }

  return (
    <div className="flex flex-col h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 bg-navy-900 text-white rounded-t-xl">
        <div className="flex items-center gap-3">
          <a
            href="/dashboard/translator/editor"
            className="text-navy-300 hover:text-white text-sm"
          >
            ← Editor
          </a>
          <span className="text-navy-500">|</span>
          <span className="text-sm">
            Pedido {order.id.slice(0, 8)} — {order.client.name || "Cliente"}
          </span>
        </div>
        <a
          href={`/dashboard/translator/orders/${order.id}`}
          className="text-xs text-navy-400 hover:text-white"
        >
          Ver detalle del pedido
        </a>
      </div>

      {/* Editor */}
      <div className="flex-1 bg-white rounded-b-xl border border-navy-200 overflow-hidden">
        <BilingualEditor
          orderId={order.id}
          sourceLang={order.sourceLang}
          targetLang={order.targetLang}
          documentType={order.documentType}
          initialSegments={segments}
          initialStatus={docStatus}
        />
      </div>
    </div>
  );
}
