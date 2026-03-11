"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

type RoleSelection = "translator" | "client";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<RoleSelection>("translator");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    // Enviar magic link — el role se guarda en el callbackUrl
    // y se aplica durante el onboarding
    await signIn("email", {
      email,
      callbackUrl: `/auth/onboarding?role=${role}`,
    });
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-8">
      <h2 className="text-2xl font-bold text-navy-900 mb-6">Crear cuenta</h2>

      {sent ? (
        <div className="text-center py-4">
          <div className="text-4xl mb-3">📧</div>
          <p className="text-navy-700 font-medium">
            Te hemos enviado un enlace de verificación
          </p>
          <p className="text-navy-500 text-sm mt-1">
            Revisa tu bandeja de entrada en <strong>{email}</strong>
          </p>
        </div>
      ) : (
        <>
          <form onSubmit={handleRegister} className="space-y-5">
            {/* Selección de rol */}
            <div>
              <label className="block text-sm font-medium text-navy-700 mb-2">
                ¿Cómo vas a usar la plataforma?
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole("translator")}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    role === "translator"
                      ? "border-accent-500 bg-accent-50"
                      : "border-navy-200 hover:border-navy-300"
                  }`}
                >
                  <div className="font-semibold text-navy-900">
                    Traductor jurado
                  </div>
                  <div className="text-xs text-navy-500 mt-1">
                    Nombrado por el MAEC
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("client")}
                  className={`p-4 rounded-lg border-2 text-left transition-colors ${
                    role === "client"
                      ? "border-accent-500 bg-accent-50"
                      : "border-navy-200 hover:border-navy-300"
                  }`}
                >
                  <div className="font-semibold text-navy-900">Cliente</div>
                  <div className="text-xs text-navy-500 mt-1">
                    Necesito traducciones
                  </div>
                </button>
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-navy-700 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-accent-400 focus:border-accent-400 outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent-500 hover:bg-accent-600 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Enviando..." : "Crear cuenta"}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-navy-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-navy-400">o</span>
            </div>
          </div>

          <button
            onClick={() =>
              signIn("google", {
                callbackUrl: `/auth/onboarding?role=${role}`,
              })
            }
            className="w-full border border-navy-200 hover:bg-navy-50 text-navy-700 font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Registrarse con Google
          </button>

          <p className="text-center text-sm text-navy-500 mt-6">
            ¿Ya tienes cuenta?{" "}
            <a
              href="/auth/login"
              className="text-accent-600 hover:text-accent-700 font-medium"
            >
              Accede aquí
            </a>
          </p>
        </>
      )}
    </div>
  );
}
