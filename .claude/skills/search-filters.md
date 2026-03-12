# Búsqueda y filtros de traductores

## Estado actual: TODO
El directorio público `/translators` con búsqueda es la siguiente tarea (Sprint 3).
La página de perfil individual `/translators/[id]` SÍ está implementada.

## Diseño previsto

### Página: `/translators` (o `/traductores` para SEO)
Grid de cards con paginación SSR. Query params en URL para filtros compartibles.

### Filtros disponibles (por implementar)
| Filtro | Campo en DB | Tipo UI |
|--------|------------|---------|
| Par de idiomas | LanguagePair.sourceLang/targetLang | Select dinámico |
| Especialidad | Specialty.category | Checkboxes (5 categorías) |
| Provincia | TranslatorProfile.province | Select (52 provincias) |
| Disponibilidad | TranslatorProfile.availabilityStatus | Toggle |
| Valoración mínima | TranslatorProfile.avgRating | Slider/select |
| Texto libre | User.name, LanguagePair | ILIKE en Prisma |

### Datos ya existentes para filtros
- 15 idiomas definidos en constante (fr, en, de, it, pt, ar, zh, ja, ru, ro, pl, nl, ca, eu, gl)
- 5 categorías DocumentCategory (academico, notarial, administrativo, economico, juridico)
- 52 provincias españolas
- Enum AvailabilityStatus (available, busy, vacation)

## Cómo añadir un filtro nuevo (cuando se implemente)
1. Añadir query param en la URL (`?idioma=fr&provincia=Madrid`)
2. Parsear params en el server component
3. Construir `where` clause de Prisma con los filtros activos
4. Añadir UI del filtro (select, checkbox, etc.)
5. Asegurar que el índice de Prisma cubre el campo (ver `@@index` en schema)

## Índices existentes en schema
```
TranslatorProfile: @@index([tenantId]), @@index([verified]), @@index([province])
LanguagePair: @@index([tenantId]), @@index([sourceLang, targetLang])
```

## SEO
La página `/translators` debe generar sitemap dinámico con todos los perfiles
verificados. Cada perfil `/translators/[id]` ya tiene `generateMetadata()`.
