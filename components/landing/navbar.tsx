"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed top-0 w-full z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? "rgba(26,58,42,0.85)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(16px)" : "none",
        borderBottom: scrolled
          ? "1px solid rgba(255,255,255,0.08)"
          : "1px solid transparent",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/">
          <Logo size="sm" variant="dark" />
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/translators"
            className="hidden sm:inline-block font-sans text-sm font-light px-4 py-2 rounded-lg transition-colors"
            style={{ color: "rgba(255,255,255,0.6)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
          >
            Directorio
          </Link>

          {/* Separator */}
          <span
            className="hidden sm:inline-block"
            style={{ width: 1, height: 16, background: "rgba(255,255,255,0.12)" }}
          />

          <Link
            href="/auth/login"
            className="font-sans text-sm font-light px-4 py-2 rounded-lg transition-colors"
            style={{ color: "rgba(255,255,255,0.6)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#fff")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
          >
            Soy cliente
          </Link>

          <Link
            href="/auth/login"
            className="font-sans text-sm font-medium px-5 py-2 rounded-full transition-all btn-glow"
            style={{ backgroundColor: "var(--color-accent)", color: "#fff" }}
          >
            Soy traductor
          </Link>
        </div>
      </div>
    </nav>
  );
}
