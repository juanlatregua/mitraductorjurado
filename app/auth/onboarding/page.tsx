"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { useSession } from "next-auth/react";

const MAEC_REGEX = /^N\.\d{1,5}$/;

const PROVINCES = [
  "A Coruña", "Álava", "Albacete", "Alicante", "Almería", "Asturias",
  "Ávila", "Badajoz", "Barcelona", "Burgos", "Cáceres", "Cádiz",
  "Cantabria", "Castellón", "Ciudad Real", "Córdoba", "Cuenca",
  "Girona", "Granada", "Guadalajara", "Gipuzkoa", "Huelva", "Huesca",
  "Illes Balears", "Jaén", "Las Palmas", "León", "Lleida", "Lugo",
  "Madrid", "Málaga", "Murcia", "Navarra", "Ourense", "Palencia",
  "Pontevedra", "La Rioja", "Salamanca", "Santa Cruz de Tenerife",
  "Segovia", "Sevilla", "Soria", "Tarragona", "Teruel", "Toledo",
  "Valencia", "Valladolid", "Bizkaia", "Zamora", "Zaragoza",
];

const LANGUAGES = [
  { code: "fr", name: "Francés" },
  { code: "en", name: "Inglés" },
  { code: "de", name: "Alemán" },
  { code: "it", name: "Italiano" },
  { code: "pt", name: "Portugués" },
  { code: "ar", name: "Árabe" },
  { code: "zh", name: "Chino" },
  { code: "ja", name: "Japonés" },
  { code: "ru", name: "Ruso" },
  { code: "ro", name: "Rumano" },
  { code: "pl", name: "Polaco" },
  { code: "nl", name: "Neerlandés" },
  { code: "ca", name: "Catalán" },
  { code: "eu", name: "Euskera" },
  { code: "gl", name: "Gallego" },
];

const SPECIALTIES = [
  { value: "academico", label: "Académico" },
  { value: "notarial", label: "Notarial" },
  { value: "administrativo", label: "Administrativo" },
  { value: "economico", label: "Económico" },
  { value: "juridico", label: "Jurídico" },
];

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  );
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
              i + 1 <= current
                ? "bg-accent-500 text-white"
                : "bg-navy-100 text-navy-400"
            }`}
          >
            {i + 1 < current ? "✓" : i + 1}
          </div>
          {i < total - 1 && (
            <div
              className={`w-8 h-0.5 ${
                i + 1 < current ? "bg-accent-500" : "bg-navy-100"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function OnboardingContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role") || "client";
  const router = useRouter();
  const { update } = useSession();

  if (role === "translator") {
    return <TranslatorOnboarding router={router} update={update} />;
  }
  return <ClientOnboarding router={router} update={update} />;
}

