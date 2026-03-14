import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "mitraductorjurado.es — La plataforma de los traductores jurados de España",
    template: "%s | mitraductorjurado.es",
  },
  description:
    "La plataforma de los traductores jurados de España. Editor bilingüe, firma eIDAS, facturación Verifactu y cobros con Stripe. Todo integrado por 49€/mes.",
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
    title: "mitraductorjurado.es — La plataforma de los traductores jurados de España",
    description:
      "La plataforma de los traductores jurados de España. Editor bilingüe, firma eIDAS, facturación Verifactu y cobros con Stripe. Todo integrado por 49€/mes.",
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
    <html
      lang="es"
      className={`${playfair.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
