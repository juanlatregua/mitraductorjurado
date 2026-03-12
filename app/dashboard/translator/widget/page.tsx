"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  documentType: string | null;
  message: string | null;
  sourceDomain: string;
  converted: boolean;
  createdAt: string;
}

export default function WidgetPage() {
  const { data: session } = useSession();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const userId = session?.user?.id || "";
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://mitraductorjurado.es";

  const snippet = `<script src="${baseUrl}/widget.js" data-translator="${userId}" data-lang="es" data-theme="light"></script>`;

  useEffect(() => {
    fetch("/api/widget/leads")
      .then((res) => res.json())
      .then((data) => {
        setLeads(data.leads || []);
        setTotal(data.total || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function copySnippet() {
    navigator.clipboard.writeText(snippet).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-navy-900 mb-6">Widget embebible</h1>

      {/* Snippet */}
      <div className="bg-white rounded-xl border border-navy-100 p-6 mb-8">
        <h2 className="font-bold text-navy-900 mb-2">Código para tu web</h2>
        <p className="text-sm text-navy-500 mb-4">
          Copia este código y pégalo en tu página web. Los visitantes podrán enviarte
          solicitudes de traducción jurada directamente.
        </p>

        <div className="relative">
          <pre className="bg-navy-900 text-green-400 p-4 rounded-lg text-xs overflow-x-auto font-mono">
            {snippet}
          </pre>
          <button
            onClick={copySnippet}
            className="absolute top-2 right-2 bg-navy-700 hover:bg-navy-600 text-white text-xs px-3 py-1.5 rounded-md transition-colors"
          >
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <div className="bg-navy-50 p-3 rounded-lg">
            <p className="font-medium text-navy-700">data-lang</p>
            <p className="text-navy-500">es | en</p>
          </div>
          <div className="bg-navy-50 p-3 rounded-lg">
            <p className="font-medium text-navy-700">data-theme</p>
            <p className="text-navy-500">light | dark</p>
          </div>
          <div className="bg-navy-50 p-3 rounded-lg">
            <p className="font-medium text-navy-700">data-translator</p>
            <p className="text-navy-500 truncate">{userId || "tu ID"}</p>
          </div>
        </div>
      </div>

      {/* Leads */}
      <div className="bg-white rounded-xl border border-navy-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-navy-900">
            Solicitudes recibidas
            {total > 0 && (
              <span className="ml-2 text-sm font-normal text-navy-400">({total})</span>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-navy-100 rounded-lg" />
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-navy-500">No hay solicitudes todavía.</p>
            <p className="text-sm text-navy-400 mt-1">
              Instala el widget en tu web para empezar a recibir leads.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="border border-navy-100 rounded-lg p-4 hover:bg-navy-50/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-navy-900">{lead.name}</p>
                    <p className="text-sm text-navy-500">{lead.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-navy-400">
                      {new Date(lead.createdAt).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                    <p className="text-xs text-navy-400">{lead.sourceDomain}</p>
                  </div>
                </div>
                {(lead.documentType || lead.phone) && (
                  <div className="flex gap-3 mt-2 text-xs text-navy-500">
                    {lead.documentType && <span>{lead.documentType}</span>}
                    {lead.phone && <span>{lead.phone}</span>}
                  </div>
                )}
                {lead.message && (
                  <p className="mt-2 text-sm text-navy-600 bg-navy-50 p-2 rounded">
                    {lead.message}
                  </p>
                )}
                {lead.converted && (
                  <span className="inline-block mt-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    Convertido en pedido
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
