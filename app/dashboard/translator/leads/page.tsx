import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const STATUS_DOT: Record<string, { bg: string; label: string }> = {
  new:       { bg: "#C9882A", label: "Nuevo" },
  converted: { bg: "#4A8A5A", label: "Convertido" },
};

function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `hace ${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days}d`;
}

export default async function LeadsPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  let leads: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    documentType: string | null;
    message: string | null;
    sourceDomain: string;
    converted: boolean;
    createdAt: Date;
  }[] = [];
  let totalCount = 0;
  let newCount = 0;

  try {
    [leads, totalCount, newCount] = await Promise.all([
      prisma.widgetLead.findMany({
        where: { translatorId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          documentType: true,
          message: true,
          sourceDomain: true,
          converted: true,
          createdAt: true,
        },
      }),
      prisma.widgetLead.count({
        where: { translatorId: session.user.id },
      }),
      prisma.widgetLead.count({
        where: { translatorId: session.user.id, converted: false },
      }),
    ]);
  } catch {
    // DB unavailable
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div
          className="font-mono"
          style={{ fontSize: 9, color: "#C9882A", textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}
        >
          Leads
        </div>
        <h1 className="font-playfair" style={{ fontSize: 22, color: "#1A3A2A", margin: 0 }}>
          Solicitudes del widget
        </h1>
        <p className="font-sans" style={{ fontSize: 13, color: "#888", marginTop: 4 }}>
          {totalCount} total &middot; {newCount} nuevos
        </p>
      </div>

      {leads.length === 0 ? (
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            border: "1px solid #E8E2D8",
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <p className="font-sans" style={{ fontSize: 14, color: "#888", marginBottom: 8 }}>
            No hay solicitudes todav&iacute;a
          </p>
          <p className="font-sans" style={{ fontSize: 12, color: "#aaa" }}>
            Instala el widget en tu web para empezar a recibir leads.
          </p>
          <a
            href="/dashboard/translator/widget"
            className="font-sans"
            style={{
              display: "inline-block",
              marginTop: 16,
              background: "#1A3A2A",
              color: "#fff",
              padding: "8px 20px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Configurar widget
          </a>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #E8E2D8", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #E8E2D8" }}>
                {["Estado", "Nombre", "Email", "Tipo doc.", "Origen", "Fecha"].map((h) => (
                  <th
                    key={h}
                    className="font-mono"
                    style={{
                      textAlign: "left",
                      padding: "10px 12px",
                      fontSize: 9,
                      color: "#999",
                      letterSpacing: 0.5,
                      textTransform: "uppercase",
                      fontWeight: 500,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const status = lead.converted ? STATUS_DOT.converted : STATUS_DOT.new;
                return (
                  <tr
                    key={lead.id}
                    style={{ borderBottom: "1px solid rgba(232,226,216,0.5)" }}
                  >
                    <td style={{ padding: "10px 12px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 11,
                          color: status.bg,
                        }}
                      >
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: status.bg }} />
                        <span className="font-mono" style={{ fontSize: 9 }}>{status.label}</span>
                      </span>
                    </td>
                    <td className="font-sans" style={{ padding: "10px 12px", fontSize: 13, color: "#1A3A2A", fontWeight: 500 }}>
                      {lead.name}
                    </td>
                    <td className="font-sans" style={{ padding: "10px 12px", fontSize: 12, color: "#666" }}>
                      <a href={`mailto:${lead.email}`} style={{ color: "#2D6A4F", textDecoration: "none" }}>
                        {lead.email}
                      </a>
                    </td>
                    <td className="font-sans" style={{ padding: "10px 12px", fontSize: 12, color: "#888" }}>
                      {lead.documentType || "\u2014"}
                    </td>
                    <td className="font-mono" style={{ padding: "10px 12px", fontSize: 10, color: "#aaa" }}>
                      {lead.sourceDomain}
                    </td>
                    <td className="font-mono" style={{ padding: "10px 12px", fontSize: 10, color: "#aaa" }}>
                      {timeAgo(lead.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
