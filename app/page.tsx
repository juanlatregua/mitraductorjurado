import Link from "next/link";
import { Logo } from "@/components/logo";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/* ─── Helpers ─── */

const LANG_CODE: Record<string, string> = {
  FRANCÉS: "FR", INGLÉS: "EN", ALEMÁN: "DE", ITALIANO: "IT",
  PORTUGUÉS: "PT", ÁRABE: "AR", CHINO: "ZH", JAPONÉS: "JA",
  RUSO: "RU", RUMANO: "RO", POLACO: "PL", NEERLANDÉS: "NL",
  CATALÁN: "CA", GALLEGO: "GL", EUSKERA: "EU", SUECO: "SV",
  TURCO: "TR", DANÉS: "DA", NORUEGO: "NO", GRIEGO: "EL",
  HEBREO: "HE", HÚNGARO: "HU", CHECO: "CS", BÚLGARO: "BG",
  CROATA: "HR", SERBIO: "SR", FINÉS: "FI", ESTONIO: "ET",
  LETÓN: "LV", LITUANO: "LT", UCRANIANO: "UK", PERSA: "FA",
};

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function formatRegistryName(nombre: string): string {
  const commaIdx = nombre.indexOf(",");
  if (commaIdx > 0) {
    const apellidos = nombre.slice(0, commaIdx).trim().split(" ").map(capitalize).join(" ");
    const given = nombre.slice(commaIdx + 1).trim().split(" ").map(capitalize).join(" ");
    return `${given} ${apellidos}`;
  }
  return nombre.split(" ").map(capitalize).join(" ");
}

type HeroEntry = { name: string; spec: string; badge: string };
type ClientEntry = { name: string; spec: string; langs: string; badge: string };

const FALLBACK_HERO: HeroEntry[] = [
  { name: "Traductor verificado", spec: "Francés", badge: "MAEC ····" },
  { name: "Traductor verificado", spec: "Francés", badge: "MAEC ····" },
  { name: "Traductor verificado", spec: "Francés", badge: "MAEC ····" },
];

const FALLBACK_CLIENT: ClientEntry[] = [
  { name: "Traductor verificado", spec: "Madrid", langs: "FR → ES", badge: "MAEC ····" },
  { name: "Traductor verificado", spec: "Barcelona", langs: "EN → ES", badge: "MAEC ····" },
  { name: "Traductor verificado", spec: "Sevilla", langs: "FR → ES", badge: "MAEC ····" },
  { name: "Traductor verificado", spec: "Valencia", langs: "DE → ES", badge: "MAEC ····" },
];