function TranslatorOnboarding({
  router,
  update,
}: {
  router: ReturnType<typeof useRouter>;
  update: ReturnType<typeof useSession>["update"];
}) {
  const [name, setName] = useState("");
  const [maecNumber, setMaecNumber] = useState("");
  const [maecTouched, setMaecTouched] = useState(false);
  const [province, setProvince] = useState("");
  const [langPairs, setLangPairs] = useState([
    { sourceLang: "", targetLang: "es" },
  ]);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const maecValid = MAEC_REGEX.test(maecNumber);
  const maecError = maecTouched && maecNumber.length > 0 && !maecValid;

  function addLangPair() {
    setLangPairs([...langPairs, { sourceLang: "", targetLang: "es" }]);
  }

  function removeLangPair(index: number) {
    if (langPairs.length > 1) {
      setLangPairs(langPairs.filter((_, i) => i !== index));
    }
  }

  function toggleSpecialty(value: string) {
    setSpecialties((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate MAEC format
    if (!maecValid) {
      setError("El número MAEC debe tener el formato N.1234 (ej: N.3850)");
      setLoading(false);
      return;
    }

    // Filter valid pairs and deduplicate
    const validPairs = langPairs.filter((lp) => lp.sourceLang);
    const seen = new Set<string>();
    const uniquePairs = validPairs.filter((lp) => {
      const key = `${lp.sourceLang}-${lp.targetLang}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    if (uniquePairs.length === 0) {
      setError("Añade al menos un par de idiomas");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: "translator",
        name,
        maecNumber,
        province,
        languagePairs: uniquePairs,
        specialties,
      }),
    });

    const data = await res.json();
    if (data.ok) {
      setSuccess(true);
      await update();
      // Brief pause so user sees the success message
      setTimeout(() => router.push(data.redirect), 1200);
    } else {
      setError(data.error || "Error al guardar");
      setLoading(false);
    }
  }

  // Check for duplicate lang pairs to warn in UI
  function isDuplicate(index: number): boolean {
    const pair = langPairs[index];
    if (!pair.sourceLang) return false;
    return langPairs.some(
      (lp, i) =>
        i < index &&
        lp.sourceLang === pair.sourceLang &&
        lp.targetLang === pair.targetLang
    );
  }

  if (success) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-8 text-center">
        <div className="text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-navy-900 mb-2">
          Registro completado
        </h2>
        <p className="text-navy-500 text-sm">
          Redirigiendo a tu dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-8">
      <StepIndicator current={2} total={2} />

      <h2 className="text-2xl font-bold text-navy-900 mb-2">
        Perfil de traductor jurado
      </h2>
      <p className="text-navy-500 text-sm mb-6">
        Completa tus datos para activar tu cuenta profesional.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1">
            Nombre completo
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-accent-400 focus:border-accent-400 outline-none"
          />
        </div>

        {/* Número MAEC */}
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1">
            Número MAEC
          </label>
          <input
            type="text"
            value={maecNumber}
            onChange={(e) => setMaecNumber(e.target.value)}
            onBlur={() => setMaecTouched(true)}
            placeholder="N.3850"
            required
            className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 outline-none ${
              maecError
                ? "border-red-300 focus:ring-red-400 focus:border-red-400"
                : "border-navy-200 focus:ring-accent-400 focus:border-accent-400"
            }`}
          />
          {maecError ? (
            <p className="text-xs text-red-500 mt-1">
              Formato requerido: N. seguido de 1 a 5 dígitos (ej: N.3850)
            </p>
          ) : (
            <p className="text-xs text-navy-400 mt-1">
              Tu número de nombramiento del Ministerio de Asuntos Exteriores
            </p>
          )}
        </div>

        {/* Provincia */}
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1">
            Provincia
          </label>
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-accent-400 focus:border-accent-400 outline-none"
          >
            <option value="">Selecciona provincia</option>
            {PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Pares de idiomas */}
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2">
            Pares de idiomas
          </label>
          {langPairs.map((pair, i) => (
            <div key={i} className="mb-2">
              <div className="flex gap-2">
                <select
                  value={pair.sourceLang}
                  onChange={(e) => {
                    const updated = [...langPairs];
                    updated[i].sourceLang = e.target.value;
                    setLangPairs(updated);
                  }}
                  required
                  className="flex-1 px-3 py-2 border border-navy-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-400 outline-none"
                >
                  <option value="">Idioma origen</option>
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.name}
                    </option>
                  ))}
                </select>
                <span className="flex items-center text-navy-400 text-sm">→</span>
                <select
                  value={pair.targetLang}
                  onChange={(e) => {
                    const updated = [...langPairs];
                    updated[i].targetLang = e.target.value;
                    setLangPairs(updated);
                  }}
                  className="flex-1 px-3 py-2 border border-navy-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-400 outline-none"
                >
                  <option value="es">Español</option>
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.name}
                    </option>
                  ))}
                </select>
                {langPairs.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLangPair(i)}
                    className="text-red-400 hover:text-red-600 px-2"
                  >
                    x
                  </button>
                )}
              </div>
              {isDuplicate(i) && (
                <p className="text-xs text-amber-600 mt-1">
                  Este par de idiomas ya está añadido (se eliminará el duplicado)
                </p>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addLangPair}
            className="text-sm text-accent-600 hover:text-accent-700 font-medium"
          >
            + Añadir par de idiomas
          </button>
        </div>

        {/* Especialidades */}
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-2">
            Especialidades <span className="text-navy-400 font-normal">(opcional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => toggleSpecialty(s.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  specialties.includes(s.value)
                    ? "bg-accent-500 text-white"
                    : "bg-navy-100 text-navy-600 hover:bg-navy-200"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent-500 hover:bg-accent-600 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Completar registro"}
        </button>
      </form>
    </div>
  );
}

function ClientOnboarding({
  router,
  update,
}: {
  router: ReturnType<typeof useRouter>;
  update: ReturnType<typeof useSession>["update"];
}) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: "client", name, company }),
    });

    const data = await res.json();
    if (data.ok) {
      setSuccess(true);
      await update();
      setTimeout(() => router.push(data.redirect), 1200);
    } else {
      setError(data.error || "Error al guardar");
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-8 text-center">
        <div className="text-5xl mb-4">✓</div>
        <h2 className="text-2xl font-bold text-navy-900 mb-2">
          Cuenta creada
        </h2>
        <p className="text-navy-500 text-sm">
          Redirigiendo a tu dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-8">
      <StepIndicator current={2} total={2} />

      <h2 className="text-2xl font-bold text-navy-900 mb-2">
        Bienvenido a mitraductorjurado
      </h2>
      <p className="text-navy-500 text-sm mb-6">
        Completa tus datos para empezar a solicitar traducciones juradas.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1">
            Nombre completo
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-accent-400 focus:border-accent-400 outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1">
            Empresa{" "}
            <span className="text-navy-400 font-normal">(opcional)</span>
          </label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Nombre de tu empresa o despacho"
            className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-accent-400 focus:border-accent-400 outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent-500 hover:bg-accent-600 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? "Guardando..." : "Empezar"}
        </button>
      </form>
    </div>
  );
}
