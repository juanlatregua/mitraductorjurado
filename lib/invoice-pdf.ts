import PDFDocument from "pdfkit";

export interface InvoicePdfData {
  invoiceNumber: string;
  issueDate: Date;
  // Emisor
  issuerName: string;
  issuerNif: string;
  issuerMaec?: string;
  // Destinatario
  recipientName: string;
  recipientEmail: string;
  // Importes
  concept: string;
  amount: number;
  vatRate: number;
  vatAmount: number;
  totalAmount: number;
  // Estado AEAT
  sentToAeat: boolean;
  aeatStatus?: string;
}

export function generateInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const pageWidth = doc.page.width - 100; // margins
    const issueDate = data.issueDate.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    // ─── Header ───────────────────────────────────────────────────────
    doc
      .rect(50, 50, pageWidth, 60)
      .fill("#1e293b");

    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .fillColor("#ffffff")
      .text("FACTURA", 70, 68);

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#94a3b8")
      .text("mitraductorjurado.es", 70, 92);

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor("#ffffff")
      .text(data.invoiceNumber, 350, 72, { width: 175, align: "right" });

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#94a3b8")
      .text(issueDate, 350, 92, { width: 175, align: "right" });

    // ─── Emisor y destinatario ────────────────────────────────────────
    const y1 = 140;

    // Emisor
    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("#64748b")
      .text("EMISOR", 50, y1);

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor("#1e293b")
      .text(data.issuerName, 50, y1 + 14);

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#475569")
      .text(`NIF: ${data.issuerNif}`, 50, y1 + 30);

    if (data.issuerMaec) {
      doc.text(`MAEC: ${data.issuerMaec}`, 50, y1 + 42);
    }

    // Destinatario
    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("#64748b")
      .text("CLIENTE", 320, y1);

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor("#1e293b")
      .text(data.recipientName, 320, y1 + 14);

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#475569")
      .text(data.recipientEmail, 320, y1 + 30);

    // ─── Línea separadora ─────────────────────────────────────────────
    const y2 = y1 + 70;
    doc
      .moveTo(50, y2)
      .lineTo(50 + pageWidth, y2)
      .strokeColor("#e2e8f0")
      .stroke();

    // ─── Tabla de conceptos ───────────────────────────────────────────
    const tableY = y2 + 20;

    // Header de tabla
    doc
      .rect(50, tableY, pageWidth, 28)
      .fill("#f8fafc");

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("#64748b")
      .text("CONCEPTO", 60, tableY + 9)
      .text("IMPORTE", 430, tableY + 9, { width: 85, align: "right" });

    // Fila de concepto
    const rowY = tableY + 36;
    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#1e293b")
      .text(data.concept, 60, rowY, { width: 360 });

    doc
      .font("Helvetica")
      .fontSize(10)
      .fillColor("#1e293b")
      .text(`${data.amount.toFixed(2)} €`, 430, rowY, { width: 85, align: "right" });

    // ─── Totales ──────────────────────────────────────────────────────
    const totalsY = rowY + 50;

    doc
      .moveTo(350, totalsY)
      .lineTo(50 + pageWidth, totalsY)
      .strokeColor("#e2e8f0")
      .stroke();

    // Base imponible
    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#64748b")
      .text("Base imponible", 350, totalsY + 12)
      .fillColor("#1e293b")
      .text(`${data.amount.toFixed(2)} €`, 430, totalsY + 12, { width: 85, align: "right" });

    // IVA
    doc
      .fillColor("#64748b")
      .text(`IVA (${data.vatRate}%)`, 350, totalsY + 28)
      .fillColor("#1e293b")
      .text(`${data.vatAmount.toFixed(2)} €`, 430, totalsY + 28, { width: 85, align: "right" });

    // Separador total
    doc
      .moveTo(350, totalsY + 46)
      .lineTo(50 + pageWidth, totalsY + 46)
      .strokeColor("#1e293b")
      .lineWidth(1.5)
      .stroke();

    // Total
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor("#1e293b")
      .text("TOTAL", 350, totalsY + 56)
      .text(`${data.totalAmount.toFixed(2)} €`, 430, totalsY + 56, { width: 85, align: "right" });

    // ─── Estado AEAT ──────────────────────────────────────────────────
    const aeatY = totalsY + 100;

    doc
      .moveTo(50, aeatY)
      .lineTo(50 + pageWidth, aeatY)
      .strokeColor("#e2e8f0")
      .lineWidth(0.5)
      .stroke();

    doc
      .font("Helvetica-Bold")
      .fontSize(8)
      .fillColor("#64748b")
      .text("REGISTRO VERIFACTU / AEAT", 50, aeatY + 12);

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor(data.sentToAeat ? "#16a34a" : "#d97706")
      .text(
        data.sentToAeat
          ? `Registrada en AEAT — ${data.aeatStatus || "Enviada"}`
          : "Pendiente de registro en AEAT",
        50,
        aeatY + 26
      );

    // ─── Pie de página ────────────────────────────────────────────────
    const footerY = doc.page.height - 80;

    doc
      .moveTo(50, footerY)
      .lineTo(50 + pageWidth, footerY)
      .strokeColor("#e2e8f0")
      .stroke();

    doc
      .font("Helvetica")
      .fontSize(7)
      .fillColor("#94a3b8")
      .text(
        "Factura generada por mitraductorjurado.es · HBTJ Consultores Lingüísticos S.L.",
        50,
        footerY + 10,
        { width: pageWidth, align: "center" }
      )
      .text(
        "Esta factura cumple con el sistema Verifactu de la AEAT (Real Decreto 1007/2023)",
        50,
        footerY + 22,
        { width: pageWidth, align: "center" }
      );

    doc.end();
  });
}
