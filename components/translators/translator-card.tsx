import Link from "next/link";
import { LANG_NAMES, CATEGORY_NAMES } from "@/lib/constants";

interface TranslatorCardProps {
  id: string;
  name: string;
  photoUrl: string | null;
  maecNumber: string;
  province: string | null;
  verified: boolean;
  avgRating: number;
  reviewCount: number;
  availabilityStatus: string;
  languagePairs: { sourceLang: string; targetLang: string }[];
  specialties: { category: string }[];
}

const AVAILABILITY_LABELS: Record<string, { label: string; color: string }> = {
  available: { label: "Disponible", color: "bg-green-100 text-green-700" },
  busy: { label: "Ocupado", color: "bg-amber-100 text-amber-700" },
  vacation: { label: "Vacaciones", color: "bg-navy-100 text-navy-500" },
};

export function TranslatorCard({
  id, name, photoUrl, maecNumber, province, verified,
  avgRating, reviewCount, availabilityStatus, languagePairs, specialties,
}: TranslatorCardProps) {
  const availability = AVAILABILITY_LABELS[availabilityStatus] || AVAILABILITY_LABELS.available;

  return (
    <Link
      href={`/translators/${id}`}
      className="block bg-white rounded-xl border border-navy-100 p-6 hover:border-accent-300 hover:shadow-md transition-all"
    >
      <div className="flex gap-4 items-start">
        {/* Foto */}
        <div className="w-16 h-16 rounded-full bg-navy-200 overflow-hidden flex-shrink-0">
          {photoUrl ? (
            <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl text-navy-400">
              👤
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Nombre + badges */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-bold text-navy-900 truncate">{name}</h3>
            {verified && (
              <span className="inline-flex items-center bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
                MAEC ✓
              </span>
            )}
            <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${availability.color}`}>
              {availability.label}
            </span>
          </div>

          {/* MAEC + provincia */}
          <p className="text-sm text-navy-500 mb-2">
            {maecNumber}
            {province && ` · ${province}`}
          </p>

          {/* Idiomas */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {languagePairs.slice(0, 3).map((lp, i) => (
              <span
                key={i}
                className="bg-navy-100 text-navy-700 text-xs font-medium px-2 py-0.5 rounded-full"
              >
                {LANG_NAMES[lp.sourceLang] || lp.sourceLang} → {LANG_NAMES[lp.targetLang] || lp.targetLang}
              </span>
            ))}
            {languagePairs.length > 3 && (
              <span className="text-xs text-navy-400">+{languagePairs.length - 3}</span>
            )}
          </div>

          {/* Especialidades */}
          {specialties.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {specialties.map((s, i) => (
                <span
                  key={i}
                  className="bg-accent-50 text-accent-700 text-xs px-2 py-0.5 rounded-full"
                >
                  {CATEGORY_NAMES[s.category] || s.category}
                </span>
              ))}
            </div>
          )}

          {/* Rating */}
          {reviewCount > 0 && (
            <div className="flex items-center gap-1 text-xs text-navy-500">
              <span className="text-amber-500">
                {"★".repeat(Math.round(avgRating))}
                {"☆".repeat(5 - Math.round(avgRating))}
              </span>
              <span>
                {avgRating.toFixed(1)} ({reviewCount})
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
