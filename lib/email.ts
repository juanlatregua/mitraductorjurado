import { sendMail, isAzureMailConfigured } from "@/lib/azure-mail";

const APP_NAME = "Mi Traductor Jurado";
const BASE_URL = process.env.NEXTAUTH_URL || "https://mitraductorjurado.es";

export { isAzureMailConfigured as isEmailConfigured };

function wrapHtml(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<div style="max-width:560px;margin:32px auto;background:#fff;border-radius:12px;border:1px solid #e2e8f0;overflow:hidden">
  <div style="background:#1e293b;padding:20px 24px">
    <h1 style="margin:0;color:#fff;font-size:18px">${APP_NAME}</h1>
  </div>
  <div style="padding:24px">
    <h2 style="margin:0 0 16px;color:#1e293b;font-size:16px">${title}</h2>
    ${body}
  </div>
  <div style="padding:16px 24px;border-top:1px solid #e2e8f0;text-align:center">
    <p style="margin:0;font-size:12px;color:#94a3b8">${APP_NAME} · mitraductorjurado.es</p>
  </div>
</div>
</body>
</html>`;
}

function btn(text: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:14px;margin:8px 0">${text}</a>`;
}

async function send(to: string, subject: string, html: string) {
  try {
    await sendMail({ to, subject, html });
  } catch (err) {
    console.error("[Email] Error enviando:", err);
  }
}

// ─── Notificaciones del negocio ──────────────────────────────────────────────

export async function sendNewOrderNotification(
  translatorEmail: string,
  translatorName: string,
  orderId: string,
  clientName: string
) {
  const url = `${BASE_URL}/dashboard/translator/orders/${orderId}`;
  await send(
    translatorEmail,
    `Nuevo pedido de ${clientName}`,
    wrapHtml(
      "Nuevo pedido recibido",
      `<p style="color:#475569;font-size:14px">Hola ${translatorName},</p>
       <p style="color:#475569;font-size:14px"><strong>${clientName}</strong> te ha enviado un nuevo pedido de traducción jurada.</p>
       <p style="color:#475569;font-size:14px">Revisa los detalles y envía tu presupuesto.</p>
       ${btn("Ver pedido", url)}`
    )
  );
}

export async function sendQuoteNotification(
  clientEmail: string,
  clientName: string,
  orderId: string,
  translatorName: string,
  price: number
) {
  const url = `${BASE_URL}/dashboard/client/orders/${orderId}`;
  await send(
    clientEmail,
    `Presupuesto recibido de ${translatorName}`,
    wrapHtml(
      "Presupuesto recibido",
      `<p style="color:#475569;font-size:14px">Hola ${clientName},</p>
       <p style="color:#475569;font-size:14px"><strong>${translatorName}</strong> ha enviado un presupuesto de <strong>${price.toFixed(2)} €</strong> para tu traducción jurada.</p>
       <p style="color:#475569;font-size:14px">Puedes aceptarlo o rechazarlo desde tu panel.</p>
       ${btn("Ver presupuesto", url)}`
    )
  );
}

export async function sendOrderAcceptedNotification(
  translatorEmail: string,
  translatorName: string,
  orderId: string,
  clientName: string
) {
  const url = `${BASE_URL}/dashboard/translator/orders/${orderId}`;
  await send(
    translatorEmail,
    `Presupuesto aceptado por ${clientName}`,
    wrapHtml(
      "Presupuesto aceptado",
      `<p style="color:#475569;font-size:14px">Hola ${translatorName},</p>
       <p style="color:#475569;font-size:14px"><strong>${clientName}</strong> ha aceptado tu presupuesto. Ya puedes comenzar a trabajar en la traducción.</p>
       ${btn("Ver pedido", url)}`
    )
  );
}

export async function sendPaymentConfirmation(
  clientEmail: string,
  clientName: string,
  orderId: string,
  amount: number
) {
  const url = `${BASE_URL}/dashboard/client/orders/${orderId}`;
  await send(
    clientEmail,
    `Pago confirmado — ${amount.toFixed(2)} €`,
    wrapHtml(
      "Pago confirmado",
      `<p style="color:#475569;font-size:14px">Hola ${clientName},</p>
       <p style="color:#475569;font-size:14px">Hemos recibido tu pago de <strong>${amount.toFixed(2)} €</strong>. El traductor comenzará a trabajar en tu pedido.</p>
       ${btn("Ver pedido", url)}`
    )
  );
}

