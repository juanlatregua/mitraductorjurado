import { prisma } from "@/lib/prisma";

// Genera número de factura secuencial: MTJ-YYYYMM-XXXX
export async function generateInvoiceNumber(): Promise<string> {
  const now = new Date();
  const prefix = `MTJ-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;

  // Buscar la última factura de este mes
  const lastInvoice = await prisma.invoice.findFirst({
    where: { invoiceNumber: { startsWith: prefix } },
    orderBy: { invoiceNumber: "desc" },
    select: { invoiceNumber: true },
  });

  let sequence = 1;
  if (lastInvoice) {
    const lastSeq = parseInt(lastInvoice.invoiceNumber.split("-")[2], 10);
    sequence = lastSeq + 1;
  }

  return `${prefix}-${String(sequence).padStart(4, "0")}`;
}
