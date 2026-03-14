import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidad",
};

export default function Privacidad() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px" }}>
      <h1 className="font-playfair" style={{ fontSize: 28, color: "#1A3A2A", marginBottom: 24 }}>Política de privacidad</h1>

      <section className="font-sans" style={{ fontSize: 14, lineHeight: 1.8, color: "#444" }}>
        <h2 style={{ fontSize: 18, color: "#1A3A2A", marginTop: 32, marginBottom: 8 }}>1. Responsable del tratamiento</h2>
        <p><strong>HBTJ Consultores Lingüísticos S.L.</strong> (CIF: B-72578907) es el responsable del tratamiento de los datos personales recogidos a través de mitraductorjurado.es.</p>
        <p>Contacto DPD: info@mitraductorjurado.es</p>

        <h2 style={{ fontSize: 18, color: "#1A3A2A", marginTop: 32, marginBottom: 8 }}>2. Datos que recogemos</h2>
        <ul style={{ paddingLeft: 20 }}>
          <li><strong>Traductores:</strong> nombre, email, número MAEC, provincia, idiomas, especialidades, datos bancarios (procesados por Stripe), foto de perfil.</li>
          <li><strong>Clientes:</strong> nombre, email, empresa (opcional).</li>
          <li><strong>Widget leads:</strong> nombre, email, teléfono (opcional), tipo de documento, mensaje.</li>
          <li><strong>Datos de navegación:</strong> analíticas anónimas mediante Plausible Analytics (sin cookies, conforme RGPD).</li>
        </ul>

        <h2 style={{ fontSize: 18, color: "#1A3A2A", marginTop: 32, marginBottom: 8 }}>3. Finalidad del tratamiento</h2>
        <ul style={{ paddingLeft: 20 }}>
          <li>Gestión de cuentas de usuario y autenticación</li>
          <li>Intermediación entre traductores jurados y clientes</li>
          <li>Procesamiento de pagos (Stripe Connect y Stripe Billing)</li>
          <li>Emisión de facturas (Verifactu AEAT)</li>
          <li>Firma electrónica cualificada (eIDAS, Signaturit)</li>
          <li>Envío de notificaciones transaccionales por email</li>
          <li>Mejora del servicio y análisis de uso</li>
        </ul>

        <h2 style={{ fontSize: 18, color: "#1A3A2A", marginTop: 32, marginBottom: 8 }}>4. Base jurídica</h2>
        <ul style={{ paddingLeft: 20 }}>
          <li><strong>Ejecución contractual</strong> (art. 6.1.b RGPD): para la prestación del servicio</li>
          <li><strong>Obligación legal</strong> (art. 6.1.c RGPD): facturación, cumplimiento tributario</li>
          <li><strong>Interés legítimo</strong> (art. 6.1.f RGPD): mejora del servicio, prevención de fraude</li>
        </ul>

        <h2 style={{ fontSize: 18, color: "#1A3A2A", marginTop: 32, marginBottom: 8 }}>5. Destinatarios de los datos</h2>
        <ul style={{ paddingLeft: 20 }}>
          <li><strong>Stripe, Inc.</strong> — procesamiento de pagos (EE.UU., con cláusulas contractuales tipo)</li>
          <li><strong>Signaturit Solutions S.L.</strong> — firma electrónica (España)</li>
          <li><strong>Vercel, Inc.</strong> — alojamiento web (EE.UU., con cláusulas contractuales tipo)</li>
          <li><strong>Neon, Inc.</strong> — base de datos (EE.UU., con cláusulas contractuales tipo)</li>
          <li><strong>Microsoft Corporation</strong> — envío de emails transaccionales (Azure Graph API)</li>
          <li><strong>DeepL SE</strong> — traducción automática asistida (Alemania)</li>
        </ul>

        <h2 style={{ fontSize: 18, color: "#1A3A2A", marginTop: 32, marginBottom: 8 }}>6. Conservación de datos</h2>
        <p>Los datos se conservarán mientras exista la relación contractual y, una vez finalizada, durante el plazo legalmente establecido para atender responsabilidades (mínimo 5 años para datos fiscales).</p>

        <h2 style={{ fontSize: 18, color: "#1A3A2A", marginTop: 32, marginBottom: 8 }}>7. Derechos del interesado</h2>
        <p>Puedes ejercer tus derechos de acceso, rectificación, supresión, limitación, portabilidad y oposición enviando un email a <strong>info@mitraductorjurado.es</strong> con copia de tu DNI.</p>
        <p>Tienes derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (www.aepd.es).</p>

        <h2 style={{ fontSize: 18, color: "#1A3A2A", marginTop: 32, marginBottom: 8 }}>8. Cookies</h2>
        <p>mitraductorjurado.es utiliza únicamente cookies técnicas necesarias para la autenticación (NextAuth session token). No utilizamos cookies de seguimiento ni publicidad. Plausible Analytics funciona sin cookies.</p>

        <p style={{ marginTop: 32, color: "#888", fontSize: 12 }}>Última actualización: marzo de 2026</p>
      </section>
    </main>
  );
}
