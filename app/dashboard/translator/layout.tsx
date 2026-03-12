import { Sidebar } from "@/components/dashboard/sidebar";

const NAV_ITEMS = [
  { label: "Inicio", href: "/dashboard/translator", icon: "📊" },
  { label: "Pedidos", href: "/dashboard/translator/orders", icon: "📋" },
  { label: "Editor", href: "/dashboard/translator/editor", icon: "✍️" },
  { label: "Plantillas", href: "/dashboard/translator/templates", icon: "📄" },
  { label: "Disponibilidad", href: "/dashboard/translator/availability", icon: "📅" },
  { label: "Colegas", href: "/dashboard/translator/colleagues", icon: "🤝" },
  { label: "Pagos", href: "/dashboard/translator/payments", icon: "💳" },
  { label: "Facturas", href: "/dashboard/translator/invoices", icon: "🧾" },
  { label: "Widget", href: "/dashboard/translator/widget", icon: "🔗" },
  { label: "Perfil", href: "/dashboard/translator/profile", icon: "👤" },
];

export default function TranslatorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-navy-50">
      <Sidebar items={NAV_ITEMS} role="traductor" />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
