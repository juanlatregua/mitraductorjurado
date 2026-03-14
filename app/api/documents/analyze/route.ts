import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { countWords } from "@/lib/word-count";
import { calculateVAT } from "@/lib/verifactu";
import { z } from "zod";

const bodySchema = z.object({
  text: z.string().min(1, "Texto requerido"),
  ratePerWord: z.number().positive().optional(),
});

// POST — Analyze document text: word count + price estimate with IVA
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const wordCount = countWords(parsed.data.text);
  const rate = parsed.data.ratePerWord;

  if (rate) {
    const baseImponible = wordCount * rate;
    const { vatRate, vatAmount, totalAmount } = calculateVAT(baseImponible);
    return NextResponse.json({
      wordCount,
      ratePerWord: rate,
      baseImponible,
      iva: vatAmount,
      ivaRate: vatRate,
      totalConIVA: totalAmount,
    });
  }

  return NextResponse.json({ wordCount });
}
