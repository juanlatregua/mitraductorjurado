"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: "Error de configuración del servidor.",
  AccessDenied: "No tienes permiso para acceder.",
  Verification: "El enlace ha expirado o ya fue utilizado.",
  Default: "Ha ocurrido un error. Inténtalo de nuevo.",
};

export default function AuthErrorPage() {
  return (
    <Suspense>
      <AuthErrorContent />
    </Suspense>
  );
}

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Default";
  const message = ERROR_MESSAGES[error] || ERROR_MESSAGES.Default;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-8 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <h2 className="text-2xl font-bold text-navy-900 mb-2">
        Error de autenticación
      </h2>
      <p className="text-navy-500 mb-6">{message}</p>
      <a
        href="/auth/login"
        className="inline-block bg-navy-900 hover:bg-navy-800 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
      >
        Volver al login
      </a>
    </div>
  );
}
