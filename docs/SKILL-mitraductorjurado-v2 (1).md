---
name: mitraductorjurado-web
description: >
  Desarrollo completo de mitraductorjurado.es — plataforma SaaS + marketplace
  para traductores jurados de España. Usar cuando el usuario mencione
  "mitraductorjurado", "el marketplace", "la plataforma", "el editor de traducción",
  "vista bilingüe", "plantillas de documentos", "red de colegas", "derivar trabajo",
  "disponibilidad traductor", "Stripe Connect traductores", "dashboard traductor",
  "base de plantillas", "tipos de documento", "OCR plataforma", "DeepL integrado",
  "firma eIDAS", "Verifactu", "widget embebible", o cualquier tarea de código,
  arquitectura, producto o diseño relacionada con este proyecto.
metadata:
  author: Juan Antonio — HBTJ Consultores Lingüísticos S.L.
  version: 2.0.0
  category: web-development
---

# mitraductorjurado.es — Plataforma SaaS + Marketplace

## Visión del producto

**No es un directorio de traductores. Es el sistema operativo del traductor jurado.**

Tres capas de valor integradas en una sola plataforma:

1. **Editor de traducción jurada** — elimina el stack fragmentado (Adobe + DeepL + Word + plantilla manual + PDF manual + firma escaneada) con un flujo integrado de extremo a extremo.
2. **Base de conocimiento colaborativa** — plantillas estructurales de los ~35 tipos de documento oficial más frecuentes, por idioma. El OCR falla en documentos deteriorados; la base de plantillas lo resuelve.
3. **Red de derivación profesional** — digitaliza el sistema informal de WhatsApp entre colegas que ya existe: disponibilidad, precio, asignación, pago y facturación automáticos.

**Fundador:** Juan Antonio, Traductor-Intérprete Jurado de Francés N.3850, opera el sector desde dentro.

---

## El problema real (flujo actual sin la plataforma)

```
PDF recibido (frecuentemente mal escaneado)
    ↓
Adobe Acrobat Pro → exportar a Word (OCR manual)
    ↓
Copiar texto Word → pegar en DeepL en pantalla (lento, caro si es PDF)
    ↓
Copiar traducción DeepL → pegar en plantilla Word propia
    ↓
Corregir márgenes, espacios, saltos de línea (siempre están mal)
    ↓
Añadir cabecera en cada página + leyenda de firma en última página (manual)
    ↓
Revisión: leer traducción sin referencia visual al original → imprimir o dos pantallas
    ↓
Adobe: crear PDF nuevo uniendo original + traducción (manual)
    ↓
Firmar con certificado digital
    ↓
Guardar en carpeta de cliente (estructura manual)
    ↓
Enviar por email o WhatsApp
```

**8 fricciones identificadas. El editor de la plataforma elimina 7.**

---

## El flujo con la plataforma

```
Subir PDF → OCR automático + reconocimiento de tipo de documento
    ↓
Si documento deteriorado → cargar plantilla estructural del tipo reconocido
    ↓
DeepL integrado → borrador aparece automáticamente en vista bilingüe
    ↓
Revisión en vista bilingüe (original izquierda / traducción derecha, sincronizada)
    ↓
Al aprobar → PDF generado automáticamente con plantilla, cabeceras, leyenda
    ↓
Firma electrónica eIDAS (Signaturit) → certificado reconocido, legalmente superior a imagen escaneada
    ↓
PDF final guardado en expediente del cliente dentro de la plataforma
    ↓
Entrega al cliente desde la plataforma (email automático)
```

---

## Red de derivación entre colegas

### Contexto real
Los ~99 early adopters son colegas que ya se derivan trabajo entre sí por WhatsApp.
El flujo actual es: WhatsApp para pedir disponibilidad → precio por mensaje → cálculo mental del margen → confirmación al cliente → reconfirmación al colega → dos facturas separadas (colega al cliente directo no, colega a Juan Antonio, Juan Antonio al cliente).

**Plazos reales: 24-48 horas. Nunca en el día salvo casos excepcionales.**

### Flujo digitalizado
```
Llega encargo de idioma no disponible (ej: alemán)
    ↓
Plataforma muestra colegas disponibles con idioma + tarifa publicada
    ↓
Seleccionar colega → enviar encargo con documento adjunto
    ↓
Colega acepta (1 clic) → queda asignado
    ↓
Cliente confirma → trabajo comienza
    ↓
Colega entrega en plataforma → Juan Antonio revisa → entrega al cliente
    ↓
Stripe Connect divide el pago automáticamente:
  - Colega recibe su tarifa
  - Juan Antonio recibe su comisión (margen)
    ↓
Verifactu genera ambas facturas automáticamente
```

