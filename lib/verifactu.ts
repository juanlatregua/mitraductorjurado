// Verifactu — Facturación electrónica AEAT
// Sistema obligatorio en España a partir de 2027
// Docs: https://www.agenciatributaria.es/AEAT.internet/Inicio/La_Agencia_Tributaria/Campanas/Verifactu.shtml

const VERIFACTU_BASE =
  process.env.VERIFACTU_SANDBOX === "true"
    ? "https://prewww2.aeat.es/wlpl/TIKE-CONT/ws/SistemaFacturacion"
    : "https://www2.agenciatributaria.gob.es/wlpl/TIKE-CONT/ws/SistemaFacturacion";

export function isVerifactuConfigured(): boolean {
  return !!process.env.VERIFACTU_NIF;
}

export interface InvoiceData {
  invoiceNumber: string;
  issuerNif: string;
  issuerName: string;
  recipientName: string;
  recipientNif?: string;
  amount: number;       // base imponible
  vatRate: number;       // 21% por defecto
  vatAmount: number;
  totalAmount: number;
  concept: string;
  issueDate: Date;
}

// Generar XML Verifactu para una factura
export function generateVerifactuXML(data: InvoiceData): string {
  const issueDate = data.issueDate.toISOString().split("T")[0];

  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:sist="https://www2.agenciatributaria.gob.es/static_files/common/internet/dep/aplicaciones/es/aeat/tike/cont/ws/SistemaFacturacion.xsd">
  <soapenv:Body>
    <sist:RegFactuSistemaFacturacion>
      <sist:Cabecera>
        <sist:ObligadoEmision>
          <sist:NombreRazon>${escapeXml(data.issuerName)}</sist:NombreRazon>
          <sist:NIF>${escapeXml(data.issuerNif)}</sist:NIF>
        </sist:ObligadoEmision>
      </sist:Cabecera>
      <sist:RegistroFactura>
        <sist:RegistroAlta>
          <sist:IDFactura>
            <sist:IDEmisorFactura>${escapeXml(data.issuerNif)}</sist:IDEmisorFactura>
            <sist:NumSerieFactura>${escapeXml(data.invoiceNumber)}</sist:NumSerieFactura>
            <sist:FechaExpedicionFactura>${issueDate}</sist:FechaExpedicionFactura>
          </sist:IDFactura>
          <sist:TipoFactura>F1</sist:TipoFactura>
          <sist:DescripcionOperacion>${escapeXml(data.concept)}</sist:DescripcionOperacion>
          <sist:Destinatarios>
            <sist:IDDestinatario>
              <sist:NombreRazon>${escapeXml(data.recipientName)}</sist:NombreRazon>
              ${data.recipientNif ? `<sist:NIF>${escapeXml(data.recipientNif)}</sist:NIF>` : ""}
            </sist:IDDestinatario>
          </sist:Destinatarios>
          <sist:Desglose>
            <sist:DetalleDesglose>
              <sist:ClaveRegimen>01</sist:ClaveRegimen>
              <sist:CalificacionOperacion>S1</sist:CalificacionOperacion>
              <sist:TipoImpositivo>${data.vatRate.toFixed(2)}</sist:TipoImpositivo>
              <sist:BaseImponible>${data.amount.toFixed(2)}</sist:BaseImponible>
              <sist:CuotaRepercutida>${data.vatAmount.toFixed(2)}</sist:CuotaRepercutida>
            </sist:DetalleDesglose>
          </sist:Desglose>
          <sist:CuotaTotal>${data.vatAmount.toFixed(2)}</sist:CuotaTotal>
          <sist:ImporteTotal>${data.totalAmount.toFixed(2)}</sist:ImporteTotal>
        </sist:RegistroAlta>
      </sist:RegistroFactura>
    </sist:RegFactuSistemaFacturacion>
  </soapenv:Body>
</soapenv:Envelope>`;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Enviar factura a AEAT (TODO: requiere certificado digital)
export async function submitToAEAT(
  xml: string
): Promise<{ ok: boolean; response?: string; error?: string }> {
  if (!isVerifactuConfigured()) {
    return { ok: false, error: "Verifactu no configurado (VERIFACTU_NIF requerido)" };
  }

  // TODO: El envío real a AEAT requiere certificado digital (.p12)
  // y autenticación con firma electrónica del emisor.
  // En sandbox, simular respuesta exitosa.
  if (process.env.VERIFACTU_SANDBOX === "true") {
    return {
      ok: true,
      response: "SANDBOX: Factura registrada correctamente (simulación)",
    };
  }

  // Producción: enviar via SOAP con certificado
  // TODO: Implementar cuando se tenga el certificado digital
  return { ok: false, error: "Envío a producción AEAT no implementado. Requiere certificado digital." };
}

// Calcular IVA para traducciones juradas (exentas según art. 20.1.26 LIVA si intracomunitario)
export function calculateVAT(
  baseAmount: number,
  isExempt: boolean = false
): { vatRate: number; vatAmount: number; totalAmount: number } {
  if (isExempt) {
    return { vatRate: 0, vatAmount: 0, totalAmount: baseAmount };
  }
  const vatRate = 21;
  const vatAmount = baseAmount * (vatRate / 100);
  return { vatRate, vatAmount, totalAmount: baseAmount + vatAmount };
}
