import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;
    const isApiRoute = path.startsWith("/api/");

    // Helper: responder con error según tipo de ruta
    function unauthorized() {
      if (isApiRoute) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      return NextResponse.redirect(
        new URL("/auth/login?error=unauthorized", req.url)
      );
    }

    // Redirigir a onboarding si perfil incompleto
    if (
      path.startsWith("/dashboard") &&
      token &&
      !token.onboarded
    ) {
      const role = token.role === "translator" ? "translator" : "client";
      return NextResponse.redirect(
        new URL(`/auth/onboarding?role=${role}`, req.url)
      );
    }

    // Rutas de admin — solo role=admin
    if (path.startsWith("/dashboard/admin") && token?.role !== "admin") {
      return unauthorized();
    }

    // Rutas de traductor — solo role=translator o admin
    if (
      path.startsWith("/dashboard/translator") &&
      token?.role !== "translator" &&
      token?.role !== "admin"
    ) {
      return unauthorized();
    }

    // Rutas de cliente — solo role=client o admin
    if (
      path.startsWith("/dashboard/client") &&
      token?.role !== "client" &&
      token?.role !== "admin"
    ) {
      return unauthorized();
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // API routes: devolver 401 si no hay token
        if (req.nextUrl.pathname.startsWith("/api/")) {
          return !!token;
        }
        // Dashboard routes: requerir token
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/orders/:path*",
    "/api/payments/:path*",
    "/api/documents/:path*",
    "/api/assignments/:path*",
    "/api/availability/:path*",
  ],
};