export default async function Home() {
  let heroTranslators: HeroEntry[] = FALLBACK_HERO;
  let clientTranslators: ClientEntry[] = FALLBACK_CLIENT;

  try {
    // 3 French translators in Málaga for the hero mockup
    const heroRaw = await prisma.mAECRegistry.findMany({
      where: { idiomas: { has: "FRANCÉS" }, provincia: "MÁLAGA", activo: true },
      take: 3,
    });

    if (heroRaw.length >= 3) {
      const heroTijs = heroRaw.map((t) => `N.${t.tij}`);
      const claimedHero = new Set(
        (await prisma.translatorProfile.findMany({
          where: { maecNumber: { in: heroTijs } },
          select: { maecNumber: true },
        })).map((p) => p.maecNumber),
      );
      heroTranslators = heroRaw.map((t) => ({
        name: formatRegistryName(t.nombre),
        spec: t.idiomas.map(capitalize).join(" · "),
        badge: claimedHero.has(`N.${t.tij}`) ? `MAEC N.${t.tij}` : "MAEC ····",
      }));
    }

    // 4 translators from different provinces for "Para clientes"
    const targetProvinces = ["MADRID", "BARCELONA", "SEVILLA", "VALENCIA"];
    const clientRaw = await Promise.all(
      targetProvinces.map((prov) =>
        prisma.mAECRegistry.findFirst({ where: { provincia: prov, activo: true } }),
      ),
    );
    const validClients = clientRaw.filter(Boolean) as NonNullable<(typeof clientRaw)[0]>[];

    if (validClients.length >= 4) {
      const clientTijs = validClients.map((t) => `N.${t.tij}`);
      const claimedClient = new Set(
        (await prisma.translatorProfile.findMany({
          where: { maecNumber: { in: clientTijs } },
          select: { maecNumber: true },
        })).map((p) => p.maecNumber),
      );
      clientTranslators = validClients.map((t) => ({
        name: formatRegistryName(t.nombre),
        spec: capitalize(t.provincia),
        langs: `${LANG_CODE[t.idiomas[0]] || t.idiomas[0].slice(0, 2)} → ES`,
        badge: claimedClient.has(`N.${t.tij}`) ? `MAEC N.${t.tij}` : "MAEC ····",
      }));
    }
  } catch {
    // DB unavailable — use fallback static data
  }

  return (
    <main>
      {/* ─── Navbar ─── */}
      <nav
        className="fixed top-0 w-full z-50"
        style={{
          backgroundColor: "var(--color-primary)",
          borderBottom: "0.5px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 h-[52px] flex items-center justify-between">
          <Link href="/">
            <Logo size="sm" variant="dark" />
          </Link>
          <Link
            href="/auth/login"
            className="font-sans text-sm font-medium px-5 py-2 rounded transition-colors"
            style={{ backgroundColor: "var(--color-accent)", color: "#fff" }}
          >
            Acceder
          </Link>
        </div>
      </nav>

      {/* ─── Split Hero ─── */}
      <section className="flex flex-col lg:flex-row" style={{ minHeight: "calc(100vh - 52px)", marginTop: 52 }}>
        {/* Columna Traductor */}
        <div
          className="relative flex-1 flex flex-col justify-center px-8 md:px-16 py-16 lg:py-0 overflow-hidden"
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          {/* Background decoration — Logo SVG watermark */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none"
            style={{ opacity: 0.06 }}
            aria-hidden="true"
          >
            <svg
              width={160}
              height={160}
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="120" height="120" rx="12" fill="#1F4A30" />
              <line x1="8" y1="20" x2="52" y2="20" stroke="#6ABB7A" strokeWidth="3" strokeLinecap="round" />
              <line x1="23" y1="30" x2="37" y2="30" stroke="#4A8A5A" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="23" y1="38" x2="37" y2="38" stroke="#4A8A5A" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="20" y1="46" x2="40" y2="46" stroke="#4A8A5A" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="18" y1="54" x2="42" y2="54" stroke="#4A8A5A" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="23" y1="62" x2="37" y2="62" stroke="#4A8A5A" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="23" y1="70" x2="37" y2="70" stroke="#4A8A5A" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="56" y1="35" x2="56" y2="85" stroke="#C9882A" strokeWidth="2" strokeLinecap="round" />
              <polyline points="50,75 56,85 62,75" stroke="#C9882A" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="46" y1="55" x2="66" y2="55" stroke="#C9882A" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
              <line x1="78" y1="20" x2="112" y2="20" stroke="#C8EDD4" strokeWidth="3" strokeLinecap="round" />
              <line x1="100" y1="30" x2="112" y2="30" stroke="#8AC89A" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="98" y1="38" x2="112" y2="38" stroke="#8AC89A" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="95" y1="46" x2="112" y2="46" stroke="#8AC89A" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="100" y1="54" x2="112" y2="54" stroke="#8AC89A" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="88" y1="62" x2="105" y2="62" stroke="#8AC89A" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="82" y1="70" x2="98" y2="70" stroke="#8AC89A" strokeWidth="2.5" strokeLinecap="round" />
              <circle cx="100" cy="100" r="8" stroke="#C9882A" strokeWidth="1.5" fill="none" />
              <circle cx="100" cy="100" r="2.5" fill="#C9882A" />
            </svg>
          </div>

          <div className="relative z-10 max-w-md mx-auto lg:mx-0">
            <p
              className="font-mono text-[9px] uppercase tracking-[0.2em] mb-4 animate-fade-in-up"
              style={{ color: "#4A8A5A" }}
            >
              Traductor jurado MAEC
            </p>
            <h1 className="font-playfair font-bold text-[32px] leading-tight mb-4 animate-fade-in-up animate-delay-1" style={{ color: "var(--color-text-light)" }}>
              Tu herramienta.
              <br />
              <em style={{ color: "var(--color-accent)", fontStyle: "italic" }}>Todo</em> en uno.
            </h1>
            <p className="font-sans font-light text-[13px] mb-8 animate-fade-in-up animate-delay-2" style={{ color: "var(--color-text-muted)" }}>
              Sustituye Adobe, DeepL, Trados y tu app de facturación.
            </p>

            <ul className="space-y-3 mb-8 animate-fade-in-up animate-delay-3">
              {TRANSLATOR_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm" style={{ color: "var(--color-text-light)" }}>
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "var(--color-accent)" }} />
                  <span className="font-sans font-light">{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/auth/register"
              className="inline-block font-sans font-medium text-sm px-6 py-3 rounded transition-colors animate-fade-in-up animate-delay-4"
              style={{ backgroundColor: "var(--color-accent)", color: "#fff" }}
            >
              Acceder como traductor &rarr;
            </Link>

            <p
              className="font-mono text-[9px] mt-4 animate-fade-in-up animate-delay-5"
              style={{ color: "#2A5A3A" }}
            >
              {"// 49\u20AC/mes precio fundador"}
            </p>
          </div>
        </div>

        {/* Columna Cliente */}
        <div
          className="relative flex-1 flex flex-col justify-center px-8 md:px-16 py-16 lg:py-0"
          style={{
            backgroundColor: "var(--color-surface)",
            borderLeft: "0.5px solid var(--color-border)",
          }}
        >
          <div className="relative z-10 max-w-md mx-auto lg:mx-0">
            <p
              className="font-mono text-[9px] uppercase tracking-[0.2em] mb-4 animate-fade-in-up"
              style={{ color: "var(--color-accent)" }}
            >
              Necesito una traducción jurada
            </p>
            <h1 className="font-playfair font-bold text-[32px] leading-tight mb-4 animate-fade-in-up animate-delay-1" style={{ color: "var(--color-primary)" }}>
              Encuentra tu traductor
              <br />
              <em style={{ color: "var(--color-accent)", fontStyle: "italic" }}>verificado</em> en 60 seg.
            </h1>
            <p className="font-sans font-light text-[13px] mb-8 animate-fade-in-up animate-delay-2" style={{ color: "var(--color-text-gray)" }}>
              Solo traductores nombrados por el MAEC. Todos verificados. Sin intermediarios.
            </p>

            {/* Mockup directorio */}
            <div className="bg-white rounded-lg border p-4 mb-8 animate-fade-in-up animate-delay-3" style={{ borderColor: "var(--color-border)" }}>
              {/* Filter pills */}
              <div className="flex flex-wrap gap-2 mb-4">
                {["FR → ES", "Málaga", "Jurídico", "Disponible"].map((pill) => (
                  <span
                    key={pill}
                    className="font-mono text-[9px] px-2.5 py-1 rounded-full border"
                    style={{ borderColor: "var(--color-border)", color: "var(--color-text-gray)" }}
                  >
                    {pill}
                  </span>
                ))}
              </div>
              {/* Translator rows */}
              {heroTranslators.map((t, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 py-2.5"
                  style={{ borderTop: i > 0 ? "0.5px solid var(--color-border)" : "none" }}
                >
                  <div
                    className="w-8 h-8 rounded-sm flex-shrink-0"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-xs font-medium truncate" style={{ color: "var(--color-text-dark)" }}>
                      {t.name}
                    </p>
                    <p className="font-sans text-[10px]" style={{ color: "var(--color-text-gray)" }}>
                      {t.spec}
                    </p>
                  </div>
                  <span className="font-mono text-[9px] font-medium" style={{ color: "var(--color-accent)" }}>
                    {t.badge}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/translators"
              className="inline-block font-sans font-medium text-sm px-6 py-3 rounded transition-colors animate-fade-in-up animate-delay-4"
              style={{ backgroundColor: "var(--color-primary)", color: "#fff" }}
            >
              Buscar traductor jurado &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Banda central ─── */}
      <section
        className="py-4 flex items-center gap-4 px-6"
        style={{ backgroundColor: "var(--color-primary)" }}
      >
        <div className="flex-1 h-px" style={{ backgroundColor: "#2A5A3A" }} />
        <p className="font-mono text-[9px] tracking-[0.15em] text-center whitespace-nowrap" style={{ color: "#3A6A4A" }}>
          La plataforma de los traductores jurados de España
        </p>
        <div className="flex-1 h-px" style={{ backgroundColor: "#2A5A3A" }} />
      </section>

      {/* ─── Stats bar ─── */}
      <section className="bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4">
          {STATS.map((st, i) => (
            <div
              key={st.label}
              className="px-6 py-8 text-center"
              style={{
                borderRight: i < STATS.length - 1 ? "0.5px solid var(--color-border)" : "none",
              }}
            >
              <p className="font-mono font-medium text-[15px]" style={{ color: "var(--color-primary)" }}>
                {st.value}
              </p>
              <p className="font-sans text-[10px] mt-1" style={{ color: "#aaa" }}>
                {st.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Convergencia ─── */}
      <section className="py-20 px-6" style={{ backgroundColor: "var(--color-surface)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] mb-4" style={{ color: "var(--color-accent)" }}>
            Ahorra desde el primer mes
          </p>
          <h2 className="font-playfair font-bold text-3xl md:text-4xl mb-3" style={{ color: "var(--color-primary)" }}>
            Cinco herramientas.
            <br />
            Una sola plataforma.
          </h2>
          <p className="font-sans font-light text-sm mb-12 max-w-xl mx-auto" style={{ color: "var(--color-text-gray)" }}>
            El traductor jurado medio gasta más de 120€/mes en herramientas fragmentadas.
          </p>

          {/* Diagrama convergencia */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12">
            {/* Herramientas */}
            <div className="space-y-2">
              {TOOLS.map((t) => (
                <div
                  key={t.name}
                  className="flex items-center justify-between gap-6 font-sans text-sm px-4 py-2 rounded border"
                  style={{
                    borderColor: "var(--color-border)",
                    backgroundColor: "white",
                    opacity: t.faded ? 0.35 : 1,
                  }}
                >
                  <span style={{ color: "var(--color-text-dark)" }}>{t.name}</span>
                  <span className="font-mono text-xs" style={{ color: "var(--color-text-gray)" }}>{t.price}</span>
                </div>
              ))}
            </div>

            {/* Flechas SVG */}
            <div className="hidden md:flex flex-col items-center">
              <svg width="48" height="120" viewBox="0 0 48 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 10 L24 60 L40 10" stroke="#C9882A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <path d="M8 110 L24 60 L40 110" stroke="#C9882A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                <circle cx="24" cy="60" r="4" fill="#C9882A" />
              </svg>
            </div>

            {/* Resultado */}
            <div
              className="rounded-lg p-6 text-center min-w-[200px]"
              style={{ backgroundColor: "var(--color-primary)" }}
            >
              <p className="font-mono text-sm line-through mb-1" style={{ color: "var(--color-text-muted)" }}>
                ~123€/mes
              </p>
              <p className="font-playfair font-bold text-3xl mb-2" style={{ color: "var(--color-accent)" }}>
                49€<span className="text-base font-normal">/mes</span>
              </p>
              <div className="space-y-1 mt-4">
                {["Editor + DeepL", "Firma eIDAS", "Verifactu AEAT", "Stripe Connect", "Red de colegas"].map((f) => (
                  <p key={f} className="font-sans text-[11px]" style={{ color: "var(--color-text-light)" }}>
                    {f}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Para traductores ─── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] mb-3" style={{ color: "var(--color-accent)" }}>
            Para traductores jurados
          </p>
          <h2 className="font-playfair font-bold text-3xl mb-12" style={{ color: "var(--color-primary)" }}>
            Herramientas profesionales
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {TRANSLATOR_CARDS.map((c) => (
              <div
                key={c.title}
                className="p-6 bg-white"
                style={{ borderLeft: "3px solid var(--color-accent)" }}
              >
                {/* Inline SVG icon */}
                <div className="mb-4">
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {c.iconPath}
                  </svg>
                </div>
                <h3 className="font-sans font-medium text-sm mb-2" style={{ color: "var(--color-primary)" }}>
                  {c.title}
                </h3>
                <p className="font-sans font-light text-xs leading-relaxed" style={{ color: "var(--color-text-gray)" }}>
                  {c.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Para clientes ─── */}
      <section className="py-20 px-6" style={{ backgroundColor: "var(--color-surface)" }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] mb-3" style={{ color: "var(--color-accent)" }}>
              Para clientes
            </p>
            <h2 className="font-playfair font-bold text-3xl mb-4" style={{ color: "var(--color-primary)" }}>
              Tu traducción jurada, sin intermediarios
            </h2>
            <p className="font-sans font-light text-sm leading-relaxed mb-6" style={{ color: "var(--color-text-gray)" }}>
              Busca entre traductores jurados verificados por el MAEC. Filtra por idioma, provincia y especialidad. Contacta directamente, sin agencias.
            </p>
            <Link
              href="/translators"
              className="inline-block font-sans font-medium text-sm px-6 py-3 rounded transition-colors"
              style={{ backgroundColor: "var(--color-primary)", color: "#fff" }}
            >
              Explorar directorio &rarr;
            </Link>
          </div>

          {/* Mockup directorio expandido */}
          <div className="bg-white rounded-lg border p-5" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 h-8 rounded border px-3 flex items-center" style={{ borderColor: "var(--color-border)" }}>
                <span className="font-sans text-[11px]" style={{ color: "#bbb" }}>Buscar por idioma, ciudad...</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {["Francés", "Madrid", "Jurídico"].map((pill) => (
                <span
                  key={pill}
                  className="font-mono text-[9px] px-2.5 py-1 rounded-full"
                  style={{ backgroundColor: "var(--color-primary)", color: "var(--color-text-light)" }}
                >
                  {pill}
                </span>
              ))}
            </div>
            {clientTranslators.map((t, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-3"
                style={{ borderTop: i > 0 ? "0.5px solid var(--color-border)" : "none" }}
              >
                <div
                  className="w-10 h-10 rounded-sm flex-shrink-0"
                  style={{ backgroundColor: "var(--color-primary)" }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-sans text-xs font-medium" style={{ color: "var(--color-text-dark)" }}>
                      {t.name}
                    </p>
                    <span className="font-mono text-[8px] px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--color-surface)", color: "var(--color-accent)" }}>
                      {t.badge}
                    </span>
                  </div>
                  <p className="font-sans text-[10px]" style={{ color: "var(--color-text-gray)" }}>
                    {t.spec}
                  </p>
                </div>
                <span className="font-mono text-[9px]" style={{ color: "var(--color-text-muted)" }}>
                  {t.langs}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Cómo funciona ─── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-[9px] uppercase tracking-[0.2em] mb-3 text-center" style={{ color: "var(--color-accent)" }}>
            Cómo funciona
          </p>
          <h2 className="font-playfair font-bold text-3xl text-center mb-14" style={{ color: "var(--color-primary)" }}>
            Tres pasos simples
          </h2>
          <div className="space-y-0">
            {STEPS.map((step, i) => (
              <div key={step.title} className="flex gap-6">
                {/* Number + connector */}
                <div className="flex flex-col items-center">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-mono font-medium text-sm flex-shrink-0"
                    style={{ backgroundColor: "var(--color-accent)", color: "#fff" }}
                  >
                    {i + 1}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="w-px flex-1 my-2" style={{ backgroundColor: "var(--color-border)" }} />
                  )}
                </div>
                {/* Content */}
                <div className="pb-10">
                  <h3 className="font-sans font-medium text-sm mb-1" style={{ color: "var(--color-primary)" }}>
                    {step.title}
                  </h3>
                  <p className="font-sans font-light text-xs leading-relaxed" style={{ color: "var(--color-text-gray)" }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer
        className="py-10 px-6"
        style={{
          backgroundColor: "var(--color-footer)",
          borderTop: "0.5px solid var(--color-primary)",
        }}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <Logo size="sm" variant="dark" />
          <div className="flex gap-6">
            {[
              { label: "Directorio", href: "/translators" },
              { label: "Acceder", href: "/auth/login" },
            ].map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="font-sans font-light text-xs transition-colors"
                style={{ color: "#3A6A4A" }}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <p className="font-playfair italic text-xs" style={{ color: "#2A4A3A" }}>
            Hecho por traductores, para traductores.
          </p>
        </div>
        <div className="max-w-6xl mx-auto mt-6 pt-4" style={{ borderTop: "0.5px solid #1A3A2A" }}>
          <p className="font-sans font-light text-[10px]" style={{ color: "#2A4A3A" }}>
            &copy; {new Date().getFullYear()} HBTJ Consultores Lingüísticos S.L.
          </p>
        </div>
      </footer>
    </main>
  );
}

/* ─── Data ─── */

const TRANSLATOR_FEATURES = [
  "Dashboard de pedidos",
  "Editor bilingüe + DeepL",
  "Firma eIDAS + Verifactu",
  "Red de colegas + Widget",
];

const STATS = [
  { value: "~1.200", label: "traductores MAEC" },
  { value: "eIDAS", label: "firma certificada" },
  { value: "Verifactu", label: "listo AEAT 2027" },
  { value: "49€", label: "precio fundador/mes" },
];

const TOOLS = [
  { name: "Adobe Acrobat", price: "25€/mes", faded: false },
  { name: "DeepL Pro", price: "22€/mes", faded: false },
  { name: "SDL Trados", price: "45€/mes", faded: false },
  { name: "Signaturit", price: "19€/mes", faded: true },
  { name: "Facturación", price: "12€/mes", faded: true },
];

const TRANSLATOR_CARDS = [
  {
    title: "Dashboard de pedidos",
    desc: "Gestiona presupuestos, aceptación, seguimiento y entrega. Todo el flujo del pedido en un solo lugar.",
    iconPath: (
      <>
        <rect x="3" y="5" width="22" height="18" rx="2" stroke="#1A3A2A" strokeWidth="1.5" fill="none" />
        <line x1="3" y1="11" x2="25" y2="11" stroke="#1A3A2A" strokeWidth="1.5" />
        <line x1="10" y1="11" x2="10" y2="23" stroke="#1A3A2A" strokeWidth="1.5" />
      </>
    ),
  },
  {
    title: "Editor bilingüe + DeepL",
    desc: "Editor de traducción con segmentos paralelos, traducción automática integrada y control de progreso.",
    iconPath: (
      <>
        <rect x="2" y="4" width="10" height="20" rx="1" stroke="#1A3A2A" strokeWidth="1.5" fill="none" />
        <rect x="16" y="4" width="10" height="20" rx="1" stroke="#1A3A2A" strokeWidth="1.5" fill="none" />
        <path d="M12 11 L16 14 L12 17" stroke="#C9882A" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    title: "Firma eIDAS + Verifactu",
    desc: "Firma electrónica cualificada y facturación Verifactu AEAT integradas. Cumplimiento automático.",
    iconPath: (
      <>
        <path d="M6 14 L11 19 L22 8" stroke="#1A3A2A" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="14" cy="14" r="11" stroke="#1A3A2A" strokeWidth="1.5" fill="none" />
      </>
    ),
  },
];

const STEPS = [
  {
    title: "Busca tu traductor",
    desc: "Filtra por idioma, provincia y especialidad en el directorio de traductores jurados MAEC verificados.",
  },
  {
    title: "Solicita presupuesto",
    desc: "Envía tu documento y recibe un presupuesto detallado directamente del traductor. Sin intermediarios.",
  },
  {
    title: "Recibe tu traducción",
    desc: "El traductor trabaja con herramientas profesionales. Recibes la traducción firmada electrónicamente con validez eIDAS.",
  },
];
