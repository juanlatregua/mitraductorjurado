/**
 * seed-maec.ts — Parsea el PDF oficial MAEC y puebla MAECRegistry
 *
 * Uso: npx ts-node --compiler-options '{"module":"commonjs"}' prisma/seed-maec.ts
 *
 * El PDF tiene estructura repetida:
 *   Cabecera idioma: ALEMÁN, FRANCÉS, etc.
 *   Cabecera país/provincia: ESPAÑA → MÁLAGA, etc.
 *   Filas: APELLIDOS Nombre - NNNNN
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import * as https from "https";

const prisma = new PrismaClient();

const PDF_URL =
  "https://www.traductor-jurado.org/blog/wp-content/uploads/2024/04/lista-traductores-jurados-maec-2024.pdf";
const PDF_PATH = path.join(__dirname, "maec-2024.pdf");

// Idiomas que aparecen como cabeceras en el PDF
const IDIOMAS_VALIDOS = new Set([
  "ALEMÁN", "ÁRABE", "BENGALÍ", "BIELORRUSO", "BÚLGARO", "CATALÁN",
  "CHECO", "CHINO", "CROATA", "DANÉS", "ESLOVACO", "ESLOVENO",
  "ESTONIO", "EUSKERA", "FINÉS", "FRANCÉS", "GALLEGO", "GRIEGO",
  "HEBREO", "HÚNGARO", "INGLÉS", "ISLANDÉS", "ITALIANO", "JAPONÉS",
  "LATÍN", "LETÓN", "LITUANO", "MACEDONIO", "NEERLANDÉS", "NORUEGO",
  "PERSA", "POLACO", "PORTUGUÉS", "RUMANO", "RUSO", "SERBIO",
  "SUECO", "TURCO", "UCRANIANO", "URDU",
]);

// Países conocidos en el PDF
const PAISES_VALIDOS = new Set([
  "ALEMANIA", "ANDORRA", "ARGENTINA", "AUSTRALIA", "AUSTRIA", "BÉLGICA",
  "BRASIL", "CANADÁ", "CHILE", "CHINA", "COLOMBIA", "CROACIA",
  "DINAMARCA", "ECUADOR", "EGIPTO", "EMIRATOS ÁRABES UNIDOS", "ESLOVAQUIA",
  "ESPAÑA", "ESTADOS UNIDOS", "ESTONIA", "FRANCIA", "GRECIA", "HUNGRÍA",
  "IRLANDA", "ISRAEL", "ITALIA", "JAPÓN", "LETONIA", "LUXEMBURGO",
  "MARRUECOS", "MÉXICO", "NORUEGA", "PAÍSES BAJOS", "PERÚ", "POLONIA",
  "PORTUGAL", "REINO UNIDO", "REPÚBLICA CHECA", "RUMANÍA", "RUSIA",
  "SINGAPUR", "SUECIA", "SUIZA", "TURQUÍA",
]);

// Provincias españolas
const PROVINCIAS_ESPAÑOLAS = new Set([
  "A CORUÑA", "ÁLAVA", "ALBACETE", "ALICANTE", "ALMERÍA", "ASTURIAS",
  "ÁVILA", "BADAJOZ", "BARCELONA", "BIZKAIA", "BURGOS", "CÁCERES",
  "CÁDIZ", "CANTABRIA", "CASTELLÓN", "CEUTA", "CIUDAD REAL", "CÓRDOBA",
  "CUENCA", "GIPUZKOA", "GIRONA", "GRANADA", "GUADALAJARA", "HUELVA",
  "HUESCA", "ILLES BALEARS", "JAÉN", "LAS PALMAS", "LEÓN", "LLEIDA",
  "LUGO", "MADRID", "MÁLAGA", "MELILLA", "MURCIA", "NAVARRA", "OURENSE",
  "PALENCIA", "PONTEVEDRA", "LA RIOJA", "SALAMANCA",
  "SANTA CRUZ DE TENERIFE", "SEGOVIA", "SEVILLA", "SORIA", "TARRAGONA",
  "TERUEL", "TOLEDO", "VALENCIA", "VALLADOLID", "ZAMORA", "ZARAGOZA",
]);

interface RawTranslator {
  tij: string;
  nombre: string;
  idioma: string;
  provincia: string;
  pais: string;
}

async function downloadPDF(): Promise<Buffer> {
  if (fs.existsSync(PDF_PATH)) {
    console.log("PDF ya descargado, usando caché local");
    return fs.readFileSync(PDF_PATH);
  }

  console.log("Descargando PDF del MAEC...");
  return new Promise((resolve, reject) => {
    function follow(url: string, redirects = 0) {
      if (redirects > 5) return reject(new Error("Too many redirects"));
      const mod = url.startsWith("https") ? https : require("http");
      mod.get(url, (res: any) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return follow(res.headers.location, redirects + 1);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => {
          const buf = Buffer.concat(chunks);
          fs.writeFileSync(PDF_PATH, buf);
          console.log(`PDF descargado: ${(buf.length / 1024 / 1024).toFixed(1)} MB`);
          resolve(buf);
        });
        res.on("error", reject);
      }).on("error", reject);
    }
    follow(PDF_URL);
  });
}

function isIdiomaHeader(line: string): boolean {
  const trimmed = line.trim();
  return IDIOMAS_VALIDOS.has(trimmed);
}

function isPaisHeader(line: string): boolean {
  const trimmed = line.trim();
  return PAISES_VALIDOS.has(trimmed);
}

function isProvinciaHeader(line: string): boolean {
  const trimmed = line.trim();
  return PROVINCIAS_ESPAÑOLAS.has(trimmed);
}

/**
 * Extrae el TIJ de una línea de traductor.
 * Formatos reales del PDF MAEC:
 *   "APELLIDOS, Nombre  -  9995/ 690 74 14 92L18/01/2013"  (TIJ seguido de teléfono+fecha)
 *   "APELLIDOS, Nombre  -  9213+49 177 422 6841  /L30/11/2011"  (TIJ pegado a teléfono)
 *   "APELLIDOS, Nombre  -  \n2605\nC01/01/1994"  (TIJ en línea siguiente)
 *   "APELLIDOS, Nombre  -  3850"  (formato simple)
 */
