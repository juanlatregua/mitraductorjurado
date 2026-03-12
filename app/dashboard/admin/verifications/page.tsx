import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { VerifyButton } from "./verify-button";

export const dynamic = "force-dynamic";

export default async function VerificationsPage() {
  const session = await getSession();
  if (!session || session.user.role !== "admin") redirect("/auth/login");

  const profiles = await prisma.translatorProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      languagePairs: true,
    },
  });

  const pending = profiles.filter((p) => !p.verified);
  const verified = profiles.filter((p) => p.verified);

  return (
    <div>
      <h1 className="text-3xl font-bold text-navy-900 mb-8">
        Verificaciones MAEC
      </h1>

      {/* Pendientes */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-navy-900 mb-4">
          Pendientes de verificación ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-navy-500 text-sm">
            No hay perfiles pendientes de verificar.
          </p>
        ) : (
          <div className="space-y-3">
            {pending.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-navy-100 p-5 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-navy-900">
                    {p.user.name || p.user.email}
                  </div>
                  <div className="text-sm text-navy-500">
                    {p.maecNumber} · {p.province || "Sin provincia"} ·{" "}
                    {p.languagePairs
                      .map((lp) => `${lp.sourceLang}→${lp.targetLang}`)
                      .join(", ")}
                  </div>
                </div>
                <VerifyButton profileId={p.id} currentlyVerified={false} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verificados */}
      <div>
        <h2 className="text-lg font-bold text-navy-900 mb-4">
          Verificados ({verified.length})
        </h2>
        {verified.length === 0 ? (
          <p className="text-navy-500 text-sm">Aún no hay perfiles verificados.</p>
        ) : (
          <div className="space-y-3">
            {verified.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-navy-100 p-5 flex items-center justify-between"
              >
                <div>
                  <div className="font-medium text-navy-900 flex items-center gap-2">
                    {p.user.name || p.user.email}
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                      Verificado
                    </span>
                  </div>
                  <div className="text-sm text-navy-500">
                    {p.maecNumber} · {p.province || "Sin provincia"}
                  </div>
                </div>
                <VerifyButton profileId={p.id} currentlyVerified={true} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
