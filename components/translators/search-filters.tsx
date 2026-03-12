"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, Suspense } from "react";
import { LANG_NAMES, CATEGORY_NAMES, PROVINCES } from "@/lib/constants";

const SPECIALTIES = Object.entries(CATEGORY_NAMES);
const LANGUAGES = Object.entries(LANG_NAMES).filter(([code]) => code !== "es");

function SearchFiltersInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentLang = searchParams.get("idioma") || "";
  const currentProvince = searchParams.get("provincia") || "";
  const currentSpecialties = searchParams.getAll("especialidad");
  const currentAvailability = searchParams.get("disponibilidad") || "";
  const currentSearch = searchParams.get("q") || "";

  const updateParams = useCallback(
    (updates: Record<string, string | string[] | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        params.delete(key);
        if (value === null || value === "") continue;
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v));
        } else {
          params.set(key, value);
        }
      }

      // Reset page when filters change
      params.delete("page");

      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  const handleSpecialtyToggle = (category: string) => {
    const updated = currentSpecialties.includes(category)
      ? currentSpecialties.filter((s) => s !== category)
      : [...currentSpecialties, category];
    updateParams({ especialidad: updated.length > 0 ? updated : null });
  };

  const clearAll = () => {
    router.push(pathname, { scroll: false });
  };

  const hasFilters = currentLang || currentProvince || currentSpecialties.length > 0 || currentAvailability || currentSearch;

  return (
    <div className="space-y-6">
      {/* Búsqueda por texto */}
      <div>
        <label className="block text-sm font-semibold text-navy-900 mb-2">
          Buscar
        </label>
        <input
          type="text"
          placeholder="Nombre del traductor..."
          defaultValue={currentSearch}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateParams({ q: (e.target as HTMLInputElement).value || null });
            }
          }}
          className="w-full border border-navy-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 focus:border-transparent"
        />
      </div>

      {/* Idioma */}
      <div>
        <label className="block text-sm font-semibold text-navy-900 mb-2">
          Idioma
        </label>
        <select
          value={currentLang}
          onChange={(e) => updateParams({ idioma: e.target.value || null })}
          className="w-full border border-navy-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-400"
        >
          <option value="">Todos los idiomas</option>
          {LANGUAGES.map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>
      </div>

      {/* Provincia */}
      <div>
        <label className="block text-sm font-semibold text-navy-900 mb-2">
          Provincia
        </label>
        <select
          value={currentProvince}
          onChange={(e) => updateParams({ provincia: e.target.value || null })}
          className="w-full border border-navy-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent-400"
        >
          <option value="">Toda España</option>
          {PROVINCES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Especialidades */}
      <div>
        <label className="block text-sm font-semibold text-navy-900 mb-2">
          Especialidades
        </label>
        <div className="space-y-2">
          {SPECIALTIES.map(([value, label]) => (
            <label key={value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={currentSpecialties.includes(value)}
                onChange={() => handleSpecialtyToggle(value)}
                className="rounded border-navy-300 text-accent-500 focus:ring-accent-400"
              />
              <span className="text-sm text-navy-700">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Disponibilidad */}
      <div>
        <label className="block text-sm font-semibold text-navy-900 mb-2">
          Disponibilidad
        </label>
        <div className="flex flex-col gap-1.5">
          {[
            { value: "", label: "Todos" },
            { value: "available", label: "Disponible" },
            { value: "busy", label: "Ocupado" },
          ].map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="disponibilidad"
                checked={currentAvailability === opt.value}
                onChange={() => updateParams({ disponibilidad: opt.value || null })}
                className="border-navy-300 text-accent-500 focus:ring-accent-400"
              />
              <span className="text-sm text-navy-700">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Limpiar filtros */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="w-full text-sm text-accent-600 hover:text-accent-700 font-medium py-2 border border-accent-200 rounded-lg hover:bg-accent-50 transition-colors"
        >
          Limpiar filtros
        </button>
      )}
    </div>
  );
}

export function SearchFilters() {
  return (
    <Suspense fallback={<div className="animate-pulse space-y-6">
      {[1,2,3,4].map(i => <div key={i} className="h-16 bg-navy-100 rounded-lg" />)}
    </div>}>
      <SearchFiltersInner />
    </Suspense>
  );
}
