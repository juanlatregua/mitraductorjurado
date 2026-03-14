"use client";

import { signIn } from "next-auth/react";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyContent />
    </Suspense>
  );
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState(emailParam);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleResend() {
    if (!email) return;
    setResending(true);
    await signIn("email", {
      email,
      callbackUrl,
      redirect: false,
    });
    setResent(true);
    setResending(false);
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-navy-100 p-8 text-center">
      <div className="text-5xl mb-4">📧</div>
      <h2 className="text-2xl font-bold text-navy-900 mb-2">
        Revisa tu email
      </h2>
      <p className="text-navy-500">
        Te hemos enviado un enlace de acceso. Haz clic en el enlace del email
        para continuar.
      </p>
      <p className="text-navy-400 text-sm mt-4">
        El enlace caduca en 30 minutos. Si no lo encuentras, revisa la carpeta de spam.
      </p>

      {/* Resend section */}
      <div className="mt-6 pt-6 border-t border-navy-100">
        {resent ? (
          <p className="text-sm text-green-600 font-medium">
            Enlace reenviado. Revisa tu bandeja de entrada.
          </p>
        ) : (
          <>
            {!emailParam && (
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-2.5 border border-navy-200 rounded-lg focus:ring-2 focus:ring-accent-400 focus:border-accent-400 outline-none mb-3 text-sm"
              />
            )}
            <button
              onClick={handleResend}
              disabled={resending || !email}
              className="text-sm text-accent-600 hover:text-accent-700 font-medium disabled:opacity-50"
            >
              {resending ? "Reenviando..." : "Reenviar enlace de acceso"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
