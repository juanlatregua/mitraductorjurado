/**
 * Slug utilities for SEO-friendly translator profile URLs.
 *
 * Format: nombre-apellido-3850
 * Example: "GARCIA LOPEZ, Juan Antonio" + "N.3850" -> "juan-antonio-garcia-lopez-3850"
 *
 * No DB column needed -- slugs are generated on the fly from name + MAEC number.
 */

/**
 * Remove diacritics / accents from a string.
 * Uses NFD decomposition + strip combining marks (safe for ES3 target -- no \p{} regex).
 */
function removeAccents(str: string): string {
  // NFD decomposes e.g. "é" into "e" + combining acute accent
  // Then we strip the combining diacritical marks range U+0300-U+036F
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Extract the numeric part from a MAEC number string.
 * "N.3850" -> "3850", "3850" -> "3850", "N.12345" -> "12345"
 */
function extractMaecDigits(maecNumber: string): string {
  const match = maecNumber.match(/(\d+)/);
  return match ? match[1] : maecNumber;
}

/**
 * Generate an SEO-friendly slug from a translator name and MAEC number.
 *
 * @param name - User.name (e.g. "Juan Antonio Garcia Lopez")
 *               or MAEC registry format "APELLIDOS, Nombre"
 * @param maecNumber - e.g. "N.3850"
 * @returns slug e.g. "juan-antonio-garcia-lopez-3850"
 */
export function generateTranslatorSlug(name: string, maecNumber: string): string {
  // If name is in "APELLIDOS, Nombre" format, reorder to "Nombre Apellidos"
  let normalized = name;
  const commaIdx = name.indexOf(",");
  if (commaIdx > 0) {
    const apellidos = name.slice(0, commaIdx).trim();
    const given = name.slice(commaIdx + 1).trim();
    normalized = `${given} ${apellidos}`;
  }

  const digits = extractMaecDigits(maecNumber);

  const slug = removeAccents(normalized)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // strip non-alphanumeric (except spaces and hyphens)
    .replace(/\s+/g, "-")          // spaces -> hyphens
    .replace(/-+/g, "-")           // collapse multiple hyphens
    .replace(/^-|-$/g, "");        // trim leading/trailing hyphens

  return slug ? `${slug}-${digits}` : digits;
}

/**
 * Parse the MAEC number digits from the end of a slug.
 * "juan-antonio-garcia-lopez-3850" -> "3850"
 * Returns null if no trailing number is found.
 */
export function parseSlugMaecNumber(slug: string): string | null {
  const match = slug.match(/-(\d+)$/);
  return match ? match[1] : null;
}

/**
 * Check if a string looks like a cuid (Prisma default ID format).
 * cuids start with 'c' and are ~25 characters of lowercase alphanumeric.
 */
export function isCuid(value: string): boolean {
  return /^c[a-z0-9]{20,30}$/.test(value);
}
