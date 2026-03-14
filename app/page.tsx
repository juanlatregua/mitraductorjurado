import Link from "next/link";
import { Logo } from "@/components/logo";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/landing/navbar";
import { HeroTextReveal } from "@/components/landing/hero-text-reveal";
import { ScrollReveal } from "@/components/landing/scroll-reveal";
import { AnimatedCounter } from "@/components/landing/animated-counter";
import { ProductShowcase } from "@/components/landing/product-showcase";

export const dynamic = "force-dynamic";

/* ─── Helpers ─── */

const LANG_CODE: Record<string, string> = {
  "FRANC\u00c9S": "FR", "INGL\u00c9S": "EN", "ALEM\u00c1N": "DE", "ITALIANO": "IT",
  "PORTUGU\u00c9S": "PT", "\u00c1RABE": "AR", "CHINO": "ZH", "JAPON\u00c9S": "JA",
  "RUSO": "RU", "RUMANO": "RO", "POLACO": "PL", "NEERLAND\u00c9S": "NL",
  "CATAL\u00c1N": "CA", "GALLEGO": "GL", "EUSKERA": "EU", "SUECO": "SV",
  "TURCO": "TR", "DAN\u00c9S": "DA", "NORUEGO": "NO", "GRIEGO": "EL",
  "HEBREO": "HE", "H\u00daNGARO": "HU", "CHECO": "CS", "B\u00daLGARO": "BG",
  "CROATA": "HR", "SERBIO": "SR", "FIN\u00c9S": "FI", "ESTONIO": "ET",
  "LET\u00d3N": "LV", "LITUANO": "LT", "UCRANIANO": "UK", "PERSA": "FA",
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

type ClientEntry = { name: string; spec: string; langs: string; badge: string };

const FALLBACK_CLIENT: ClientEntry[] = [
  { name: "Traductor verificado", spec: "Madrid", langs: "FR \u2192 ES", badge: "MAEC \u00b7\u00b7\u00b7\u00b7" },
  { name: "Traductor verificado", spec: "Barcelona", langs: "EN \u2192 ES", badge: "MAEC \u00b7\u00b7\u00b7\u00b7" },
  { name: "Traductor verificado", spec: "Sevilla", langs: "FR \u2192 ES", badge: "MAEC \u00b7\u00b7\u00b7\u00b7" },
  { name: "Traductor verificado", spec: "Valencia", langs: "DE \u2192 ES", badge: "MAEC \u00b7\u00b7\u00b7\u00b7" },
];

export default async function Home() {
  let clientTranslators: ClientEntry[] = FALLBACK_CLIENT;

  try {
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
        langs: `${LANG_CODE[t.idiomas[0]] || t.idiomas[0].slice(0, 2)} \u2192 ES`,
        badge: claimedClient.has(`N.${t.tij}`) ? `MAEC N.${t.tij}` : "MAEC \u00b7\u00b7\u00b7\u00b7",
      }));
    }
  } catch {
    // DB unavailable — use fallback static data
  }

  return (
    <main className="overflow-x-hidden">
      {/* ─── S1: Navbar ─── */}
      <Navbar />

      {/* ─── S2: Hero ─── */}
      <section
        className="relative min-h-screen flex items-center justify-center gradient-mesh-dark dot-grid overflow-hidden"
      >
        {/* Floating glass cards */}
        <div className="absolute top-[15%] left-[8%] animate-float hidden lg:block" aria-hidden="true">
          <div className="glass rounded-xl p-4 w-48">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#6ABB7A" }} />
              <span className="font-mono text-[8px]" style={{ color: "rgba(255,255,255,0.6)" }}>Editor bilingüe</span>
            </div>
            <div className="space-y-1.5">
              <div className="flex gap-1">
                <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: "rgba(106,187,122,0.3)" }} />
                <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: "rgba(200,237,212,0.2)" }} />
              </div>
              <div className="flex gap-1">
                <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: "rgba(106,187,122,0.3)" }} />
                <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: "rgba(200,237,212,0.2)" }} />
              </div>
              <div className="flex gap-1">
                <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: "rgba(106,187,122,0.3)" }} />
                <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: "rgba(200,237,212,0.15)" }} />
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-[20%] right-[6%] animate-float-delayed hidden lg:block" aria-hidden="true">
          <div className="glass rounded-xl p-4 w-44">
            <div className="flex items-center gap-2 mb-2">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="#C9882A" strokeWidth="1.2" />
                <circle cx="7" cy="7" r="2" fill="#C9882A" />
              </svg>
              <span className="font-mono text-[8px]" style={{ color: "rgba(255,255,255,0.6)" }}>Sello MAEC</span>
            </div>
            <div className="space-y-1">
              <div className="h-1.5 rounded-full w-3/4" style={{ backgroundColor: "rgba(201,136,42,0.3)" }} />
              <div className="h-1.5 rounded-full w-1/2" style={{ backgroundColor: "rgba(201,136,42,0.2)" }} />
            </div>
          </div>
        </div>

        {/* Hero content */}
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto pt-24 pb-32">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.25em] mb-6 animate-fade-in-up"
            style={{ color: "rgba(106,187,122,0.8)" }}
          >
            La plataforma de los traductores jurados de Espa&ntilde;a
          </p>

          <div style={{ color: "var(--color-text-light)" }}>
            <HeroTextReveal
              text="Tu herramienta. Todo en uno."
              highlightWord="Todo"
              className="font-playfair font-bold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-6"
            />
          </div>

          <p
            className="font-sans font-light text-base sm:text-lg max-w-xl mx-auto mb-10 animate-fade-in-up animate-delay-4"
            style={{ color: "rgba(255,255,255,0.6)" }}
          >
            Sustituye Adobe, DeepL, Trados y tu app de facturaci&oacute;n por una sola plataforma dise&ntilde;ada para traductores jurados.
          </p>

          {/* Dual CTAs */}
          <div
            className="animate-fade-in-up animate-delay-5"
            style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16, marginBottom: 48, flexWrap: "wrap" }}
          >
            <Link
              href="/auth/register"
              className="font-sans btn-glow"
              style={{
                display: "inline-block", fontWeight: 500, fontSize: 14,
                padding: "14px 32px", borderRadius: 999,
                backgroundColor: "var(--color-accent)", color: "#fff",
                textDecoration: "none",
                boxShadow: "0 4px 20px rgba(201,136,42,0.3)",
              }}
            >
              Empezar como traductor &rarr;
            </Link>
            <Link
              href="/translators"
              className="font-sans"
              style={{
                display: "inline-block", fontWeight: 500, fontSize: 14,
                padding: "14px 32px", borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.25)",
                color: "rgba(255,255,255,0.85)", textDecoration: "none",
              }}
            >
              Buscar traductor jurado
            </Link>
          </div>

          {/* Feature pills */}
          <div
            className="animate-fade-in-up animate-delay-6"
            style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 12 }}
          >
            {FEATURE_PILLS.map((pill) => (
              <span
                key={pill}
                className="glass font-mono"
                style={{ fontSize: 9, padding: "6px 12px", borderRadius: 999, color: "rgba(255,255,255,0.7)" }}
              >
                {pill}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, transparent, #fff)" }}
        />
      </section>

      {/* ─── S3: Trust Strip ─── */}
      <section style={{ backgroundColor: "#fff", borderBottom: "1px solid var(--color-border)", padding: "24px" }}>
        <div style={{ maxWidth: "64rem", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }}>
          {TRUST_BADGES.map((badge) => (
            <ScrollReveal key={badge.label} direction="up" delay={badge.delay}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: 40, height: 40, borderRadius: 8,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    backgroundColor: "var(--color-surface)", flexShrink: 0,
                  }}
                >
                  {badge.icon}
                </div>
                <div>
                  <p className="font-sans" style={{ fontSize: 12, fontWeight: 600, color: "var(--color-primary)", margin: 0 }}>
                    {badge.label}
                  </p>
                  <p className="font-sans" style={{ fontSize: 10, color: "var(--color-text-gray)", margin: 0 }}>
                    {badge.sub}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ─── S4: Animated Stats ─── */}
      <section style={{ padding: "80px 24px", backgroundColor: "#fff" }}>
        <div style={{ maxWidth: "64rem", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }}>
          {STATS.map((st) => (
            <ScrollReveal key={st.label} direction="scale" delay={st.delay}>
              <div
                className="card-hover"
                style={{
                  borderRadius: 12, padding: 24, textAlign: "center",
                  backgroundColor: "#fff", border: "1px solid var(--color-border)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                }}
              >
                <div className="font-playfair" style={{ fontWeight: 700, fontSize: "2rem", marginBottom: 8, color: "var(--color-primary)" }}>
                  {st.isCounter ? (
                    <AnimatedCounter
                      target={st.numericValue!}
                      prefix={st.prefix}
                      suffix={st.suffix}
                    />
                  ) : (
                    <span>{st.value}</span>
                  )}
                </div>
                <p className="font-sans" style={{ fontSize: 12, color: "var(--color-text-gray)", margin: 0 }}>
                  {st.label}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ─── S5: Convergence / Pricing ─── */}
      <section className="py-20 px-6" style={{ backgroundColor: "var(--color-surface)" }}>
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-3 text-center" style={{ color: "var(--color-accent)" }}>
              Ahorra desde el primer mes
            </p>
            <h2 className="font-playfair font-bold text-3xl md:text-4xl text-center mb-4" style={{ color: "var(--color-primary)" }}>
              Cinco herramientas. Una sola plataforma.
            </h2>
            <p className="font-sans font-light text-sm text-center mb-14 max-w-xl mx-auto" style={{ color: "var(--color-text-gray)" }}>
              El traductor jurado medio gasta m&aacute;s de 120&euro;/mes en herramientas fragmentadas.
            </p>
          </ScrollReveal>

          <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "64px", flexWrap: "wrap" }}>
            {/* Tools list */}
            <ScrollReveal direction="left">
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", paddingTop: 32 }}>
                {TOOLS.map((t) => (
                  <div
                    key={t.name}
                    className="font-sans"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                      gap: 32, fontSize: 14, padding: "12px 20px", borderRadius: 8,
                      border: "1px solid var(--color-border)", backgroundColor: "#fff",
                    }}
                  >
                    <span style={{ textDecoration: "line-through", color: "var(--color-text-gray)" }}>{t.name}</span>
                    <span className="font-mono" style={{ fontSize: 12, textDecoration: "line-through", color: "#cc4444" }}>{t.price}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "flex-end", paddingTop: 8, paddingRight: 4 }}>
                  <span className="font-sans" style={{ fontSize: 14, fontWeight: 600, color: "#cc4444" }}>Total: ~123&euro;/mes</span>
                </div>
              </div>
            </ScrollReveal>

            {/* Arrow */}
            <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              <svg width="48" height="24" viewBox="0 0 48 24" fill="none">
                <path d="M0 12H40M40 12L32 4M40 12L32 20" stroke="#C9882A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            {/* MTJ card */}
            <ScrollReveal direction="right">
              <div
                className="gradient-border animate-pulse-glow"
                style={{
                  position: "relative", borderRadius: 16, padding: 32,
                  textAlign: "center", minWidth: 280,
                  backgroundColor: "var(--color-primary)",
                }}
              >
                {/* Badge */}
                <span
                  className="font-mono"
                  style={{
                    position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)",
                    fontSize: 9, textTransform: "uppercase", letterSpacing: "0.1em",
                    padding: "4px 16px", borderRadius: 999,
                    backgroundColor: "var(--color-accent)", color: "#fff",
                    whiteSpace: "nowrap",
                  }}
                >
                  Plan Fundador
                </span>

                <p className="font-mono text-sm line-through mt-4 mb-1" style={{ color: "var(--color-text-muted)" }}>
                  ~123&euro;/mes
                </p>
                <p className="font-playfair font-bold text-5xl mb-1 text-gradient">
                  49&euro;
                </p>
                <p className="font-sans text-xs mb-6" style={{ color: "var(--color-text-muted)" }}>
                  /mes &middot; para siempre
                </p>

                <div className="space-y-2.5 mb-8 text-left">
                  {PLAN_FEATURES.map((f) => (
                    <div key={f} className="flex items-center gap-2.5">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M3 7L6 10L11 4" stroke="#C9882A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="font-sans text-xs" style={{ color: "var(--color-text-light)" }}>{f}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/auth/register"
                  className="block w-full font-sans font-medium text-sm px-6 py-3 rounded-full btn-glow"
                  style={{ backgroundColor: "var(--color-accent)", color: "#fff" }}
                >
                  Empezar ahora &rarr;
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ─── S6: Product Showcase ─── */}
      <section className="py-20 px-6 bg-white">
        <ScrollReveal>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-3 text-center" style={{ color: "var(--color-accent)" }}>
            Tu plataforma
          </p>
          <h2 className="font-playfair font-bold text-3xl md:text-4xl text-center mb-4" style={{ color: "var(--color-primary)" }}>
            Dise&ntilde;ada para traductores jurados
          </h2>
          <p className="font-sans font-light text-sm text-center mb-12 max-w-xl mx-auto" style={{ color: "var(--color-text-gray)" }}>
            Editor bilingüe, dashboard de pedidos y directorio profesional. Todo integrado.
          </p>
        </ScrollReveal>
        <ScrollReveal direction="scale" delay={200}>
          <ProductShowcase />
        </ScrollReveal>
      </section>

      {/* ─── S7: Feature Cards ─── */}
      <section className="py-20 px-6" style={{ backgroundColor: "var(--color-surface)" }}>
        <div className="max-w-5xl mx-auto">
          <ScrollReveal>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: "var(--color-accent)" }}>
              Para traductores jurados
            </p>
            <h2 className="font-playfair font-bold text-3xl mb-12" style={{ color: "var(--color-primary)" }}>
              Herramientas profesionales
            </h2>
          </ScrollReveal>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
            {FEATURE_CARDS.map((c, i) => (
              <ScrollReveal key={c.title} direction="up" delay={i * 100}>
                <div
                  className="card-hover"
                  style={{
                    backgroundColor: "#fff", borderRadius: 12, padding: 24,
                    border: "1px solid var(--color-border)",
                    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      width: 48, height: 48, borderRadius: 10,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      marginBottom: 16,
                      background: "linear-gradient(135deg, #1A3A2A, #2C5F3E)",
                    }}
                  >
                    {c.icon}
                  </div>
                  <h3 className="font-sans font-semibold text-sm mb-2" style={{ color: "var(--color-primary)" }}>
                    {c.title}
                  </h3>
                  <p className="font-sans font-light text-xs leading-relaxed" style={{ color: "var(--color-text-gray)" }}>
                    {c.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── S8: Para Clientes ─── */}
      <section className="py-20 px-6 gradient-mesh-light relative dot-grid-light">
        <div className="relative z-10" style={{ maxWidth: "64rem", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "center" }}>
          <ScrollReveal direction="left">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-3" style={{ color: "var(--color-accent)" }}>
                Para clientes
              </p>
              <h2 className="font-playfair font-bold text-3xl mb-4" style={{ color: "var(--color-primary)" }}>
                Tu traducci&oacute;n jurada, sin intermediarios
              </h2>
              <p className="font-sans font-light text-sm leading-relaxed mb-6" style={{ color: "var(--color-text-gray)" }}>
                Busca entre traductores jurados verificados por el MAEC. Filtra por idioma, provincia y especialidad. Contacta directamente, sin agencias.
              </p>
              <Link
                href="/translators"
                className="inline-block font-sans font-medium text-sm px-6 py-3 rounded-full transition-colors"
                style={{ backgroundColor: "var(--color-primary)", color: "#fff" }}
              >
                Explorar directorio &rarr;
              </Link>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={200}>
            <div className="bg-white rounded-xl border p-5 shadow-lg card-hover" style={{ borderColor: "var(--color-border)" }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex-1 h-9 rounded-lg border px-3 flex items-center gap-2" style={{ borderColor: "var(--color-border)" }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="6" cy="6" r="4" stroke="#999" strokeWidth="1.2" />
                    <path d="M9.5 9.5L12.5 12.5" stroke="#999" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                  <span className="font-sans text-[11px]" style={{ color: "#bbb" }}>Buscar por idioma, ciudad...</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {["Franc\u00e9s", "Madrid", "Jur\u00eddico"].map((pill) => (
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
                  style={{ borderTop: i > 0 ? "1px solid var(--color-border)" : "none" }}
                >
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "var(--color-primary)" }}
                  >
                    <span className="font-sans text-[10px] font-medium" style={{ color: "#fff" }}>
                      {t.name.split(" ").map(n => n[0]).slice(0, 2).join("")}
                    </span>
                  </div>
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
          </ScrollReveal>
        </div>
      </section>

      {/* ─── S9: How It Works ─── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] mb-3 text-center" style={{ color: "var(--color-accent)" }}>
              C&oacute;mo funciona
            </p>
            <h2 className="font-playfair font-bold text-3xl text-center mb-16" style={{ color: "var(--color-primary)" }}>
              Tres pasos simples
            </h2>
          </ScrollReveal>

          {/* Desktop: horizontal timeline */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "32px", position: "relative" }}>
            {/* Connecting line */}
            <div
              className="absolute top-8 left-[16.67%] right-[16.67%] h-0.5"
              style={{ backgroundColor: "var(--color-border)" }}
            />
            {STEPS.map((step, i) => (
              <ScrollReveal key={step.title} direction="up" delay={i * 150}>
                <div className="text-center relative">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10"
                    style={{
                      background: "linear-gradient(135deg, var(--color-accent), #D4A04A)",
                      boxShadow: "0 4px 20px rgba(201,136,42,0.3)",
                    }}
                  >
                    <span className="font-playfair font-bold text-xl" style={{ color: "#fff" }}>{i + 1}</span>
                  </div>
                  <h3 className="font-sans font-semibold text-sm mb-2" style={{ color: "var(--color-primary)" }}>
                    {step.title}
                  </h3>
                  <p className="font-sans font-light text-xs leading-relaxed" style={{ color: "var(--color-text-gray)" }}>
                    {step.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Mobile: vertical */}
          <div className="md:hidden space-y-0">
            {STEPS.map((step, i) => (
              <ScrollReveal key={step.title} direction="up" delay={i * 100}>
                <div className="flex gap-5">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, var(--color-accent), #D4A04A)" }}
                    >
                      <span className="font-playfair font-bold text-sm" style={{ color: "#fff" }}>{i + 1}</span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className="w-px flex-1 my-2" style={{ backgroundColor: "var(--color-border)" }} />
                    )}
                  </div>
                  <div className="pb-8">
                    <h3 className="font-sans font-semibold text-sm mb-1" style={{ color: "var(--color-primary)" }}>
                      {step.title}
                    </h3>
                    <p className="font-sans font-light text-xs leading-relaxed" style={{ color: "var(--color-text-gray)" }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── S10: CTA Band ─── */}
      <section className="relative py-20 px-6 gradient-mesh-dark dot-grid overflow-hidden">
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <ScrollReveal>
            <span
              className="inline-block font-mono text-[9px] uppercase tracking-wider px-4 py-1.5 rounded-full mb-6"
              style={{ backgroundColor: "rgba(201,136,42,0.2)", color: "var(--color-accent)" }}
            >
              Plazas limitadas
            </span>
            <h2 className="font-playfair font-bold text-3xl md:text-4xl mb-3" style={{ color: "var(--color-text-light)" }}>
              Plan Fundador: 49&euro;/mes
            </h2>
            <p className="font-playfair italic text-lg mb-2 text-gradient">
              para siempre
            </p>
            <p className="font-sans font-light text-sm mb-10 max-w-md mx-auto" style={{ color: "rgba(255,255,255,0.6)" }}>
              Precio de lanzamiento exclusivo para los primeros suscriptores. Una vez que se cierre, no volver&aacute; a estar disponible.
            </p>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
              <Link
                href="/auth/register"
                className="font-sans btn-glow"
                style={{
                  display: "inline-block", fontWeight: 500, fontSize: 14,
                  padding: "14px 32px", borderRadius: 999,
                  backgroundColor: "var(--color-accent)", color: "#fff",
                  textDecoration: "none", boxShadow: "0 4px 20px rgba(201,136,42,0.3)",
                }}
              >
                Reservar mi plaza &rarr;
              </Link>
              <Link
                href="/translators"
                className="font-sans"
                style={{
                  display: "inline-block", fontWeight: 500, fontSize: 14,
                  padding: "14px 32px", borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.25)",
                  color: "rgba(255,255,255,0.85)", textDecoration: "none",
                }}
              >
                Soy cliente
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ─── S11: Footer ─── */}
      <footer
        className="py-16 px-6"
        style={{ backgroundColor: "var(--color-footer)" }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Top row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "40px", marginBottom: "48px" }}>
            {/* Col 1: Logo + tagline */}
            <div>
              <Logo size="sm" variant="dark" />
              <p className="font-playfair italic text-xs mt-4 leading-relaxed" style={{ color: "rgba(255,255,255,0.3)" }}>
                Hecho por traductores,
                <br />
                para traductores.
              </p>
            </div>
            {/* Col 2: Plataforma */}
            <div>
              <p className="font-mono text-[9px] uppercase tracking-wider mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
                Plataforma
              </p>
              <div className="space-y-2.5">
                {[
                  { label: "Directorio", href: "/translators" },
                  { label: "Acceder", href: "/auth/login" },
                  { label: "Registrarse", href: "/auth/register" },
                ].map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block font-sans text-xs transition-colors"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            {/* Col 3: Legal */}
            <div>
              <p className="font-mono text-[9px] uppercase tracking-wider mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
                Legal
              </p>
              <div className="space-y-2.5">
                {[
                  { label: "Aviso legal", href: "#" },
                  { label: "Pol\u00edtica de privacidad", href: "#" },
                  { label: "Condiciones de uso", href: "#" },
                ].map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block font-sans text-xs transition-colors"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            {/* Col 4: Confianza */}
            <div>
              <p className="font-mono text-[9px] uppercase tracking-wider mb-4" style={{ color: "rgba(255,255,255,0.4)" }}>
                Confianza
              </p>
              <div className="space-y-3">
                {[
                  "Registro MAEC oficial",
                  "Firma eIDAS cualificada",
                  "Facturación Verifactu",
                  "Pagos Stripe Connect",
                ].map((badge) => (
                  <div key={badge} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "var(--color-accent)" }} />
                    <span className="font-sans text-[10px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Divider + copyright */}
          <div className="pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <p className="font-sans font-light text-[10px]" style={{ color: "rgba(255,255,255,0.25)" }}>
              &copy; {new Date().getFullYear()} HBTJ Consultores Lingüísticos S.L. &middot; CIF: B-XXXXXXXX
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ─── Data ─── */

const FEATURE_PILLS = [
  "Editor + DeepL",
  "Firma eIDAS",
  "Verifactu AEAT",
  "Red de colegas",
  "Stripe Connect",
];

const TRUST_BADGES = [
  {
    label: "MAEC",
    sub: "10.624 traductores",
    delay: 0,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke="#1A3A2A" strokeWidth="1.5" />
        <circle cx="10" cy="10" r="2.5" fill="#1A3A2A" />
      </svg>
    ),
  },
  {
    label: "eIDAS",
    sub: "Firma cualificada",
    delay: 100,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M5 10L8.5 13.5L15 6.5" stroke="#1A3A2A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    label: "Verifactu",
    sub: "AEAT 2027",
    delay: 200,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="4" y="3" width="12" height="14" rx="1.5" stroke="#1A3A2A" strokeWidth="1.5" />
        <line x1="7" y1="7" x2="13" y2="7" stroke="#1A3A2A" strokeWidth="1" strokeLinecap="round" />
        <line x1="7" y1="10" x2="13" y2="10" stroke="#1A3A2A" strokeWidth="1" strokeLinecap="round" />
        <line x1="7" y1="13" x2="11" y2="13" stroke="#1A3A2A" strokeWidth="1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    label: "Stripe",
    sub: "Pagos seguros",
    delay: 300,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="5" width="16" height="10" rx="2" stroke="#1A3A2A" strokeWidth="1.5" />
        <line x1="2" y1="9" x2="18" y2="9" stroke="#1A3A2A" strokeWidth="1.5" />
      </svg>
    ),
  },
];

const STATS = [
  { value: "10.624", label: "traductores MAEC", isCounter: true, numericValue: 10624, prefix: "", suffix: "", delay: 0 },
  { value: "32+", label: "idiomas oficiales", isCounter: true, numericValue: 32, prefix: "", suffix: "+", delay: 100 },
  { value: "52", label: "provincias cubiertas", isCounter: true, numericValue: 52, prefix: "", suffix: "", delay: 200 },
  { value: "49\u20AC", label: "precio fundador/mes", isCounter: true, numericValue: 49, prefix: "", suffix: "\u20AC", delay: 300 },
];

const TOOLS = [
  { name: "Adobe Acrobat", price: "25\u20AC/mes" },
  { name: "DeepL Pro", price: "22\u20AC/mes" },
  { name: "SDL Trados", price: "45\u20AC/mes" },
  { name: "Signaturit", price: "19\u20AC/mes" },
  { name: "App facturaci\u00f3n", price: "12\u20AC/mes" },
];

const PLAN_FEATURES = [
  "Editor bilingüe + DeepL integrado",
  "Firma electr\u00f3nica eIDAS cualificada",
  "Facturaci\u00f3n Verifactu AEAT",
  "Cobros Stripe Connect",
  "Red de colegas + delegaci\u00f3n",
  "Widget embebible para tu web",
  "35 plantillas de documentos",
  "Soporte prioritario",
];

const FEATURE_CARDS = [
  {
    title: "Dashboard de pedidos",
    desc: "Gestiona presupuestos, aceptaci\u00f3n, seguimiento y entrega. Todo el flujo del pedido en un solo lugar.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="16" rx="2" stroke="#fff" strokeWidth="1.5" />
        <line x1="3" y1="10" x2="21" y2="10" stroke="#fff" strokeWidth="1.5" />
        <line x1="9" y1="10" x2="9" y2="20" stroke="#fff" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: "Editor bilingüe + DeepL",
    desc: "Editor de traducci\u00f3n con segmentos paralelos, traducci\u00f3n autom\u00e1tica integrada y control de progreso.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="2" y="3" width="8" height="18" rx="1" stroke="#fff" strokeWidth="1.5" />
        <rect x="14" y="3" width="8" height="18" rx="1" stroke="#fff" strokeWidth="1.5" />
        <path d="M10 10L14 12L10 14" stroke="#C9882A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Firma eIDAS + Verifactu",
    desc: "Firma electr\u00f3nica cualificada y facturaci\u00f3n Verifactu AEAT integradas. Cumplimiento autom\u00e1tico.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M5 12L9.5 16.5L19 7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="9.5" stroke="#fff" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: "Red de colegas",
    desc: "Delega pedidos a colegas de confianza. El cliente siempre contrata contigo, t\u00fa gestionas la asignaci\u00f3n.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8" r="3.5" stroke="#fff" strokeWidth="1.5" />
        <circle cx="5" cy="17" r="2.5" stroke="#fff" strokeWidth="1.2" />
        <circle cx="19" cy="17" r="2.5" stroke="#fff" strokeWidth="1.2" />
        <path d="M8.5 11L5 14.5M15.5 11L19 14.5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Widget embebible",
    desc: "A\u00f1ade un formulario de contacto a tu web personal. Los clientes te solicitan presupuesto directamente.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" rx="2" stroke="#fff" strokeWidth="1.5" />
        <path d="M8 9L5 12L8 15" stroke="#C9882A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M16 9L19 12L16 15" stroke="#C9882A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Plantillas de documentos",
    desc: "35 plantillas predefinidas para los documentos m\u00e1s comunes: actas, certificados, poderes, contratos y m\u00e1s.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="5" y="2" width="14" height="18" rx="1.5" stroke="#fff" strokeWidth="1.5" />
        <line x1="8" y1="7" x2="16" y2="7" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
        <line x1="8" y1="10" x2="16" y2="10" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
        <line x1="8" y1="13" x2="13" y2="13" stroke="#fff" strokeWidth="1" strokeLinecap="round" />
        <rect x="3" y="4" width="14" height="18" rx="1.5" stroke="#fff" strokeWidth="1" opacity="0.3" />
      </svg>
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
    desc: "Env\u00eda tu documento y recibe un presupuesto detallado directamente del traductor. Sin intermediarios.",
  },
  {
    title: "Recibe tu traducci\u00f3n",
    desc: "El traductor trabaja con herramientas profesionales. Recibes la traducci\u00f3n firmada electr\u00f3nicamente con validez eIDAS.",
  },
];
