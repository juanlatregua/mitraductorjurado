"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LANG_NAMES } from "@/lib/constants";

const LANGUAGES = Object.entries(LANG_NAMES).filter(([code]) => code !== "es");

export default function NewOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    translatorId: "",
    sourceLang: "",
    targetLang: "es",
    documentType: "",
    notes: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al crear el pedido");
        return;
      }

      router.push(`/dashboard/client/orders/${data.orderId}`);
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900">Nuevo pedido</h1>
        <p className="text-navy-500 mt-1">Solicita una traducción jurada</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* ID del traductor */}
        <div>
          <label className="block text-sm font-semibold text-navy-900 mb-2">
            ID del traductor
          </label>
          <input
            type="text"
            required
            value={form.translatorId}
            onChange={(e) => setForm({ ...form, translatorId: e.target.value })}
            placeholder="Pega el ID del traductor desde el directorio"
            className="w-full border border-navy-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-400"
          />
          <p className="text-xs text-navy-400 mt-1">
            Encuentra un traductor en el{" "}
            <a href="/translators" className="text-accent-500 underline">
              directorio
            </a>
          </p>
        </div>

        {/* Idioma origen */}
        <div>
          <label className="block text-sm font-semibold text-navy-900 mb-2">
            Idioma del documento original
          </label>
          <select
            required
            value={form.sourceLang}
            onChange={(e) => setForm({ ...form, sourceLang: e.target.value })}
            className="w-full border border-navy-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-400"
          >
            <option value="">Seleccionar idioma</option>
            {LANGUAGES.map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Idioma destino */}
        <div>
          <label className="block text-sm font-semibold text-navy-900 mb-2">
            Idioma de destino
          </label>
          <select
            required
            value={form.targetLang}
            onChange={(e) => setForm({ ...form, targetLang: e.target.value })}
            className="w-full border border-navy-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-400"
          >
            <option value="es">Español</option>
            {LANGUAGES.map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo de documento */}
        <div>
          <label className="block text-sm font-semibold text-navy-900 mb-2">
            Tipo de documento (opcional)
          </label>
          <input
            type="text"
            value={form.documentType}
            onChange={(e) => setForm({ ...form, documentType: e.target.value })}
            placeholder="Ej: título universitario, acta de nacimiento..."
            className="w-full border border-navy-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-400"
          />
        </div>

        {/* Notas */}
        <div>
          <label className="block text-sm font-semibold text-navy-900 mb-2">
            Notas adicionales (opcional)
          </label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={4}
            placeholder="Urgencia, detalles especiales, número de páginas..."
            className="w-full border border-navy-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent-400 resize-none"
          />
        </div>

        {/* TODO: Upload de documento (Sprint 5 con Vercel Blob) */}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
          >
            {loading ? "Enviando..." : "Solicitar presupuesto"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="border border-navy-200 text-navy-700 font-medium px-6 py-2.5 rounded-lg hover:bg-navy-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
