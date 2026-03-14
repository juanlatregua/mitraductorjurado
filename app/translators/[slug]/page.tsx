import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { LANG_NAMES, CATEGORY_NAMES } from "@/lib/constants";
import { isCuid, parseSlugMaecNumber, generateTranslatorSlug } from "@/lib/slug";

interface Props {
  params: { slug: string };
}

/**
 * Resolve a translator profile from a slug or legacy cuid.
 *
 * Strategy:
 * 1. If the param looks like a cuid, query by profile.id first, then by userId.
 * 2. Otherwise, parse the MAEC digits from the end of the slug and query by maecNumber.
 */
async function getTranslator(slugOrId: string) {
  const include = {
    user: { select: { name: true, image: true } },
    languagePairs: true,
    specialties: true,
  } as const;

  if (isCuid(slugOrId)) {
    // Legacy URL with cuid — try profile id first, then userId
    const byId = await prisma.translatorProfile.findUnique({
      where: { id: slugOrId },
      include,
    });
    if (byId) return byId;

    return prisma.translatorProfile.findUnique({
      where: { userId: slugOrId },
      include,
    });
  }

  // SEO slug — extract MAEC digits from the end
  const digits = parseSlugMaecNumber(slugOrId);
  if (!digits) return null;

  // maecNumber in DB is stored as "N.3850"
  const maecNumber = `N.${digits}`;

  return prisma.translatorProfile.findFirst({
    where: { maecNumber },
    include,
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const translator = await getTranslator(params.slug);
  if (!translator) return { title: "Traductor no encontrado" };

  const name = translator.user.name || "Traductor jurado";
  const langs = translator.languagePairs
    .map((lp) => `${LANG_NAMES[lp.sourceLang] || lp.sourceLang} \u2192 ${LANG_NAMES[lp.targetLang] || lp.targetLang}`)
    .join(", ");

  return {
    title: `${name} \u2014 Traductor Jurado ${translator.maecNumber} | mitraductorjurado.es`,
    description: `${name}, Traductor-Int\u00e9rprete Jurado (${translator.maecNumber}). ${langs}. ${translator.province || "Espa\u00f1a"}.`,
  };
}

export default async function TranslatorPublicProfile({ params }: Props) {
  const translator = await getTranslator(params.slug);
  if (!translator) notFound();

  // If accessed via legacy cuid, redirect to canonical slug URL for SEO
  const name = translator.user.name || "Traductor jurado";
  const canonicalSlug = generateTranslatorSlug(name, translator.maecNumber);

  if (isCuid(params.slug) && canonicalSlug) {
    redirect(`/translators/${canonicalSlug}`);
  }

  return (
    <div className="min-h-screen bg-navy-50">
      {/* Header */}
      <header className="bg-navy-900 text-white py-4 px-6">
        <a href="/" className="text-lg font-bold">
          mitraductorjurado<span className="text-accent-400">.es</span>
        </a>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Perfil header */}
        <div className="bg-white rounded-xl border border-navy-100 p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Foto */}
            <div className="w-28 h-28 rounded-full bg-navy-200 overflow-hidden flex-shrink-0">
              {translator.photoUrl ? (
                <img
                  src={translator.photoUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl text-navy-400">
                  {"\uD83D\uDC64"}
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-navy-900">{name}</h1>
                {translator.verified && (
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                    MAEC Verificado
                  </span>
                )}
              </div>

              <p className="text-navy-500 mb-3">
                Traductor-Int&eacute;rprete Jurado {translator.maecNumber}
                {translator.province && ` \u00b7 ${translator.province}`}
              </p>

              {/* Idiomas */}
              <div className="flex flex-wrap gap-2 mb-4">
                {translator.languagePairs.map((lp) => (
                  <span
                    key={lp.id}
                    className="bg-navy-100 text-navy-700 text-sm font-medium px-3 py-1 rounded-full"
                  >
                    {LANG_NAMES[lp.sourceLang] || lp.sourceLang} {"\u2192"}{" "}
                    {LANG_NAMES[lp.targetLang] || lp.targetLang}
                  </span>
                ))}
              </div>

              {/* Tarifas */}
              {(translator.ratePerWord || translator.rateMinimum) && (
                <div className="flex gap-6 text-sm">
                  {translator.ratePerWord && (
                    <div>
                      <span className="text-navy-500">Tarifa/palabra: </span>
                      <span className="font-semibold text-navy-900">
                        {translator.ratePerWord.toFixed(2)} &euro;
                      </span>
                    </div>
                  )}
                  {translator.rateMinimum && (
                    <div>
                      <span className="text-navy-500">M&iacute;nimo: </span>
                      <span className="font-semibold text-navy-900">
                        {translator.rateMinimum.toFixed(0)} &euro;
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Rating */}
              {translator.reviewCount > 0 && (
                <div className="flex items-center gap-2 mt-3 text-sm">
                  <span className="text-amber-500">
                    {"\u2605".repeat(Math.round(translator.avgRating))}
                    {"\u2606".repeat(5 - Math.round(translator.avgRating))}
                  </span>
                  <span className="text-navy-500">
                    {translator.avgRating.toFixed(1)} ({translator.reviewCount}{" "}
                    {translator.reviewCount === 1 ? "valoraci\u00f3n" : "valoraciones"})
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bio */}
        {translator.bio && (
          <div className="bg-white rounded-xl border border-navy-100 p-8 mb-6">
            <h2 className="text-lg font-bold text-navy-900 mb-3">
              Sobre m&iacute;
            </h2>
            <p className="text-navy-600 whitespace-pre-line">{translator.bio}</p>
          </div>
        )}

        {/* Especialidades */}
        {translator.specialties.length > 0 && (
          <div className="bg-white rounded-xl border border-navy-100 p-8 mb-6">
            <h2 className="text-lg font-bold text-navy-900 mb-3">
              Especialidades
            </h2>
            <div className="flex flex-wrap gap-2">
              {translator.specialties.map((s) => (
                <span
                  key={s.id}
                  className="bg-accent-50 text-accent-700 text-sm font-medium px-3 py-1.5 rounded-full"
                >
                  {CATEGORY_NAMES[s.category] || s.category}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="bg-accent-50 rounded-xl border border-accent-200 p-8 text-center">
          <h2 className="text-xl font-bold text-navy-900 mb-2">
            &iquest;Necesitas una traducci&oacute;n jurada?
          </h2>
          <p className="text-navy-500 mb-4">
            Solicita presupuesto sin compromiso.
          </p>
          <a
            href="/auth/register"
            className="inline-block bg-accent-500 hover:bg-accent-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Solicitar presupuesto
          </a>
        </div>
      </main>
    </div>
  );
}
