# Sistema JWT en mitraductorjurado

## Cómo funciona
NextAuth v4 con estrategia JWT (stateless). No se guardan sesiones en DB.

### Claims del token
```typescript
{
  id: string;       // User.id (cuid)
  role: Role;       // "translator" | "client" | "admin"
  onboarded: boolean; // true si perfil completo
  email: string;
  name: string;
}
```

### Cómo se construye el token (lib/auth.ts)
1. **Primer login:** Se crea User en DB (PrismaAdapter). JWT callback recibe `user`.
2. **En cada jwt callback:** Si hay user o trigger="update", consulta DB:
   - Lee `role` y `name` de User
   - Lee si existe `TranslatorProfile` (para flag `onboarded`)
3. **Session callback:** Expone `role`, `id`, `onboarded` al cliente

### Lógica de `onboarded`
```
onboarded = tiene nombre Y (si es translator → tiene TranslatorProfile)
```

## Protección de rutas (middleware.ts)

### Matcher (rutas protegidas)
```
/dashboard/*
/api/orders/*  /api/payments/*  /api/documents/*
/api/assignments/*  /api/availability/*
```

### Lógica del middleware
1. Si no hay token → redirige a `/auth/login` (páginas) o 401 (API)
2. Si `!token.onboarded` → redirige a `/auth/onboarding?role=...`
3. Verifica rol:
   - `/dashboard/admin` → solo admin
   - `/dashboard/translator` → translator o admin
   - `/dashboard/client` → client o admin

## Leer token en server
```typescript
// En server components o API routes
import { getSession } from "@/lib/session";
const session = await getSession();
session.user.id    // string
session.user.role  // "translator" | "client" | "admin"
```

## Leer token en client
```typescript
"use client";
import { useSession } from "next-auth/react";
const { data: session } = useSession();
session?.user.role
```

## Refrescar sesión (tras cambio de rol)
```typescript
const { update } = useSession();
await update(); // fuerza re-fetch del JWT callback
```

## Cómo añadir un nuevo rol
1. Añadir al enum `Role` en `prisma/schema.prisma`
2. Correr `npx prisma migrate dev --name add-role-xxx`
3. Actualizar `types/index.ts` (ya usa el enum de Prisma, debería auto-resolver)
4. Añadir regla en `middleware.ts` para las rutas del nuevo rol
5. Crear layout en `app/dashboard/<nuevo-rol>/`

## Qué NO modificar sin revisar
- `lib/auth.ts` — cambios afectan a TODOS los tokens activos
- `middleware.ts` — error aquí bloquea acceso a toda la app
- `types/index.ts` — module augmentation de NextAuth