export async function sendDeliveryNotification(
  clientEmail: string,
  clientName: string,
  orderId: string,
  translatorName: string
) {
  const url = `${BASE_URL}/dashboard/client/orders/${orderId}`;
  await send(
    clientEmail,
    `Traducción entregada por ${translatorName}`,
    wrapHtml(
      "Traducción entregada",
      `<p style="color:#475569;font-size:14px">Hola ${clientName},</p>
       <p style="color:#475569;font-size:14px"><strong>${translatorName}</strong> ha entregado tu traducción jurada. Revisa el resultado y confirma la recepción.</p>
       ${btn("Ver traducción", url)}`
    )
  );
}

export async function sendOrderClosedNotification(
  clientEmail: string,
  clientName: string,
  orderId: string,
  translatorName: string
) {
  const url = `${BASE_URL}/dashboard/client/orders/${orderId}`;
  await send(
    clientEmail,
    `Pedido completado — ${translatorName}`,
    wrapHtml(
      "Pedido completado",
      `<p style="color:#475569;font-size:14px">Hola ${clientName},</p>
       <p style="color:#475569;font-size:14px">Tu pedido de traducción jurada con <strong>${translatorName}</strong> ha sido cerrado correctamente.</p>
       <p style="color:#475569;font-size:14px">Puedes descargar la traducción firmada desde tu panel.</p>
       ${btn("Ver pedido", url)}`
    )
  );
}

export async function sendColleagueAssignmentNotification(
  colleagueEmail: string,
  colleagueName: string,
  orderId: string,
  principalName: string,
  sourceLang: string,
  targetLang: string,
  agreedPrice: number
) {
  const url = `${BASE_URL}/dashboard/translator/orders/${orderId}`;
  await send(
    colleagueEmail,
    `${principalName} te ha asignado un pedido`,
    wrapHtml(
      "Nuevo pedido asignado",
      `<p style="color:#475569;font-size:14px">Hola ${colleagueName},</p>
       <p style="color:#475569;font-size:14px"><strong>${principalName}</strong> te ha asignado un pedido de traducción jurada (${sourceLang.toUpperCase()} → ${targetLang.toUpperCase()}) por <strong>${agreedPrice.toFixed(2)} €</strong>.</p>
       <p style="color:#475569;font-size:14px">Revisa los detalles y acepta el encargo.</p>
       ${btn("Ver pedido", url)}`
    )
  );
}

// ─── Secuencia de bienvenida (welcome emails) ──────────────────────────────

export async function sendWelcomeDay0(
  email: string,
  name: string,
  role: "translator" | "client"
) {
  if (role === "translator") {
    const url = `${BASE_URL}/dashboard/translator`;
    await send(
      email,
      "Bienvenido a mitraductorjurado.es",
      wrapHtml(
        "Bienvenido, " + name,
        `<p style="color:#475569;font-size:14px">Tu cuenta de traductor jurado ya está activa. Aquí tienes los primeros pasos:</p>
         <ol style="color:#475569;font-size:14px;line-height:1.8;padding-left:20px">
           <li><strong>Completa tu perfil</strong> — Añade tu foto, biografía y tarifas para aparecer en el directorio.</li>
           <li><strong>Configura Stripe Connect</strong> — Conecta tu cuenta bancaria para recibir pagos de clientes.</li>
           <li><strong>Suscríbete al Plan Fundador</strong> — 49€/mes con acceso completo. Precio de lanzamiento para siempre.</li>
         </ol>
         ${btn("Ir a mi panel", url)}
         <p style="color:#94a3b8;font-size:12px;margin-top:16px">¿Dudas? Responde a este email y te ayudamos.</p>`
      )
    );
  } else {
    const url = `${BASE_URL}/dashboard/client`;
    await send(
      email,
      "Bienvenido a mitraductorjurado.es",
      wrapHtml(
        "Bienvenido, " + name,
        `<p style="color:#475569;font-size:14px">Tu cuenta de cliente ya está lista. Puedes buscar un traductor jurado y solicitar un presupuesto directamente.</p>
         ${btn("Buscar traductor jurado", BASE_URL + "/translators")}
         <p style="color:#94a3b8;font-size:12px;margin-top:16px">¿Dudas? Responde a este email y te ayudamos.</p>`
      )
    );
  }
}

