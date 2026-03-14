import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { AvailabilityToggle } from "@/components/dashboard/availability-toggle";
import { GuidedTour } from "@/components/dashboard/guided-tour";
import { SubscribedToast } from "@/components/dashboard/subscribed-toast";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  pending:     { bg: "rgba(136,136,136,0.1)", color: "#888", label: "Pendiente" },
  quoted:      { bg: "rgba(201,136,42,0.1)", color: "#C9882A", label: "Presupuestado" },
  accepted:    { bg: "rgba(201,136,42,0.1)", color: "#C9882A", label: "Aceptado" },
  in_progress: { bg: "rgba(74,138,90,0.1)", color: "#2D6A4F", label: "En curso" },
  delivered:   { bg: "rgba(26,58,42,0.1)", color: "#1A3A2A", label: "Entregado" },
  closed:      { bg: "rgba(26,58,42,0.06)", color: "#6A9A7A", label: "Cerrado" },
  cancelled:   { bg: "rgba(200,50,50,0.08)", color: "#C44", label: "Cancelado" },
};

function formatDate(date: Date): string {
  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function TranslatorDashboard() {
  const session = await getSession();
  if (!session) redirect("/auth/login");

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const userName = session.user.name || "traductor";

  let profile: { availabilityStatus: string; verified: boolean; id: string; avgRating: number | null } | null = null;
  let activeCount = 0;
  let monthRevenue = 0;
  let widgetLeads = 0;
  let avgRating = 0;
  let hasSubscription = false;
  let recentOrders: {
    id: string;
    client: { name: string | null } | null;
    sourceLang: string;
    targetLang: string;
    status: string;
    expiresAt: Date | null;
    price: number | null;
  }[] = [];

  try {
    const [p, active, orders, closedOrders, leads] = await Promise.all([
      prisma.translatorProfile.findUnique({
        where: { userId: session.user.id },
        select: { availabilityStatus: true, verified: true, id: true, avgRating: true },
      }),
      prisma.order.count({
        where: {
          translatorId: session.user.id,
          status: { in: ["pending", "quoted", "accepted", "in_progress"] },
        },
      }),
      prisma.order.findMany({
        where: { translatorId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          sourceLang: true,
          targetLang: true,
          status: true,
          expiresAt: true,
          price: true,
          client: { select: { name: true } },
        },
      }),
      prisma.order.aggregate({
        where: {
          translatorId: session.user.id,
          status: "closed",
          updatedAt: { gte: startOfMonth },
        },
        _sum: { price: true },
      }),
      prisma.widgetLead.count({
        where: {
          translatorId: session.user.id,
          createdAt: { gte: sevenDaysAgo },
        },
      }).catch(() => 0),
    ]);

    profile = p;
    activeCount = active;
    recentOrders = orders.map((o) => ({ ...o, price: o.price ? Number(o.price) : null }));
    monthRevenue = Number(closedOrders._sum.price) || 0;
    widgetLeads = leads;
    avgRating = p?.avgRating ? Number(p.avgRating) : 0;

    // Check subscription
    if (p) {
      const sub = await prisma.subscription.findUnique({
        where: { translatorId: p.id },
        select: { status: true },
      });
      hasSubscription = sub?.status === "active";
    }
  } catch {
    // DB unavailable — show empty state
  }

  const kpis = [
    { label: "Facturado este mes", value: `${(monthRevenue * 1.21).toFixed(0)}\u20AC`, highlight: true },
    { label: "Pedidos activos", value: String(activeCount), highlight: false },
    { label: "Leads widget (7d)", value: String(widgetLeads), highlight: false },
    { label: "Valoraci\u00f3n media", value: avgRating > 0 ? avgRating.toFixed(1) : "\u2014", highlight: false },
  ];

  return (
    <div>
      <GuidedTour />
      <Suspense fallback={null}>
        <SubscribedToast />
      </Suspense>

      {/* Subscription banner */}
      {!hasSubscription && session.user.role === "translator" && (
        <div
          style={{
            background: "linear-gradient(135deg, #1A3A2A 0%, #2D6A4F 100%)",
            borderRadius: 10,
            padding: "16px 20px",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <p className="font-sans" style={{ color: "#fff", fontSize: 14, fontWeight: 600, margin: 0 }}>
              Activa el Plan Fundador para acceder a todas las herramientas
            </p>
            <p className="font-sans" style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, margin: "4px 0 0" }}>
              Editor bilingüe, firma eIDAS, facturación Verifactu, cobros Stripe y más por 49€/mes.
            </p>
          </div>
          <a
            href="/dashboard/translator/subscribe"
            className="font-sans"
            style={{
              background: "#C9882A",
              color: "#fff",
              padding: "8px 20px",
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 600,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Suscribirme — 49€/mes
          </a>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div
          className="font-mono"
          style={{ fontSize: 9, color: "#C9882A", textTransform: "uppercase", letterSpacing: 2, marginBottom: 6 }}
        >
          Dashboard
        </div>
        <h1 className="font-playfair" style={{ fontWeight: 700, fontSize: 22, color: "#1A3A2A", margin: 0 }}>
          Buenos d&iacute;as, {userName}.
        </h1>
        <p className="font-sans" style={{ fontWeight: 300, fontSize: 12, color: "#888", marginTop: 4 }}>
          {formatDate(now)} &middot; {activeCount} pedido{activeCount !== 1 ? "s" : ""} activo{activeCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Availability bar */}
      {profile && (
        <div
          style={{
            background: "#fff",
            border: "0.5px solid #E8E2D8",
            borderRadius: 6,
            padding: "10px 16px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: profile.availabilityStatus === "available"
                  ? "#4A8A5A"
                  : profile.availabilityStatus === "busy"
                    ? "#D4A04A"
                    : "#888",
              }}
            />
            <span className="font-sans" style={{ fontSize: 12, color: "#1A3A2A" }}>
              {profile.availabilityStatus === "available"
                ? "Disponible"
                : profile.availabilityStatus === "busy"
                  ? "Ocupado"
                  : "Vacaciones"}
            </span>
          </div>
          <AvailabilityToggle initialStatus={profile.availabilityStatus} />
        </div>
      )}

      {/* KPIs grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            style={{
              background: "#fff",
              border: "0.5px solid #E8E2D8",
              borderRadius: 6,
              padding: "16px 18px",
              borderLeft: kpi.highlight ? "3px solid #C9882A" : "3px solid transparent",
            }}
          >
            <div
              className="font-sans"
              style={{ fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}
            >
              {kpi.label}
            </div>
            <div
              className="font-playfair"
              style={{ fontSize: 24, fontWeight: 700, color: "#1A3A2A" }}
            >
              {kpi.value}
            </div>
          </div>
        ))}
      </div>

      {/* Recent orders table */}
      <div
        style={{
          background: "#fff",
          border: "0.5px solid #E8E2D8",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "0.5px solid #E8E2D8",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span className="font-sans" style={{ fontSize: 13, fontWeight: 500, color: "#1A3A2A" }}>
            Pedidos recientes
          </span>
          <a
            href="/dashboard/translator/orders"
            className="font-mono"
            style={{ fontSize: 9, color: "#C9882A", textDecoration: "none", textTransform: "uppercase", letterSpacing: 1 }}
          >
            Ver todos &rarr;
          </a>
        </div>

        {recentOrders.length === 0 ? (
          <div style={{ padding: "40px 18px", textAlign: "center" }}>
            <p className="font-sans" style={{ fontSize: 13, color: "#888" }}>
              No tienes pedidos a&uacute;n.
            </p>
            <p className="font-sans" style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>
              Los pedidos aparecer&aacute;n aqu&iacute; cuando los clientes te contacten.
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "0.5px solid #E8E2D8" }}>
                {["Cliente / Documento", "Idioma", "Estado", "Entrega", "Importe"].map((h) => (
                  <th
                    key={h}
                    className="font-mono"
                    style={{
                      fontSize: 8,
                      color: "#999",
                      textTransform: "uppercase",
                      letterSpacing: 1.5,
                      padding: "10px 18px",
                      textAlign: "left",
                      fontWeight: 500,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => {
                const st = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
                const totalIva = order.price ? (order.price * 1.21).toFixed(0) : "\u2014";
                return (
                  <tr
                    key={order.id}
                    style={{ borderBottom: "0.5px solid #F0ECE6" }}
                  >
                    <td className="font-sans" style={{ padding: 0 }}>
                      <a href={`/dashboard/translator/orders/${order.id}`} style={{ display: "block", padding: "12px 18px", fontSize: 12, color: "#1A3A2A", textDecoration: "none" }}>
                        {order.client?.name || "Cliente"}
                      </a>
                    </td>
                    <td className="font-mono" style={{ padding: 0 }}>
                      <a href={`/dashboard/translator/orders/${order.id}`} style={{ display: "block", padding: "12px 18px", fontSize: 10, color: "#6A9A7A", textDecoration: "none" }}>
                        {order.sourceLang} &rarr; {order.targetLang}
                      </a>
                    </td>
                    <td style={{ padding: 0 }}>
                      <a href={`/dashboard/translator/orders/${order.id}`} style={{ display: "block", padding: "12px 18px", textDecoration: "none" }}>
                        <span
                          className="font-sans"
                          style={{
                            fontSize: 10,
                            fontWeight: 500,
                            padding: "3px 8px",
                            borderRadius: 3,
                            background: st.bg,
                            color: st.color,
                          }}
                        >
                          {st.label}
                        </span>
                      </a>
                    </td>
                    <td className="font-sans" style={{ padding: 0 }}>
                      <a href={`/dashboard/translator/orders/${order.id}`} style={{ display: "block", padding: "12px 18px", fontSize: 11, color: "#888", textDecoration: "none" }}>
                        {order.expiresAt
                          ? order.expiresAt.toLocaleDateString("es-ES", { day: "numeric", month: "short" })
                          : "\u2014"}
                      </a>
                    </td>
                    <td className="font-mono" style={{ padding: 0 }}>
                      <a href={`/dashboard/translator/orders/${order.id}`} style={{ display: "block", padding: "12px 18px", fontSize: 12, color: "#1A3A2A", fontWeight: 500, textDecoration: "none" }}>
                        {totalIva}&euro;
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
