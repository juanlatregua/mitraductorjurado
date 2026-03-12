# Auth API — Contexto local

## Sistema JWT
- NextAuth v4 con estrategia JWT (stateless, no consulta DB por request)
- PrismaAdapter sincroniza User/Account/Session con nuestra DB
- Configuración principal: `lib/auth.ts`

## Claims del token JWT
| Claim | Tipo | Origen |
|-------|------|--------|
| `id` | string | User.id de Prisma |
| `role` | Role (translator\|client\|admin) | User.role |
| `onboarded` | boolean | Calculado: tiene nombre Y (si translator, tiene TranslatorProfile) |

## Cómo se refresca el token
- En login inicial: `user` objeto presente → se setean claims
- En `trigger === "update"`: consulta DB para refrescar role y onboarded
- El cliente llama `update()` de `useSession()` para forzar refresh (ej: después de onboarding)

## Rutas en este directorio
- `[...nextauth]/route.ts` — Handler NextAuth (GET/POST). NO modificar salvo que se añadan providers.
- `onboarding/route.ts` — POST con Zod validation. Crea TranslatorProfile + LanguagePairs + Specialties en transacción.

## NO modificar sin entender consecuencias
- `lib/auth.ts` — Cambiar la lógica de `onboarded` afecta a quién puede acceder al dashboard
- `middleware.ts` — Cambiar el matcher afecta qué rutas están protegidas
- `types/index.ts` — Module augmentation de NextAuth. Si se añade un claim, hay que añadirlo aquí Y en el JWT callback

## Providers configurados
1. **EmailProvider** — Resend SMTP (smtp.resend.com:465)
2. **GoogleProvider** — Condicional: solo se activa si GOOGLE_CLIENT_ID existe en env

## Páginas de auth
- `/auth/login` — Email magic link + Google OAuth
- `/auth/register` — Selección de rol + email signup
- `/auth/onboarding` — Formularios por rol (TranslatorOnboarding / ClientOnboarding)
- `/auth/verify` — "Revisa tu email"
- `/auth/error` — Errores de auth
