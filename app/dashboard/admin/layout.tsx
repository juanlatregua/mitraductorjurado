import { Sidebar } from "@/components/dashboard/sidebar";

const NAV_ITEMS = [
  { label: "Inicio", href: "/dashboard/admin", icon: "📊" },
  { label: "Usuarios", href: "/dashboard/admin/users", icon: "👥" },
  { label: "Verificaciones", href: "/dashboard/admin/verifications", icon: "✅" },
  { label: "Pedidos", href: "/dashboard/admin/orders", icon: "📋" },
  { label: "Ingresos", href: "/dashboard/admin/revenue", icon: "💰" },
  { label: "Verifactu", href: "/dashboard/admin/verifactu", icon: "🧾" },
];

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-navy-50">
      <Sidebar items={NAV_ITEMS} role="admin" />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
