"use client";

import { useState, useEffect } from "react";
import { LANG_NAMES } from "@/lib/constants";

interface TemplateField {
  key: string;
  label: string;
  type?: string;
  options?: string[];
  placeholder?: string;
}

interface Template {
  id: string;
  category: string;
  type: string;
  language: string;
  label: string;
  structure: {
    fixedFields: TemplateField[];
    variables: TemplateField[];
  };
  exampleAnon: string | null;
}

const CATEGORY_LABELS: Record<string, string> = {
  academico: "Académico",
  notarial: "Notarial",
  administrativo: "Administrativo",
  economico: "Económico",
  juridico: "Jurídico",
};

export default function TranslatorTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [langFilter, setLangFilter] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (categoryFilter) params.set("category", categoryFilter);
    if (langFilter) params.set("language", langFilter);

    fetch(`/api/templates?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setTemplates(data.templates || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [categoryFilter, langFilter]);

  const selected = templates.find((t) => t.id === selectedId);

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-navy-900 mb-6">Plantillas de documentos</h1>

      {/* Filtros */}
      <div className="flex gap-3 mb-6">
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setSelectedId(null); }}
          className="border border-navy-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent-400"
        >
          <option value="">Todas las categorías</option>
          {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <select
          value={langFilter}
          onChange={(e) => { setLangFilter(e.target.value); setSelectedId(null); }}
          className="border border-navy-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent-400"
        >
          <option value="">Todos los idiomas</option>
          {Object.entries(LANG_NAMES).map(([code, name]) => (
            <option key={code} value={code}>{name}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-navy-100 rounded-lg" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white rounded-xl border border-navy-100 p-12 text-center">
          <p className="text-navy-500">No hay plantillas disponibles.</p>
          <p className="text-sm text-navy-400 mt-1">
            El administrador debe cargar las plantillas primero.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-5 gap-6">
          {/* Lista */}
          <div className="col-span-2 space-y-2 max-h-[70vh] overflow-y-auto pr-2">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  selectedId === t.id
                    ? "border-accent-400 bg-accent-50"
                    : "border-navy-100 bg-white hover:border-navy-200"
                }`}
              >
                <p className="font-medium text-navy-900 text-sm">{t.label}</p>
                <p className="text-xs text-navy-500 mt-0.5">
                  {CATEGORY_LABELS[t.category]} · {LANG_NAMES[t.language] || t.language}
                </p>
              </button>
            ))}
          </div>

          {/* Detalle */}
          <div className="col-span-3">
            {selected ? (
              <div className="bg-white rounded-xl border border-navy-100 p-6 sticky top-8">
                <h2 className="font-bold text-navy-900 mb-4">{selected.label}</h2>

                {/* Campos fijos */}
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-navy-700 mb-2">
                    Campos del documento
                  </h3>
                  <div className="space-y-2">
                    {selected.structure.fixedFields.map((f) => (
                      <div key={f.key} className="flex items-center gap-2 text-sm">
                        <span className="text-navy-500 w-40 flex-shrink-0">{f.label}</span>
                        {f.type === "select" && f.options ? (
                          <span className="text-xs text-navy-400">
                            ({f.options.join(" / ")})
                          </span>
                        ) : (
                          <span className="text-xs text-navy-400">{f.type || "texto"}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Variables */}
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-navy-700 mb-2">
                    Datos a rellenar
                  </h3>
                  <div className="space-y-2">
                    {selected.structure.variables.map((v) => (
                      <div key={v.key} className="flex items-center gap-2 text-sm">
                        <span className="text-navy-500 w-40 flex-shrink-0">{v.label}</span>
                        {v.placeholder && (
                          <span className="text-xs text-navy-400 italic">{v.placeholder}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ejemplo */}
                {selected.exampleAnon && (
                  <div>
                    <h3 className="text-sm font-semibold text-navy-700 mb-2">
                      Ejemplo anonimizado
                    </h3>
                    <pre className="bg-navy-50 p-4 rounded-lg text-xs text-navy-700 whitespace-pre-wrap font-mono">
                      {selected.exampleAnon}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-navy-100 p-12 text-center">
                <p className="text-navy-400 text-sm">
                  Selecciona una plantilla para ver su estructura
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
