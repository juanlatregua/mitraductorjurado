import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { TranslatorCard } from "@/components/translators/translator-card";
import { SearchFilters } from "@/components/translators/search-filters";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Directorio de traductores jurados — mitraductorjurado.es",
  description:
    "Encuentra traductores jurados MAEC en España. Filtra por idioma, especialidad, provincia y disponibilidad.",
};

const PAGE_SIZE = 12;

interface Props {
  searchParams: {
    idioma?: string;
    provincia?: string;
    especialidad?: string | string[];
    disponibilidad?: string;
    q?: string;
    page?: string;
  };
}

function buildWhere(searchParams: Props["searchParams"]): Prisma.TranslatorProfileWhereInput {
  const where: Prisma.TranslatorProfileWhereInput = {};

  // Solo perfiles con nombre (onboarded)
  where.user = { name: { not: null } };

  // Idioma: filtrar por sourceLang en LanguagePair
  if (searchParams.idioma) {
    where.languagePairs = {
      some: { sourceLang: searchParams.idioma },
    };
  }

  // Provincia
  if (searchParams.provincia) {
    where.province = searchParams.provincia;
  }

  // Especialidades (pueden ser múltiples)
  const especialidades = Array.isArray(searchParams.especialidad)
    ? searchParams.especialidad
    : searchParams.especialidad
      ? [searchParams.especialidad]
      : [];

  if (especialidades.length > 0) {
    where.specialties = {
      some: { category: { in: especialidades as any } },
    };
  }

  // Disponibilidad
  if (searchParams.disponibilidad) {
    where.availabilityStatus = searchParams.disponibilidad as any;
  }

  // Búsqueda por nombre
  if (searchParams.q) {
    where.user = {
      ...where.user as any,
      name: { contains: searchParams.q, mode: "insensitive" },
    };
  }

  return where;
}

export default async function TranslatorDirectory({ searchParams }: Props) {
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const where = buildWhere(searchParams);

  const [translators, total] = await Promise.all([
    prisma.translatorProfile.findMany({
      where,
      include: {
        user: { select: { name: true, image: true } },
        languagePairs: { select: { sourceLang: true, targetLang: true } },
        specialties: { select: { category: true } },
      },
      orderBy: [
        { verified: "desc" },
        { avgRating: "desc" },
        { reviewCount: "desc" },
      ],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.translatorProfile.count({ where }),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="min-h-screen bg-navy-50">
      {/* Header */}
      <header className="bg-navy-900 text-white py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="text-lg font-bold">
            mitraductorjurado<span className="text-accent-400">.es</span>
          </Link>
          <Link
            href="/auth/login"
            className="text-sm text-navy-300 hover:text-white transition-colors"
          >
            Acceder
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Título */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">
            Directorio de traductores jurados
          </h1>
          <p className="text-navy-500">
            {total} {total === 1 ? "traductor encontrado" : "traductores encontrados"}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filtros */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-xl border border-navy-100 p-6 lg:sticky lg:top-6">
              <h2 className="font-bold text-navy-900 mb-4">Filtros</h2>
              <SearchFilters />
            </div>
          </aside>

          {/* Grid de resultados */}
          <div className="flex-1">
            {translators.length === 0 ? (
              <div className="bg-white rounded-xl border border-navy-100 p-12 text-center">
                <p className="text-4xl mb-4">🔍</p>
                <h3 className="text-lg font-semibold text-navy-900 mb-2">
                  No se encontraron traductores
                </h3>
                <p className="text-navy-500">
                  Prueba con otros filtros o amplía tu búsqueda.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {translators.map((t) => (
                    <TranslatorCard
                      key={t.id}
                      id={t.id}
                      name={t.user.name || "Traductor jurado"}
                      photoUrl={t.photoUrl}
                      maecNumber={t.maecNumber}
                      province={t.province}
                      verified={t.verified}
                      avgRating={t.avgRating}
                      reviewCount={t.reviewCount}
                      availabilityStatus={t.availabilityStatus}
                      languagePairs={t.languagePairs}
                      specialties={t.specialties}
                    />
                  ))}
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    searchParams={searchParams}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Pagination({
  currentPage,
  totalPages,
  searchParams,
}: {
  currentPage: number;
  totalPages: number;
  searchParams: Props["searchParams"];
}) {
  function buildPageUrl(page: number) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (key === "page") continue;
      if (Array.isArray(value)) {
        value.forEach((v) => params.append(key, v));
      } else if (value) {
        params.set(key, value);
      }
    }
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return `/translators${qs ? `?${qs}` : ""}`;
  }

  return (
    <nav className="flex items-center justify-center gap-2 mt-8">
      {currentPage > 1 && (
        <Link
          href={buildPageUrl(currentPage - 1)}
          className="px-4 py-2 text-sm font-medium text-navy-700 bg-white border border-navy-200 rounded-lg hover:bg-navy-50"
        >
          Anterior
        </Link>
      )}

      <span className="px-4 py-2 text-sm text-navy-500">
        Página {currentPage} de {totalPages}
      </span>

      {currentPage < totalPages && (
        <Link
          href={buildPageUrl(currentPage + 1)}
          className="px-4 py-2 text-sm font-medium text-navy-700 bg-white border border-navy-200 rounded-lg hover:bg-navy-50"
        >
          Siguiente
        </Link>
      )}
    </nav>
  );
}