### Reglas de negocio
- El cliente siempre contrata con quien recibió el encargo (responsabilidad legal única)
- El colega factura a la plataforma, no al cliente final
- El margen lo fija quien deriva, no la plataforma
- La disponibilidad es declarada por el traductor (semana actual + siguiente)

---

## Base de conocimiento — Tipos de documento

### Categorías y tipos (~35 documentos cubren el 80% del volumen)

**Académico**
- Títulos universitarios: Licence, Master, Grado
- Expediente académico universitario (por año)
- Certificados de obtención de título
- Planes de estudios
- Títulos DELF/DALF y equivalentes (alemán, inglés, italiano)
- Expediente de secundaria

**Notarial**
- Actas de notoriedad
- Documentos de sucesiones
- DNI
- Certificados de defunción
- Certificados de nacimiento
- Libro de familia
- Certificados de últimas voluntades
- Poderes notariales
- Capitulaciones matrimoniales

**Administrativo**
- Certificados de empadronamiento
- Certificados de paro (desempleo)
- Vida laboral
- Certificado de antecedentes penales

**Económico**
- Kbis (registro mercantil francés)
- Registro comercial
- Declaraciones/pagos de impuestos
- Nóminas / certificados de salarios
- Certificados bancarios (saldo, pago de nóminas)
- Estatutos de sociedades

**Jurídico**
- Sentencias judiciales
- [completar con Juan Antonio]

### Cómo funciona la base de plantillas
Cada tipo de documento tiene:
- Estructura fija (secciones predecibles)
- Variables (nombre, fecha, número, lugar — datos que cambian en cada documento)
- Terminología específica por idioma de origen
- Ejemplo anonimizado de referencia

Cuando el OCR no puede leer el original (documento deteriorado), el sistema:
1. Reconoce el tipo de documento por contexto visual/parcial
2. Carga la plantilla estructural
3. El traductor completa solo las variables legibles

---

## Disponibilidad y urgencia

- Plazos estándar del sector: **24-48 horas**
- El cliente suele llegar en el último eslabón de su propio proceso (cita en consulado mañana, firma el jueves, plazo de matrícula el viernes)
- La urgencia es del cliente, no del flujo de trabajo interno
- Cuando el traductor está disponible + documento es de tipo conocido (plantilla) + una página → posible entrega en menos de 1 hora
- La disponibilidad en el dashboard es por franjas horarias de la semana actual + siguiente
- Los presupuestos llevan fecha/hora de expiración explícita

---

## Stack técnico

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 14 + App Router + TypeScript |
| Base de datos | PostgreSQL + Prisma |
| Multi-tenancy | Campo `tenantId` en todos los modelos desde día 1 |
| RLS | Row-Level Security en PostgreSQL desde Sprint 0 |
| Auth | NextAuth — JWT con campo `role` |
| Pagos | Stripe Connect (Express) |
| Facturación | Verifactu (obligatorio 2027) |
| Firma electrónica | Signaturit / eIDAS (Orden AUC/213/2025) |
| OCR | Integración con Adobe PDF Services API o alternativa |
| Traducción | DeepL API integrada en el editor |
| Hosting | Vercel |
| Estilos | Tailwind CSS |
| Email | Resend |
| Almacenamiento | Vercel Blob |

---

## Roles del sistema

| Rol | Descripción |
|-----|-------------|
| `translator` | Traductor jurado MAEC registrado. Perfil público, recibe y ejecuta pedidos, puede derivar a colegas |
| `client` | Particular o empresa. Solicita traducciones, paga, descarga |
| `admin` | Juan Antonio. Gestión de plataforma, verificación MAEC, métricas |

---

## Modelo de datos Prisma (principales entidades)

```prisma
User                  // base para todos los roles
TranslatorProfile     // perfil público + disponibilidad + tarifa + stripeAccountId
LanguagePair          // combinaciones de idiomas por traductor
Availability          // franjas horarias por semana
DocumentTemplate      // plantillas estructurales por tipo de documento e idioma
Order                 // pedido — estados: pending|quoted|accepted|in_progress|delivered|closed|cancelled
OrderAssignment       // asignación de un Order a un colega (derivación)
Review                // valoración cliente→traductor
Payment               // transacción Stripe Connect
Invoice               // factura Verifactu
```

