import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const profile = await prisma.translatorProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) {
    return NextResponse.json({ error: "Perfil no encontrado" }, { status: 404 });
  }

  const formData = await req.formData();
  const file = formData.get("photo") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No se envió archivo" }, { status: 400 });
  }

  // Validar tipo y tamaño
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "El archivo debe ser una imagen" }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "La imagen no puede superar 5 MB" }, { status: 400 });
  }

  const blob = await put(`photos/${profile.id}-${Date.now()}`, file, {
    access: "public",
  });

  await prisma.translatorProfile.update({
    where: { id: profile.id },
    data: { photoUrl: blob.url },
  });

  return NextResponse.json({ url: blob.url });
}
