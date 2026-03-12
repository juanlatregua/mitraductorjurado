"use client";

import { useState, useEffect } from "react";

interface Template {
  id: string;
  category: string;
  type: string;
  language: string;
  label: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  academico: "Académico",
  notarial: "Notarial",
  administrativo: "Administrativo",
  economico: "Económico",
  juridico: "Jurídico",
};

const CATEGORY_COLORS: Record<string, string> = {
  academico: "bg-blue-100 text-blue-700",
  notarial: "bg-purple-100 text-purple-700",
  administrativo: "bg-amber-100 text-amber-700",
  economico: "bg-green-100 text-green-700",
  juridico: "bg-red-100 text-red-700",
};

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [error, setError] = useState("");

  function loadTemplates() {
    fetch("/api/templates")
      .then((res) => res.json())
      .then((data) => {
        setTemplates(data.templates || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  async function seedTemplates() {
    setSeeding(true);
    setError("");
    try {
      const res = await fetch("/api/templates/seed", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al cargar plantillas");
        return;
      }
      loadTemplates();
    } catch {
      setError("Error de conexión");
    } finally {
      setSeeding(false);
    }
  }

  async function deleteTemplate(id: string) {
    try {
      await fetch(`/api/templates/${id}`, { method: "DELETE" });
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("Error al eliminar");
    }
  }

  const grouped = templates.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {} as Record<string, Template[]>);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-navy-900">Plantillas de documentos</h1>
        <div className="flex gap-3">
          {templates.length === 0 && (
            <button
              onClick={seedTemplates}
              disabled={seeding}
              className="bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
            >
              {seeding ? "Cargando..." : "Cargar plantillas predefinidas"}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-navy-100 rounded-xl" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white rounded-xl border border-navy-100 p-12 text-center">
          <p className="text-navy-500 mb-2">No hay plantillas creadas.</p>
          <p className="text-sm text-navy-400">
            Usa el botón &quot;Cargar plantillas predefinidas&quot; para importar las plantillas estándar.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([cat, items]) => (
            <div key={cat}>
              <h2 className="text-lg font-bold text-navy-900 mb-3 flex items-center gap-2">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${CATEGORY_COLORS[cat] || ""}`}>
                  {CATEGORY_LABELS[cat] || cat}
                </span>
                <span className="text-sm font-normal text-navy-400">
                  {items.length} plantilla{items.length !== 1 ? "s" : ""}
                </span>
              </h2>
              <div className="grid gap-3">
                {items.map((t) => (
                  <div
                    key={t.id}
                    className="bg-white rounded-lg border border-navy-100 p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-navy-900">{t.label}</p>
                      <p className="text-xs text-navy-500">
                        {t.type} · {t.language.toUpperCase()}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteTemplate(t.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium"
                    >
                      Eliminar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
