import { Sidebar } from "@/components/dashboard/sidebar";

const NAV_ITEMS = [
  { label: "Inicio", href: "/dashboard/client", icon: "📊" },
  { label: "Mis pedidos", href: "/dashboard/client/orders", icon: "📋" },
  { label: "Nuevo pedido", href: "/dashboard/client/new-order", icon: "➕" },
  { label: "Facturas", href: "/dashboard/client/invoices", icon: "🧾" },
];

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-navy-50">
      <Sidebar items={NAV_ITEMS} role="cliente" />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