export async function sendWelcomeDay3(email: string, name: string) {
  const editorUrl = `${BASE_URL}/dashboard/translator`;
  await send(
    email,
    "¿Has probado el editor bilingüe?",
    wrapHtml(
      "Tu editor bilingüe te espera",
      `<p style="color:#475569;font-size:14px">Hola ${name},</p>
       <p style="color:#475569;font-size:14px">El editor bilingüe de mitraductorjurado.es te permite:</p>
       <ul style="color:#475569;font-size:14px;line-height:1.8;padding-left:20px">
         <li>Traducir con el PDF original al lado</li>
         <li>Sugerir traducciones automáticas con DeepL</li>
         <li>Generar el documento final con fórmula de certificación</li>
         <li>Firmar digitalmente con eIDAS</li>
       </ul>
       <p style="color:#475569;font-size:14px">Sustituye Adobe + DeepL + Word. Todo en una sola herramienta.</p>
       ${btn("Probar el editor", editorUrl)}`
    )
  );
}

export async function sendWelcomeDay7(email: string, name: string) {
  const subscribeUrl = `${BASE_URL}/dashboard/translator/payments`;
  await send(
    email,
    "Oferta especial: Plan Fundador 49€/mes para siempre",
    wrapHtml(
      "No pierdas tu plaza de fundador",
      `<p style="color:#475569;font-size:14px">Hola ${name},</p>
       <p style="color:#475569;font-size:14px">Llevas una semana registrado pero aún no te has suscrito al Plan Fundador.</p>
       <p style="color:#475569;font-size:14px"><strong>El precio de 49€/mes es exclusivo para los primeros suscriptores y se mantiene para siempre</strong>, aunque el precio suba en el futuro.</p>
       <p style="color:#475569;font-size:14px">Incluye: editor bilingüe, DeepL, firma eIDAS, facturación Verifactu, cobros Stripe, red de colegas y widget para tu web.</p>
       ${btn("Suscribirme ahora — 49€/mes", subscribeUrl)}
       <p style="color:#94a3b8;font-size:12px;margin-top:16px">Las plazas de fundador son limitadas.</p>`
    )
  );
}

export async function sendAbandonedSignupEmail(email: string, name: string) {
  const onboardingUrl = `${BASE_URL}/auth/onboarding?role=translator`;
  await send(
    email,
    "Tu registro en MiTraductorJurado está incompleto",
    wrapHtml(
      "Completa tu registro, " + name,
      `<p style="color:#475569;font-size:14px">Hola ${name},</p>
       <p style="color:#475569;font-size:14px">Vemos que empezaste a registrarte en mitraductorjurado.es pero no completaste tu perfil de traductor jurado.</p>
       <p style="color:#475569;font-size:14px">Solo necesitas unos minutos para terminar el proceso y acceder a todas las herramientas:</p>
       <ul style="color:#475569;font-size:14px;line-height:1.8;padding-left:20px">
         <li><strong>Editor bilingüe</strong> con DeepL integrado</li>
         <li><strong>Firma digital eIDAS</strong> cualificada</li>
         <li><strong>Facturación Verifactu</strong> automática</li>
         <li><strong>Cobros Stripe</strong> directos de tus clientes</li>
         <li><strong>Directorio público</strong> para captar nuevos encargos</li>
       </ul>
       <p style="color:#475569;font-size:14px">Retoma tu registro desde donde lo dejaste:</p>
       ${btn("Completar mi registro", onboardingUrl)}
       <p style="color:#94a3b8;font-size:12px;margin-top:16px">Si tienes cualquier duda, responde a este email y te ayudamos.</p>`
    )
  );
}

export async function sendWidgetLeadNotification(
  translatorEmail: string,
  translatorName: string,
  leadName: string,
  leadEmail: string,
  sourceDomain: string
) {
  const url = `${BASE_URL}/dashboard/translator/widget`;
  await send(
    translatorEmail,
    `Nueva solicitud desde ${sourceDomain}`,
    wrapHtml(
      "Nueva solicitud del widget",
      `<p style="color:#475569;font-size:14px">Hola ${translatorName},</p>
       <p style="color:#475569;font-size:14px"><strong>${leadName}</strong> (${leadEmail}) ha enviado una solicitud de traducción desde <strong>${sourceDomain}</strong>.</p>
       ${btn("Ver solicitudes", url)}`
    )
  );
}
