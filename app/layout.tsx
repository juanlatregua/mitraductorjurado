import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "mitraductorjurado.es — Plataforma para Traductores Jurados",
  description:
    "El sistema operativo del traductor jurado. Editor integrado, base de plantillas de documentos y red de derivación profesional.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
