// Signaturit API client para firma electrónica eIDAS
// Docs: https://docs.signaturit.com/api/v3

const SIGNATURIT_BASE =
  process.env.SIGNATURIT_SANDBOX === "true"
    ? "https://api.sandbox.signaturit.com/v3"
    : "https://api.signaturit.com/v3";

function getHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${process.env.SIGNATURIT_API_KEY}`,
    "Content-Type": "application/json",
  };
}

export function isSignaturitConfigured(): boolean {
  return !!process.env.SIGNATURIT_API_KEY;
}

export interface SignatureRequest {
  signerId: string;
  signerEmail: string;
  signerName: string;
  documentUrl: string;
  orderId: string;
}

export interface SignaturitResponse {
  id: string;
  status: string;
  documents?: Array<{
    id: string;
    file?: { name: string; pages: number };
    signed_file_url?: string;
  }>;
}

// Crear una solicitud de firma
export async function createSignatureRequest(
  req: SignatureRequest
): Promise<SignaturitResponse | null> {
  if (!isSignaturitConfigured()) return null;

  try {
    // Descargar el documento para enviarlo a Signaturit
    const docResponse = await fetch(req.documentUrl);
    const docBuffer = await docResponse.arrayBuffer();
    const docBlob = new Blob([docBuffer], { type: "application/pdf" });

    // Signaturit usa multipart/form-data para crear firmas
    const formData = new FormData();
    formData.append(
      "recipients[0][name]",
      req.signerName
    );
    formData.append(
      "recipients[0][email]",
      req.signerEmail
    );
    formData.append(
      "subject",
      `Firma traducción jurada — Pedido ${req.orderId.slice(0, 8)}`
    );
    formData.append(
      "body",
      "Por favor, firme el documento de traducción jurada adjunto."
    );
    formData.append("files[0]", docBlob, "traduccion.pdf");

    const response = await fetch(`${SIGNATURIT_BASE}/signatures.json`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SIGNATURIT_API_KEY}`,
      },
      body: formData,
    });

    if (!response.ok) {
      console.error("Signaturit error:", response.status, await response.text());
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Signaturit request error:", error);
    return null;
  }
}

// Consultar estado de una firma
export async function getSignatureStatus(
  signaturitId: string
): Promise<SignaturitResponse | null> {
  if (!isSignaturitConfigured()) return null;

  try {
    const response = await fetch(
      `${SIGNATURIT_BASE}/signatures/${signaturitId}.json`,
      { headers: getHeaders() }
    );

    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Signaturit status error:", error);
    return null;
  }
}

// Descargar documento firmado
export async function getSignedDocumentUrl(
  signaturitId: string,
  documentId: string
): Promise<string | null> {
  if (!isSignaturitConfigured()) return null;

  try {
    const response = await fetch(
      `${SIGNATURIT_BASE}/signatures/${signaturitId}/documents/${documentId}/download/signed`,
      { headers: getHeaders() }
    );

    if (!response.ok) return null;

    // Signaturit devuelve el PDF directamente — lo guardamos en Blob
    const { put } = await import("@vercel/blob");
    const buffer = await response.arrayBuffer();
    const blob = await put(
      `documents/signed/${signaturitId}.pdf`,
      Buffer.from(buffer),
      { access: "public", contentType: "application/pdf" }
    );

    return blob.url;
  } catch (error) {
    console.error("Signaturit download error:", error);
    return null;
  }
}
