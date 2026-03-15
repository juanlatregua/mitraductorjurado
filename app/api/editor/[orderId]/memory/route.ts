import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

interface Params {
  params: { orderId: string };
}

// GET — Translation memory stats (stub — real matching in S16c)
export async function GET(_req: NextRequest, { params: _params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  return NextResponse.json({
    identicalCount: 0,
    similarCount: 0,
    glossaryCount: 0,
  });
}
