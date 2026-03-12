# ADR 003: NextAuth JWT en vez de Supabase Auth

## Contexto
Se necesita autenticación con:
- Roles (translator, client, admin)
- Email magic link + Google OAuth
- Control total sobre el flujo de onboarding
- Integración con Prisma

## Decisión
NextAuth v4 con estrategia JWT y PrismaAdapter.

## Razones
- NextAuth + PrismaAdapter = User/Account/Session ya en nuestra DB
- JWT stateless → no consulta DB en cada request
- Claims personalizados (`role`, `onboarded`) en el token
- Middleware de Next.js puede leer el JWT sin llamar a DB
- Control total sobre el flujo: login → verificación → onboarding → dashboard
- Email provider usa Resend (SMTP) → sin dependencia de Supabase

## Consecuencias
- Tokens son stateless: revocar un usuario requiere esperar expiración del JWT
- El campo `onboarded` se refresca en el JWT callback con `trigger === "update"`
- Module augmentation en `types/index.ts` para extender tipos de NextAuth
- Si se cambia un claim, los tokens existentes no se actualizan hasta refresh
