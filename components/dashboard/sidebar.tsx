"use client";

import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export function Sidebar({
  items,
  role,
}: {
  items: NavItem[];
  role: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-navy-900 text-white min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-navy-700">
        <a href="/" className="block">
          <span className="text-lg font-bold">
            mitraductorjurado
            <span className="text-accent-400">.es</span>
          </span>
        </a>
        <span className="text-xs text-navy-400 capitalize mt-1 block">
          {role}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <a
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-navy-700 text-white"
                  : "text-navy-300 hover:bg-navy-800 hover:text-white"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </a>
          );
        })}
      </nav>

      {/* Cerrar sesión */}
      <div className="p-4 border-t border-navy-700">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-navy-400 hover:bg-navy-800 hover:text-white transition-colors"
        >
          <span>🚪</span>
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
