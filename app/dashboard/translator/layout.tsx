import { TranslatorSidebar } from "@/components/dashboard/translator-sidebar";
import { Logo } from "@/components/logo";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function TranslatorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  let maecNumber = "";
  let initials = "TJ";
  let activeOrderCount = 0;

  try {
    const profile = await prisma.translatorProfile.findUnique({
      where: { userId: session.user.id },
      select: { maecNumber: true },
    });
    if (profile?.maecNumber) maecNumber = profile.maecNumber;

    activeOrderCount = await prisma.order.count({
      where: {
        translatorId: session.user.id,
        status: { in: ["pending", "quoted", "accepted", "in_progress"] },
      },
    });
  } catch {
    // DB unavailable
  }

  const name = session.user.name || "Traductor";
  const parts = name.split(" ");
  initials = parts.length >= 2
    ? (parts[0][0] + parts[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "220px 1fr",
        gridTemplateRows: "52px 1fr",
        minHeight: "100vh",
        background: "#F8F4EE",
      }}
    >
      {/* ─── Topbar ─── */}
      <header
        style={{
          gridColumn: "1 / -1",
          background: "#1A3A2A",
          borderBottom: "0.5px solid rgba(255,255,255,0.06)",
          height: 52,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
        }}
      >
        <a href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <Logo size="sm" variant="dark" />
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {maecNumber && (
            <span
              className="font-mono"
              style={{
                fontSize: 9,
                color: "#6A9A7A",
                letterSpacing: "0.5px",
              }}
            >
              {maecNumber}
            </span>
          )}
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 2,
              background: "rgba(201,136,42,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span className="font-mono" style={{ fontSize: 9, color: "#C9882A", fontWeight: 500 }}>
              {initials}
            </span>
          </div>
        </div>
      </header>

      {/* ─── Sidebar ─── */}
      <TranslatorSidebar activeOrderCount={activeOrderCount} />

      {/* ─── Main ─── */}
      <main style={{ padding: 32, overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
