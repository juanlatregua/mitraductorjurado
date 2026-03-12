"use client";

import { useState, useEffect } from "react";
import { LANG_NAMES } from "@/lib/constants";

interface Colleague {
  userId: string;
  name: string;
  maecNumber: string;
  verified: boolean;
  province: string | null;
  photoUrl: string | null;
  ratePerWord: number | null;
  rateMinimum: number | null;
  avgRating: number;
  availabilityStatus: string;
  languagePairs: { sourceLang: string; targetLang: string }[];
}

const AVAILABILITY_LABELS: Record<string, { label: string; color: string }> = {
  available: { label: "Disponible", color: "bg-green-100 text-green-700" },
  busy: { label: "Ocupado", color: "bg-amber-100 text-amber-700" },
  vacation: { label: "Vacaciones", color: "bg-navy-100 text-navy-500" },
};

export default function ColleaguesPage() {
  const [colleagues, setColleagues] = useState<Colleague[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLang, setFilterLang] = useState("");

  useEffect(() => {
    const params = filterLang ? `?sourceLang=${filterLang}` : "";
    fetch(`/api/colleagues${params}`)
      .then((res) => res.json())
      .then((data) => {
        setColleagues(data.colleagues || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filterLang]);

  const LANGUAGES = Object.entries(LANG_NAMES).filter(([c]) => c !== "es");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900">Red de colegas</h1>
        <p className="text-navy-500 mt-1">
          Traductores disponibles para derivaciones
        </p>
      </div>

      {/* Filtro por idioma */}
      <div className="mb-6">
        <select
          value={filterLang}
          onChange={(e) => {
            setFilterLang(e.target.value);
            setLoading(true);
          }}
          className="border border-navy-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-400"
        >
          <option value="">Todos los idiomas</option>
          {LANGUAGES.map(([code, name]) => (
            <option key={code} value={code}>{name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse h-40 bg-navy-100 rounded-xl" />
          ))}
        </div>
      ) : colleagues.length === 0 ? (
        <div className="bg-white rounded-xl border border-navy-100 p-12 text-center">
          <p className="text-4xl mb-4">🤝</p>
          <h3 className="text-lg font-semibold text-navy-900 mb-2">
            No se encontraron colegas
          </h3>
          <p className="text-navy-500">
            {filterLang
              ? "No hay colegas disponibles para este idioma."
              : "Aún no hay otros traductores disponibles en la plataforma."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {colleagues.map((c) => {
            const avail = AVAILABILITY_LABELS[c.availabilityStatus] || AVAILABILITY_LABELS.available;
            return (
              <div
                key={c.userId}
                className="bg-white rounded-xl border border-navy-100 p-5 hover:border-accent-300 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-navy-200 overflow-hidden flex-shrink-0">
                    {c.photoUrl ? (
                      <img src={c.photoUrl} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl text-navy-400">
                        👤
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-navy-900 truncate">{c.name}</span>
                      {c.verified && (
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                          MAEC ✓
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-navy-500">
                      {c.maecNumber} · {c.province || "España"}
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${avail.color}`}>
                    {avail.label}
                  </span>
                </div>

                {/* Idiomas */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {c.languagePairs.map((lp, i) => (
                    <span key={i} className="bg-navy-100 text-navy-700 text-xs px-2 py-0.5 rounded-full">
                      {LANG_NAMES[lp.sourceLang] || lp.sourceLang} → {LANG_NAMES[lp.targetLang] || lp.targetLang}
                    </span>
                  ))}
                </div>

                {/* Tarifas */}
                <div className="text-xs text-navy-500">
                  {c.rateMinimum && <span>Mínimo: {c.rateMinimum}€</span>}
                  {c.ratePerWord && <span> · {c.ratePerWord}€/palabra</span>}
                  {c.avgRating > 0 && (
                    <span> · ★ {c.avgRating.toFixed(1)}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
