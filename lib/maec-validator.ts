import { prisma } from "@/lib/prisma";

export interface MAECValidationResult {
  valid: boolean;
  nombre?: string;
  idiomas?: string[];
  provincia?: string;
}

/**
 * Valida un número TIJ contra el registro interno MAECRegistry.
 * Acepta formatos: "3850", "N.3850" — extrae solo los dígitos.
 */
export async function validateMAEC(tij: string): Promise<MAECValidationResult> {
  // Extraer solo dígitos del número MAEC (N.3850 → 3850)
  const cleaned = tij.replace(/\D/g, "");

  if (!cleaned) {
    return { valid: false };
  }

  const entry = await prisma.mAECRegistry.findUnique({
    where: { tij: cleaned },
  });

  if (!entry || !entry.activo) {
    return { valid: false };
  }

  return {
    valid: true,
    nombre: entry.nombre,
    idiomas: entry.idiomas,
    provincia: entry.provincia,
  };
}
