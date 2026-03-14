import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import type { EmailConfig } from "next-auth/providers/email";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/azure-mail";
import type { Role } from "@prisma/client";

// Importar las declaraciones de módulo para NextAuth
import "@/types";

// Custom email provider using Azure Graph API (same pattern as HolaBonjour)
function AzureEmailProvider(): EmailConfig {
  return {
    id: "email",
    type: "email",
    name: "Email",
    server: "", // Not used — we send via Azure Graph API
    from: process.env.EMAIL_FROM || "Mi Traductor Jurado <noreply@mitraductorjurado.es>",
    maxAge: 30 * 60, // 30 minutes
    async sendVerificationRequest({ identifier: email, url }) {
      const brandUrl = process.env.NEXTAUTH_URL || "https://mitraductorjurado.es";
      await sendMail({
        to: email,
        subject: "Accede a tu cuenta — mitraductorjurado.es",
        html: `
          <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:520px;margin:0 auto;">
            <div style="margin-bottom:16px;">
              <a href="${brandUrl}" style="text-decoration:none;" target="_blank" rel="noopener noreferrer">
                <strong style="font-size:20px;color:#1e293b;">mitraductorjurado</strong><strong style="font-size:20px;color:#2563eb;">.es</strong>
              </a>
            </div>
            <h2 style="color:#1e293b;margin-bottom:8px;">Tu enlace de acceso</h2>
            <p style="color:#334155;font-size:15px;line-height:1.5;">
              Haz clic en el siguiente botón para acceder a tu cuenta:
            </p>
            <p style="margin:24px 0;">
              <a href="${url}" style="display:inline-block;background:#1e293b;color:#ffffff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
                Acceder a mi cuenta
              </a>
            </p>
            <p style="color:#64748b;font-size:13px;line-height:1.4;">
              Si no solicitaste este enlace, puedes ignorar este email.
              El enlace caduca en 30 minutos.
            </p>
            <hr style="margin:24px 0 12px;border:0;border-top:1px solid #e2e8f0;" />
            <p style="color:#94a3b8;font-size:12px;">
              mitraductorjurado.es · HBTJ Consultores Lingüísticos S.L. ·
              <a href="mailto:info@mitraductorjurado.es" style="color:#2563eb;text-decoration:none;">info@mitraductorjurado.es</a>
            </p>
          </div>
        `,
      });
    },
    options: {},
  };
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    AzureEmailProvider(),
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
