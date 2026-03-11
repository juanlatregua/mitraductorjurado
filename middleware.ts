// middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Rutas de admin — solo role=admin
    if (path.startsWith("/dashboard/admin") && token?.role !== "admin") {
      return NextResponse.redirect(new URL("/auth/login?error=unauthorized", req.url));
    }

    // Rutas de traductor — solo role=translator o admin
    if (
      path.startsWith("/dashboard/translator") &&
      token?.role !== "translator" &&
      token?.role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/auth/login?error=unauthorized", req.url));
    }

    // Rutas de cliente — solo role=client o admin
    if (
      path.startsWith("/dashboard/client") &&
      token?.role !== "client" &&
      token?.role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/auth/login?error=unauthorized", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
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
