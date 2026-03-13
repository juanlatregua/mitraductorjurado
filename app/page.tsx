import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function Home() {
  // Stats reales para social proof
  let translatorCount = 0;
  let orderCount = 0;
  try {
    [translatorCount, orderCount] = await Promise.all([
      prisma.translatorProfile.count({ where: { verified: true } }),
      prisma.order.count({ where: { status: { in: ["delivered", "closed"] } } }),
    ]);
  } catch {
    // DB not available — show landing without stats
  }

  return (
    <main className="bg-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm border-b border-navy-100 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-navy-900 text-lg">
            mitraductorjurado<span className="text-accent-500">.es</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/translators"
              className="text-sm text-navy-600 hover:text-navy-900 transition-colors"
            >
              Directorio
            </Link>
            <Link
              href="/auth/login"
              className="text-sm bg-navy-900 hover:bg-navy-800 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Acceder
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-navy-900 mb-6 leading-tight">
            El sistema operativo del{" "}
            <span className="text-accent-500">traductor jurado</span>
          </h1>
          <p className="text-xl text-navy-500 mb-10 max-w-2xl mx-auto">
            Gestiona pedidos, traduce con editor bilingüe, firma con eIDAS,
            factura con Verifactu y cobra con Stripe. Todo desde una plataforma.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="bg-accent-500 hover:bg-accent-600 text-white font-semibold px-8 py-3.5 rounded-lg text-lg transition-colors"
            >
              Empezar gratis
            </Link>
            <Link
              href="/translators"
              className="border-2 border-navy-200 hover:border-navy-400 text-navy-700 font-semibold px-8 py-3.5 rounded-lg text-lg transition-colors"
            >
              Buscar traductor jurado
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      {(translatorCount > 0 || orderCount > 0) && (
        <section className="py-12 bg-navy-50">
          <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold text-navy-900">{translatorCount}</p>
              <p className="text-sm text-navy-500 mt-1">Traductores verificados MAEC</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-navy-900">{orderCount}</p>
              <p className="text-sm text-navy-500 mt-1">Traducciones completadas</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-navy-900">49€</p>
              <p className="text-sm text-navy-500 mt-1">Plan fundador / mes</p>
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-navy-900 text-center mb-12">
            Todo lo que necesitas, en un solo lugar
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-xl border border-navy-100 p-6">
                <div className="w-12 h-12 rounded-lg bg-accent-50 flex items-center justify-center text-2xl mb-4">
                  {f.icon}
                </div>
                <h3 className="font-bold text-navy-900 mb-2">{f.title}</h3>
                <p className="text-sm text-navy-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works - Clientes */}
      <section className="py-20 px-6 bg-navy-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-navy-900 text-center mb-4">
            Para clientes
          </h2>
          <p className="text-center text-navy-500 mb-12">
            Consigue tu traducción jurada en 3 pasos
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {CLIENT_STEPS.map((s, i) => (
              <div key={s.title} className="text-center">
                <div className="w-10 h-10 rounded-full bg-accent-500 text-white font-bold flex items-center justify-center mx-auto mb-4">
                  {i + 1}
                </div>
                <h3 className="font-bold text-navy-900 mb-2">{s.title}</h3>
                <p className="text-sm text-navy-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto bg-navy-900 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Deja de pagar 165€/mes en herramientas
          </h2>
          <p className="text-navy-300 mb-8">
            Adobe + DeepL + Word + gestión manual = 120-165€/mes.
            Con mitraductorjurado.es, todo integrado por 49€/mes.
          </p>
          <Link
            href="/auth/register"
            className="inline-block bg-accent-500 hover:bg-accent-600 text-white font-semibold px-8 py-3.5 rounded-lg text-lg transition-colors"
          >
            Empieza ahora — Plan fundador 49€/mes
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-navy-100">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-navy-400">
            &copy; {new Date().getFullYear()} HBTJ Consultores Lingüísticos S.L.
          </p>
          <div className="flex gap-6 text-sm text-navy-400">
            <Link href="/translators" className="hover:text-navy-600">Directorio</Link>
            <Link href="/auth/login" className="hover:text-navy-600">Acceder</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

const FEATURES = [
  {
    icon: "✍️",
    title: "Editor bilingüe",
    desc: "Editor de traducción con segmentos paralelos, traducción automática con DeepL y control de progreso.",
  },
  {
    icon: "📋",
    title: "Gestión de pedidos",
    desc: "Presupuestos, aceptación, seguimiento de estado y entrega. Todo el flujo en un solo lugar.",
  },
  {
    icon: "📄",
    title: "Plantillas MAEC",
    desc: "Base de plantillas para los documentos más frecuentes: actas, títulos, Kbis, contratos y más.",
  },
  {
    icon: "🔏",
    title: "Firma eIDAS",
    desc: "Firma electrónica cualificada con Signaturit. Válida legalmente en toda la UE.",
  },
  {
    icon: "🧾",
    title: "Facturación Verifactu",
    desc: "Facturación electrónica con XML Verifactu para cumplir con la AEAT. Automática al cerrar pedido.",
  },
  {
    icon: "💳",
    title: "Cobros con Stripe",
    desc: "Cobro directo al cliente con split automático. Sin intermediarios, sin retrasos.",
  },
  {
    icon: "🤝",
    title: "Red de colegas",
    desc: "Deriva pedidos a colegas traductores y gestiona el margen. Ideal para pares de idiomas que no cubres.",
  },
  {
    icon: "🔗",
    title: "Widget embebible",
    desc: "Inserta un formulario de contacto en tu web personal y recibe solicitudes directamente.",
  },
  {
    icon: "🔍",
    title: "Directorio público",
    desc: "Perfil profesional con SEO para que los clientes te encuentren por idioma, provincia y especialidad.",
  },
];

const CLIENT_STEPS = [
  {
    title: "Busca un traductor",
    desc: "Filtra por idioma, provincia y especialidad en nuestro directorio de traductores jurados MAEC.",
  },
  {
    title: "Solicita presupuesto",
    desc: "Envía tu documento y recibe un presupuesto detallado directamente del traductor.",
  },
  {
    title: "Recibe tu traducción",
    desc: "El traductor trabaja, tú sigues el progreso. Recibes la traducción firmada electrónicamente.",
  },
];
