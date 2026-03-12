import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

// Importar las declaraciones de módulo para NextAuth
import "@/types";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.SMTP_HOST || "smtp.office365.com",
        port: parseInt(process.env.SMTP_PORT || "587", 10),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      },
      from: process.env.SMTP_FROM || "noreply@mitraductorjurado.es",
    }),
    ...(process.env.GOOGLE_CLIENT_ID
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      // Refrescar datos desde DB al crear sesión o al hacer update
      if ((user || trigger === "update") && token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            role: true,
            name: true,
            translatorProfile: { select: { id: true } },
          },
        });
        if (dbUser) {
          token.role = dbUser.role;
          // onboarded = tiene nombre Y (si es translator, tiene perfil)
          token.onboarded =
            !!dbUser.name &&
            (dbUser.role !== "translator" || !!dbUser.translatorProfile);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as Role;
        session.user.id = token.id as string;
        session.user.onboarded = token.onboarded as boolean;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    verifyRequest: "/auth/verify",
    error: "/auth/error",
    newUser: "/auth/onboarding",
  },
  session: {
    strategy: "jwt",
  },
};
