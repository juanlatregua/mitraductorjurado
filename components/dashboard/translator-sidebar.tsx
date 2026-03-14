"use client";

import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface Props {
  activeOrderCount: number;
}

const SECTIONS = [
  {
    label: "Principal",
    items: [
      {
        label: "Inicio",
        href: "/dashboard/translator",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
            <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
            <rect x="1" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
            <rect x="9" y="9" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        ),
        badge: false,
      },
      {
        label: "Pedidos",
        href: "/dashboard/translator/orders",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="1" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <line x1="5" y1="5" x2="11" y2="5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <line x1="5" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <line x1="5" y1="11" x2="9" y2="11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
        ),
        badge: true,
      },
      {
        label: "Editor",
        href: "/dashboard/translator/editor",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="2" width="5.5" height="12" rx="1" stroke="currentColor" strokeWidth="1.3" />
            <rect x="9.5" y="2" width="5.5" height="12" rx="1" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        ),
        badge: false,
      },
    ],
  },
  {
    label: "Gesti\u00f3n",
    items: [
      {
        label: "Facturas",
        href: "/dashboard/translator/invoices",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="1" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <line x1="5" y1="5" x2="8" y2="5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <line x1="5" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <line x1="5" y1="11" x2="10" y2="11" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <line x1="10" y1="4" x2="10" y2="6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
            <line x1="9" y1="5" x2="11" y2="5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
        ),
        badge: false,
      },
      {
        label: "Disponibilidad",
        href: "/dashboard/translator/availability",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M8 4V8L10.5 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        badge: false,
      },
      {
        label: "Colegas",
        href: "/dashboard/translator/colleagues",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="11" cy="6" r="2" stroke="currentColor" strokeWidth="1.1" />
            <path d="M1 14C1 11 3.5 9.5 6 9.5C8.5 9.5 11 11 11 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M11 14C11 12 12 10.5 13.5 10.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          </svg>
        ),
        badge: false,
      },
      {
        label: "Pagos",
        href: "/dashboard/translator/payments",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="3" width="14" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <line x1="1" y1="7" x2="15" y2="7" stroke="currentColor" strokeWidth="1.3" />
          </svg>
        ),
        badge: false,
      },
    ],
  },
  {
    label: "Captaci\u00f3n",
    items: [
      {
        label: "Widget",
        href: "/dashboard/translator/widget",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
            <path d="M6 6L4 8L6 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 6L12 8L10 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        badge: false,
      },
      {
        label: "Leads",
        href: "/dashboard/translator/leads",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 1L14 4V8C14 11.3 11.5 14.2 8 15C4.5 14.2 2 11.3 2 8V4L8 1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            <path d="M5.5 8L7 9.5L10.5 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ),
        badge: false,
      },
      {
        label: "Perfil p\u00fablico",
        href: "/dashboard/translator/profile",
        icon: (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.3" />
            <path d="M2 15C2 12 4.5 10 8 10C11.5 10 14 12 14 15" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        ),
        badge: false,
      },
    ],
  },
];

export function TranslatorSidebar({ activeOrderCount }: Props) {
  const pathname = usePathname();

  return (
    <aside
      style={{
        background: "#112A1C",
        borderRight: "0.5px solid rgba(255,255,255,0.05)",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}
    >
      <nav style={{ flex: 1, padding: "16px 12px" }}>
        {SECTIONS.map((section) => (
          <div key={section.label} style={{ marginBottom: 20 }}>
            {/* Section label */}
            <div
              className="font-mono"
              style={{
                fontSize: 8,
                color: "#2A5A3A",
                letterSpacing: 2,
                textTransform: "uppercase",
                padding: "0 16px",
                marginBottom: 6,
              }}
            >
              {section.label}
            </div>

            {section.items.map((item) => {
              const isActive =
                item.href === "/dashboard/translator"
                  ? pathname === "/dashboard/translator"
                  : pathname.startsWith(item.href);

              return (
                <a
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "9px 16px",
                    borderLeft: isActive
                      ? "2px solid #C9882A"
                      : "2px solid transparent",
                    background: isActive
                      ? "rgba(201,136,42,0.08)"
                      : "transparent",
                    color: isActive ? "#F0EBE0" : "#5A8A6A",
                    textDecoration: "none",
                    borderRadius: "0 4px 4px 0",
                    transition: "all 0.15s",
                    marginBottom: 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                      e.currentTarget.style.color = "#A8C4A8";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#5A8A6A";
                    }
                  }}
                >
                  <span style={{ width: 16, height: 16, flexShrink: 0 }}>{item.icon}</span>
                  <span className="font-sans" style={{ fontSize: 12, fontWeight: 400, flex: 1 }}>
                    {item.label}
                  </span>
                  {item.badge && activeOrderCount > 0 && (
                    <span
                      className="font-mono"
                      style={{
                        fontSize: 9,
                        fontWeight: 500,
                        background: "rgba(201,136,42,0.2)",
                        color: "#C9882A",
                        padding: "1px 6px",
                        borderRadius: 3,
                      }}
                    >
                      {activeOrderCount}
                    </span>
                  )}
                </a>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Plan card */}
      <div style={{ padding: "12px 12px 16px" }}>
        <div
          style={{
            background: "rgba(201,136,42,0.08)",
            border: "0.5px solid rgba(201,136,42,0.2)",
            borderRadius: 4,
            padding: "10px 12px",
          }}
        >
          <div
            className="font-mono"
            style={{ fontSize: 8, color: "#C9882A", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}
          >
            Plan activo
          </div>
          <div className="font-sans" style={{ fontSize: 11, color: "#A8C4A8", fontWeight: 300 }}>
            Fundador &middot; 49&euro;/mes
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            padding: "8px 12px",
            marginTop: 8,
            background: "transparent",
            border: "none",
            color: "#3A5A4A",
            cursor: "pointer",
            borderRadius: 4,
            transition: "color 0.15s",
            fontSize: 11,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#A8C4A8")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#3A5A4A")}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 2H3C2.45 2 2 2.45 2 3V11C2 11.55 2.45 12 3 12H5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            <path d="M9 4L12 7L9 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="5" y1="7" x2="12" y2="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
          <span className="font-sans">Cerrar sesi&oacute;n</span>
        </button>
      </div>
    </aside>
  );
}
