"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  { code: "fr", name: "Francés" }, { code: "en", name: "Inglés" },
  { code: "de", name: "Alemán" }, { code: "it", name: "Italiano" },
  { code: "pt", name: "Portugués" }, { code: "ar", name: "Árabe" },
  { code: "zh", name: "Chino" }, { code: "ja", name: "Japonés" },
  { code: "ru", name: "Ruso" }, { code: "ro", name: "Rumano" },
  { code: "pl", name: "Polaco" }, { code: "nl", name: "Neerlandés" },
  { code: "ca", name: "Catalán" }, { code: "eu", name: "Euskera" },
  { code: "gl", name: "Gallego" },
];

const LANG_MAP: Record<string, string> = Object.fromEntries(
  LANGUAGES.map((l) => [l.code, l.name])
);

const SPECIALTIES = [
  { value: "academico", label: "Académico" },
  { value: "notarial", label: "Notarial" },
  { value: "administrativo", label: "Administrativo" },
  { value: "economico", label: "Económico" },
  { value: "juridico", label: "Jurídico" },
];

interface ProfileData {
  id: string;
  maecNumber: string;
  bio: string | null;
  province: string | null;
  photoUrl: string | null;
  ratePerWord: number | null;
  rateMinimum: number | null;
  verified: boolean;
  languagePairs: { id: string; sourceLang: string; targetLang: string }[];
  specialties: { id: string; category: string }[];
  user: { name: string | null; email: string };
}

export default function TranslatorProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [maecNumber, setMaecNumber] = useState("");
  const [bio, setBio] = useState("");
  const [province, setProvince] = useState("");
  const [ratePerWord, setRatePerWord] = useState("");
  const [rateMinimum, setRateMinimum] = useState("");
  const [langPairs, setLangPairs] = useState<{ sourceLang: string; targetLang: string }[]>([]);
  const [specialties, setSpecialties] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/translator/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) return;
        setProfile(data);
        setName(data.user.name || "");
        setMaecNumber(data.maecNumber);
        setBio(data.bio || "");
        setProvince(data.province || "");
        setRatePerWord(data.ratePerWord?.toString() || "");
        setRateMinimum(data.rateMinimum?.toString() || "");
        setLangPairs(data.languagePairs.map((lp: any) => ({
          sourceLang: lp.sourceLang,
          targetLang: lp.targetLang,
        })));
        setSpecialties(data.specialties.map((s: any) => s.category));
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const res = await fetch("/api/translator/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        maecNumber,
        bio: bio || null,
        province,
        ratePerWord: ratePerWord ? parseFloat(ratePerWord) : null,
        rateMinimum: rateMinimum ? parseFloat(rateMinimum) : null,
        languagePairs: langPairs.filter((lp) => lp.sourceLang),
        specialties,
      }),
    });

    if (res.ok) {
      setMessage("Perfil guardado correctamente");
      router.refresh();
    } else {
      setMessage("Error al guardar");
    }
    setSaving(false);
  }

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("photo", file);

    const res = await fetch("/api/translator/photo", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      setProfile((prev) => (prev ? { ...prev, photoUrl: data.url } : prev));
    }
  }

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

  if (loading) {
    return <div className="text-navy-500">Cargando perfil...</div>;
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-navy-900 mb-2">Mi perfil</h1>
      <p className="text-navy-500 mb-8">
        Esta información aparece en tu perfil público.
        {profile?.verified && (
          <span className="ml-2 inline-flex items-center gap-1 text-green-600 font-medium">
            Verificado MAEC
          </span>
        )}
      </p>

      {message && (
        <div
          className={`mb-6 p-3 rounded-lg text-sm ${
            message.includes("Error")
              ? "bg-red-50 border border-red-200 text-red-700"
              : "bg-green-50 border border-green-200 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Foto */}
        <div className="bg-white rounded-xl border border-navy-100 p-6">
          <h2 className="text-lg font-bold text-navy-900 mb-4">Foto de perfil</h2>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-navy-200 overflow-hidden flex-shrink-0">
              {profile?.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt="Foto de perfil"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl text-navy-400">
                  👤
                </div>
              )}
            </div>
            <div>
              <label className="inline-block bg-navy-900 hover:bg-navy-800 text-white text-sm font-medium px-4 py-2 rounded-lg cursor-pointer transition-colors">
                Cambiar foto
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-navy-400 mt-1">JPG o PNG, máx. 5 MB</p>
            </div>
          </div>
        </div>

        {/* Datos básicos */}
        <div className="bg-white rounded-xl border border-navy-100 p-6 space-y-4">
          <h2 className="text-lg font-bold text-navy-900 mb-2">Datos básicos</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-accent-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Número MAEC
              </label>
              <input
                type="text"
                value={maecNumber}
                onChange={(e) => setMaecNumber(e.target.value)}
                className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-accent-400 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">
              Provincia
            </label>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-accent-400 outline-none"
            >
              <option value="">Selecciona provincia</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1">
              Bio / presentación
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="Describe tu experiencia y especialización..."
              className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-accent-400 outline-none resize-none"
            />
            <p className="text-xs text-navy-400 mt-1">{bio.length}/2000</p>
          </div>
        </div>

        {/* Tarifas */}
        <div className="bg-white rounded-xl border border-navy-100 p-6">
          <h2 className="text-lg font-bold text-navy-900 mb-4">Tarifas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Tarifa por palabra (€)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={ratePerWord}
                onChange={(e) => setRatePerWord(e.target.value)}
                placeholder="0.12"
                className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-accent-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-1">
                Tarifa mínima (€)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={rateMinimum}
                onChange={(e) => setRateMinimum(e.target.value)}
                placeholder="35"
                className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-accent-400 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Pares de idiomas */}
        <div className="bg-white rounded-xl border border-navy-100 p-6">
          <h2 className="text-lg font-bold text-navy-900 mb-4">Pares de idiomas</h2>
          {langPairs.map((pair, i) => (
            <div key={i} className="flex gap-2 mb-2 items-center">
              <select
                value={pair.sourceLang}
                onChange={(e) => {
                  const updated = [...langPairs];
                  updated[i].sourceLang = e.target.value;
                  setLangPairs(updated);
                }}
                className="flex-1 px-3 py-2 border border-navy-200 rounded-lg text-sm focus:ring-2 focus:ring-accent-400 outline-none"
              >
                <option value="">Idioma origen</option>
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.name}</option>
                ))}
              </select>
              <span className="text-navy-400">→</span>
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
                  <option key={l.code} value={l.code}>{l.name}</option>
                ))}
              </select>
              {langPairs.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLangPair(i)}
                  className="text-red-400 hover:text-red-600 px-2 text-lg"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addLangPair}
            className="text-sm text-accent-600 hover:text-accent-700 font-medium mt-2"
          >
            + Añadir par de idiomas
          </button>
        </div>

        {/* Especialidades */}
        <div className="bg-white rounded-xl border border-navy-100 p-6">
          <h2 className="text-lg font-bold text-navy-900 mb-4">Especialidades</h2>
          <div className="flex flex-wrap gap-2">
            {SPECIALTIES.map((s) => (
              <button
                key={s.value}
                type="button"
                onClick={() => toggleSpecialty(s.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
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

        {/* Guardar */}
        <button
          type="submit"
          disabled={saving}
          className="bg-accent-500 hover:bg-accent-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </form>
    </div>
  );
}