---

## Estructura de directorios Next.js

```
/app
  /api/
    /auth/            → NextAuth
    /orders/          → CRUD pedidos
    /payments/        → Stripe Connect
    /documents/       → OCR, DeepL, generación PDF
    /templates/       → Base de plantillas
    /availability/    → Disponibilidad traductores
    /assignments/     → Derivación entre colegas
    /webhooks/        → Stripe, Signaturit, Verifactu
  /dashboard/
    /translator/      → Dashboard del traductor (editor, pedidos, disponibilidad, ingresos, colegas)
    /client/          → Dashboard del cliente (pedidos, facturas, descargas)
    /admin/           → Panel admin (usuarios, verificaciones, métricas, Verifactu monitor)
  /translators/       → Directorio público
  /translators/[id]/  → Perfil público verificado
  /auth/              → Login, registro, onboarding por rol
  /precios/           → Landing pricing
  /traductores/       → Landing captación traductores (SEO)
```

---

## Diseño / UX

**Referente:** Lo que ProZ debería haber sido si lo rediseñaran hoy.
**Principio:** Claridad sobre densidad. El dashboard responde en < 3 segundos sin clic: ¿Tengo pedidos nuevos? ¿Qué entrego hoy? ¿Cuánto he cobrado este mes?
**Paleta:** Azul marino institucional + blanco + acento cálido. Transmite autoridad jurídica sin ser frío.
**Tipografía:** Serif para headings (peso jurídico) + sans-serif para UI.
**NO app móvil** en Fase 1 ni Fase 2. PWA para notificaciones push cuando haya volumen.
**Desktop first** — el trabajo real (revisión bilingüe, gestión de documentos) siempre ocurre en escritorio.

---

## Fases y gates de negocio

### Fase 1 — SaaS para traductores
**Gate de salida: 50 traductores activos + MRR ≥ 2.000€**
- Editor de traducción integrado
- Base de plantillas de documentos
- Red de derivación entre colegas
- Firma eIDAS + Verifactu
- Widget embebible para web del traductor

### Fase 2 — Marketplace público
**Solo se activa cuando Fase 1 supera el gate**
- Directorio público con búsqueda
- Perfiles verificados con badge MAEC
- Asignación automática por disponibilidad e idioma
- Reviews y reputación pública

---

## Modelo económico

- **Precio fundador:** 49€/mes por traductor
- **Break-even:** 13 suscriptores
- **Inversión inicial real:** < 600€ (15€ dominio + ~25€/mes base de datos)
- **Comisión por derivación:** % sobre transacción (pendiente de fijar)
- **Fase 2:** comisión por pedido directo del marketplace público

---

## Prioridades de desarrollo (orden de sprints)

1. **S0** — Repo, DB con RLS, Prisma schema, NextAuth, middleware, Vercel
2. **S1** — Auth completo, onboarding por rol, dashboards esqueleto
3. **S2** — Perfil traductor + verificación MAEC + perfil público
4. **S3** — Editor bilingüe: OCR + DeepL + vista paralela + generación PDF
5. **S4** — Base de plantillas de documentos (35 tipos)
6. **S5** — Flujo de pedido completo (sin pago)
7. **S6** — Stripe Connect + pagos reales
8. **S7** — Red de derivación entre colegas (digitalizar WhatsApp)
9. **S8** — Firma eIDAS + Verifactu
10. **S9** — Widget embebible + captación
11. **S10** — Lanzamiento early adopters (99 traductores)

---

## Comandos frecuentes

```bash
# Desarrollo local
npm run dev

# Prisma
npx prisma migrate dev --name [nombre]
npx prisma generate
npx prisma studio

# Build / deploy
npm run build
vercel --prod
```

---

## Contexto competitivo

| Herramienta | Problema que tiene |
|-------------|-------------------|
| ProZ | UI densa e inaccesible, no especializado en traducción jurada española |
| Trados | Pesado, caro, curva de aprendizaje brutal, bases de datos lentas |
| DeepL | No integrado con el flujo, caro en PDF, sin plantillas de documentos oficiales |
| Adobe Acrobat | Solo OCR y ensamblado PDF, sin nada de traducción ni gestión |
| Agencias | Intermediario que encarece y ralentiza, sin control para el traductor |

**La plataforma no compite con ninguna herramienta individual. Las reemplaza todas.**