function extractTIJ(line: string): { nombre: string; tij: string } | null {
  // Formato principal: "NOMBRE  -  TIJ[basura]"
  // El TIJ es el primer grupo de 1-5 dígitos después del dash
  const dashMatch = line.match(/^(.+?)\s*[-–—]\s+(\d{1,5})/);
  if (dashMatch && dashMatch[1].length > 3) {
    return { nombre: dashMatch[1].trim(), tij: dashMatch[2] };
  }

  return null;
}

/**
 * Detecta líneas que son nombre de traductor pero con el TIJ en la línea siguiente.
 * Formato: "APELLIDOS, Nombre  -" (termina en dash sin número)
 */
function isTrailingDash(line: string): string | null {
  const match = line.match(/^(.+?)\s*[-–—]\s*$/);
  if (match && match[1].length > 3 && /[A-ZÁÉÍÓÚÑÜ]/.test(match[1][0])) {
    return match[1].trim();
  }
  return null;
}

function parsePDFText(text: string): RawTranslator[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const translators: RawTranslator[] = [];

  let currentIdioma = "";
  let currentPais = "ESPAÑA";
  let currentProvincia = "";
  let pendingName: string | null = null; // nombre esperando TIJ en línea siguiente

  // Líneas que ignoramos
  const SKIP_PATTERNS = [
    /^APELLIDOS y Nombre/,
    /^Dirección$/,
    /^Cpos Localidad$/,
    /^Teléfono$/,
    /^Email$/,
    /^Vía acceso$/,
    /^Tipo título$/,
    /^Año$/,
    /^nombramiento$/,
    /^Activo$/,
    /^No Activo$/,
    /^Traductor/,
    /^Traductora/,
    /^Intérprete/,
    /^Jurad[oa]$/,
    /^\d+C: Examen/,
    /^MINISTERIO$/,
    /^DE ASUNTOS EXTERIORES/,
    /^Y COOPERACIÓN$/,
    /^DE TRADUCTORES/,
    /^JURADOS/,
    /^https?:\/\//,
    /^[a-z0-9._+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i, // email
    /^\+?\d[\d\s().\/-]{5,}$/, // solo teléfono
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Si hay un nombre pendiente, buscar TIJ en esta línea
    if (pendingName) {
      const tijMatch = line.match(/^(\d{1,5})/);
      if (tijMatch && currentIdioma) {
        translators.push({
          tij: tijMatch[1],
          nombre: pendingName,
          idioma: currentIdioma,
          provincia: currentProvincia || currentPais,
          pais: currentPais,
        });
      }
      pendingName = null;
      continue;
    }

    // Ignorar líneas conocidas
    if (SKIP_PATTERNS.some((p) => p.test(line))) continue;

    // Detectar cabecera de idioma
    if (isIdiomaHeader(line)) {
      currentIdioma = line.trim();
      currentPais = "ESPAÑA";
      currentProvincia = "";
      continue;
    }

    // Detectar cabecera de país
    if (isPaisHeader(line)) {
      currentPais = line.trim();
      currentProvincia = currentPais === "ESPAÑA" ? "" : currentPais;
      continue;
    }

    // Detectar cabecera de provincia (solo dentro de ESPAÑA)
    if (currentPais === "ESPAÑA" && isProvinciaHeader(line)) {
      currentProvincia = line.trim();
      continue;
    }

    // Intentar parsear como traductor
    if (!currentIdioma) continue;

    // Caso 1: TIJ en la misma línea
    const parsed = extractTIJ(line);
    if (parsed) {
      translators.push({
        tij: parsed.tij,
        nombre: parsed.nombre,
        idioma: currentIdioma,
        provincia: currentProvincia || currentPais,
        pais: currentPais,
      });
      continue;
    }

    // Caso 2: Nombre termina en dash, TIJ en línea siguiente
    const trailing = isTrailingDash(line);
    if (trailing) {
      pendingName = trailing;
      continue;
    }
  }

  return translators;
}

/**
 * Agrupa traductores por TIJ — un traductor puede tener varios idiomas
 */
function groupByTIJ(raw: RawTranslator[]): Map<string, {
  tij: string;
  nombre: string;
  idiomas: string[];
  provincia: string;
  pais: string;
}> {
  const grouped = new Map<string, {
    tij: string;
    nombre: string;
    idiomas: string[];
    provincia: string;
    pais: string;
  }>();

  for (const t of raw) {
    const existing = grouped.get(t.tij);
    if (existing) {
      if (!existing.idiomas.includes(t.idioma)) {
        existing.idiomas.push(t.idioma);
      }
    } else {
      grouped.set(t.tij, {
        tij: t.tij,
        nombre: t.nombre,
        idiomas: [t.idioma],
        provincia: t.provincia,
        pais: t.pais,
      });
    }
  }

  return grouped;
}

async function main() {
  console.log("=== Seed MAEC Registry ===\n");

  // 1. Descargar PDF
  const pdfBuffer = await downloadPDF();

  // 2. Extraer texto
  console.log("Extrayendo texto del PDF...");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse");
  const pdfData = await pdfParse(pdfBuffer);
  console.log(`Páginas: ${pdfData.numpages}`);
  console.log(`Caracteres: ${pdfData.text.length.toLocaleString()}`);

  // 3. Parsear texto
  console.log("\nParseando traductores...");
  const raw = parsePDFText(pdfData.text);
  console.log(`Entradas raw extraídas: ${raw.length}`);

  // 4. Agrupar por TIJ
  const grouped = groupByTIJ(raw);
  console.log(`Traductores únicos: ${grouped.size}`);

  // Mostrar stats por idioma
  const idiomaCounts = new Map<string, number>();
  for (const t of raw) {
    idiomaCounts.set(t.idioma, (idiomaCounts.get(t.idioma) || 0) + 1);
  }
  console.log("\nDistribución por idioma:");
  Array.from(idiomaCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([idioma, count]) => console.log(`  ${idioma}: ${count}`));

  // 5. Upsert en base de datos
  console.log("\nInsertando en MAECRegistry...");
  let created = 0;
  let updated = 0;

  const entries = Array.from(grouped.values());

  // Batch in groups of 50 for performance
  const BATCH_SIZE = 50;
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    await prisma.$transaction(
      batch.map((t) =>
        prisma.mAECRegistry.upsert({
          where: { tij: t.tij },
          create: {
            tij: t.tij,
            nombre: t.nombre,
            idiomas: t.idiomas,
            provincia: t.provincia,
            pais: t.pais,
            activo: true,
          },
          update: {
            nombre: t.nombre,
            idiomas: t.idiomas,
            provincia: t.provincia,
            pais: t.pais,
            activo: true,
          },
        })
      )
    );
    created += batch.length;
    if (created % 500 === 0 || i + BATCH_SIZE >= entries.length) {
      console.log(`  Progreso: ${Math.min(created, entries.length)}/${entries.length}`);
    }
  }

  // 6. Stats finales
  const total = await prisma.mAECRegistry.count();
  console.log(`\n✓ MAECRegistry total: ${total} registros`);
  console.log("Done!");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
