# Dashboard Traductor — Contexto local

## Acceso
- Ruta: `/dashboard/translator/*`
- Roles permitidos: `translator`, `admin` (middleware.ts)
- Requiere `onboarded === true` en JWT (si no, redirige a /auth/onboarding)

## Páginas implementadas
- `/dashboard/translator` — Dashboard principal con KPIs, toggle de disponibilidad, acciones rápidas
- `/dashboard/translator/profile` — Editor de perfil completo (foto, bio, MAEC, idiomas, especialidades, tarifas)

## API routes del traductor
| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/translator/profile` | GET | Perfil con languagePairs y specialties |
| `/api/translator/profile` | PUT | Actualiza perfil (transacción: delete+create pares y especialidades) |
| `/api/translator/photo` | POST | Upload foto a Vercel Blob (max 5MB, image/*) |
| `/api/translator/availability-status` | PUT | Toggle available/busy/vacation |

## Componentes
- `components/dashboard/sidebar.tsx` — Sidebar compartido, recibe navItems por rol
- `components/dashboard/kpi-card.tsx` — Tarjeta KPI reutilizable
- `components/dashboard/availability-toggle.tsx` — Tres botones de estado (client component)

## Datos del dashboard (estado actual)
- KPIs están hardcodeados a 0 — se conectarán cuando existan Orders (Sprint 3)
- La disponibilidad sí lee de DB (`prisma.translatorProfile.findUnique`)

## Perfil público
- `/translators/[id]` — Página pública con `generateMetadata()` para SEO
- Muestra: foto, nombre, MAEC, idiomas, especialidades, rating, tarifas, bio, badge verificado

## Onboarding del traductor
1. Registro en `/auth/register` → selecciona rol "translator"
2. Magic link → login → JWT tiene `onboarded: false`
3. Middleware redirige a `/auth/onboarding?role=translator`
4. Formulario: nombre, MAEC, provincia, idiomas, especialidades
5. POST `/api/auth/onboarding` → crea TranslatorProfile + LanguagePairs + Specialties
6. `update()` de useSession → JWT se refresca con `onboarded: true`
7. Redirige a `/dashboard/translator`

## TODO (sprints futuros)
- Sprint 3: Pedidos — lista de pedidos, detalle, aceptar/rechazar
- Sprint 4: Stripe Connect onboarding — vincular cuenta Express
- Sprint 5: Editor bilingüe — traducción con plantillas
- Sprint 7: Widget embebible — configuración y leads
