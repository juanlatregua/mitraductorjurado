// Azure Mail — Send emails via Microsoft Graph API (OAuth2 client_credentials)
// Same pattern as HolaBonjour. Requires Azure AD app with Mail.Send permission.

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 60_000) {
    return cachedToken.token;
  }

  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Missing AZURE_TENANT_ID, AZURE_CLIENT_ID, or AZURE_CLIENT_SECRET");
  }

  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Azure token error ${res.status}: ${text}`);
  }

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
  return cachedToken.token;
}

export interface MailAttachment {
  name: string;
  contentType: string;
  contentBytes: string; // base64
}

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  attachments?: MailAttachment[];
}

export function isAzureMailConfigured(): boolean {
  return !!(
    process.env.AZURE_TENANT_ID &&
    process.env.AZURE_CLIENT_ID &&
    process.env.AZURE_CLIENT_SECRET
  );
}

export async function sendMail({ to, subject, html, attachments }: SendMailOptions) {
  const from = process.env.EMAIL_FROM || "noreply@mitraductorjurado.es";

  if (!isAzureMailConfigured()) {
    console.log(`[AzureMail] Not configured. Subject: ${subject} → ${to}`);
    return;
  }

  const token = await getAccessToken();

  const message: Record<string, unknown> = {
    message: {
      subject,
      body: {
        contentType: "HTML",
        content: html,
      },
      toRecipients: [{ emailAddress: { address: to } }],
      ...(attachments?.length && {
        attachments: attachments.map((a) => ({
          "@odata.type": "#microsoft.graph.fileAttachment",
          name: a.name,
          contentType: a.contentType,
          contentBytes: a.contentBytes,
        })),
      }),
    },
    saveToSentItems: false,
  };

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(from)}/sendMail`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    },
  );

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Graph sendMail error ${res.status}: ${errorBody}`);
  }
}
