import type { Metadata } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "mitraductorjurado.es — Plataforma para Traductores Jurados",
    template: "%s | mitraductorjurado.es",
  },
  description:
    "El sistema operativo del traductor jurado. Gestiona pedidos, traduce con editor bilingüe, firma con eIDAS, factura con Verifactu y cobra con Stripe.",
  keywords: [
    "traductor jurado",
    "traducción jurada",
    "MAEC",
    "traducción oficial",
    "traductor jurado online",
    "traducción certificada",
    "Verifactu",
    "firma electrónica eIDAS",
  ],
  authors: [{ name: "HBTJ Consultores Lingüísticos S.L." }],
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://mitraductorjurado.es",
    siteName: "mitraductorjurado.es",
    title: "mitraductorjurado.es — Plataforma para Traductores Jurados",
    description:
      "El sistema operativo del traductor jurado. Todo integrado: pedidos, editor, firma eIDAS, Verifactu y pagos.",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://mitraductorjurado.es"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
