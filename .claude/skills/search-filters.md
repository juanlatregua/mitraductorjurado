# Directorio público y filtros de traductores

## Estado: COMPLETADO (S3 Directorio + S14 MAEC Registry)

### Páginas
- `/translators` — Grid de cards con filtros, paginación SSR, query params en URL
- `/translators/[id]` — Perfil individual con `generateMetadata()` para SEO

### Filtros implementados
| Filtro | Campo en DB | Tipo UI |
|--------|------------|---------|
| Par de idiomas | LanguagePair.sourceLang/targetLang | Select dinámico |
| Especialidad | Specialty.category | Checkboxes (5 categorías) |
| Provincia | TranslatorProfile.province | Select (52 provincias) |
| Disponibilidad | TranslatorProfile.availabilityStatus | Toggle |
| Valoración mínima | TranslatorProfile.avgRating | Slider/select |
| Texto libre | User.name, LanguagePair | ILIKE en Prisma |

### Componentes
- `components/translators/TranslatorCard.tsx` — Card con foto, idiomas, MAEC badge
- `components/translators/SearchFilters.tsx` — Panel de filtros lateral

### Datos para filtros
- Idiomas: 30+ definidos en `LANG_CODE` map (lib/constants.ts + landing helpers)
- 5 categorías: academico, notarial, administrativo, economico, juridico
- 52 provincias españolas
- Enum AvailabilityStatus: available, busy, vacation

### MAECRegistry (S14)
- 10,624 traductores jurados importados del PDF oficial MAEC
- Modelo: `tij` (int), `nombre` ("APELLIDOS, Nombre"), `idiomas` (String[]), `provincia`, `activo`
- Landing page muestra traductores reales de MAECRegistry con fallback
- Perfiles "claimed" = tienen TranslatorProfile.maecNumber = "N.{tij}"
- Perfiles unclaimed muestran "MAEC ····" (número oculto)

### Índices
```
TranslatorProfile: @@index([tenantId]), @@index([verified]), @@index([province])
LanguagePair: @@index([tenantId]), @@index([sourceLang, targetLang])
MAECRegistry: @@index([tenantId]), @@index([tij]), @@index([provincia])
```

### SEO
- `/sitemap.xml` — dinámico con todos los perfiles verificados
- Cada `/translators/[id]` tiene `generateMetadata()` con nombre, idiomas, provincia
