import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Condiciones de uso",
};

export default function Condiciones() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px" }}>
      <h1 className="font-playfair" style={{ fontSize: 28, color: "#1A3A2A", marginBottom: 24 }}>Condiciones de uso</h1>

      <section className="font-sans" style={{ fontSize: 14, lineHeight: 1.8, color: "#444" }}>
        <h2 style={{ fontSize: 18, color: "#1A3A2A", marginTop: 32, marginBottom: 8 }}>1. Descripción del servicio</h2>
        <p>mitraductorjurado.es es una plataforma SaaS que proporciona a los traductores-intérpretes jurados nombrados por el Ministerio de Asuntos Exteriores de España (MAEC) herramientas profesionales integradas: editor bilingüe, firma electrónica eIDAS, facturación Verifactu, cobros con Stripe y directorio público.</p>

        <h2 style={{ fontSize: 18, color: "#1A3A2A", marginTop: 32, marginBottom: 8 }}>2. Registro y acceso</h2>
        <p>Para acceder a la plataforma es necesario crear una cuenta proporcionando un email válido. Los traductores deben acreditar su número MAEC, que se verifica contra el registro oficial.</p>
        <p>El usuario es responsable de mantener la confidencialidad de sus credenciales de acceso.</p>

        <h2 style={{ fontSize: 18, color: "#1A3A2A", marginTop: 32, marginBottom: 8 }}>3. Plan Fundador (suscripción)</h2>
        <p>El acceso completo a las herramientas profesionales requiere una suscripción activa. El Plan Fundador tiene un coste de <strong>49€/mes</strong> (más IVA aplicable). Este precio se mantiene de forma indefinida para los suscriptores que contraten durante el período de lanzamiento.</p>
        <p>La suscripción se renueva automáticamente cada mes. Puedes cancelar en cualquier momento desde tu panel; seguirás teniendo acceso hasta el final del período facturado.</p>

        <h2 style={{ fontSize: 18, color: "#1A3A2A", marginTop: 32, marginBottom: 8 }}>4. Pagos y facturación</h2>
        <p>Los pagos se procesan de forma segura a través de Stripe. Las facturas se emiten conforme al sistema Verifactu de la AEAT.</p>
        <p>Los precios de las traducciones se acuerdan directamente entre el traductor jurado y el cliente. mitraductorjurado.es aplica una comisión de plataforma sobre cada transacción.</p>

        <h2 style={{ fontSize: 18, color: "#1A3A2A", marginTop: 32, marginBottom: 8 }}>5. Obligaciones del traductor</h2>
        <ul style={{ paddingLeft: 20 }}>
          <li>Estar nombrado como Traductor-Intérprete Jurado por el MAEC</li>
          <li>Realizar las traducciones con la diligencia profesional exigible</li>
          <li>Cumplir los plazos acordados con los clientes</li>
          <li>No utilizar la plataforma para actividades ilícitas</li>
        </ul>

        <h2 style={{ fontSize: 18, color: "#1A3A2A", marginTop: 32, marginBottom: 8 }}>6. Obligaciones del cliente</h2>
        <ul style={{ paddingLeft: 20 }}>
          <li>Proporcionar documentación legible y completa</li>
          <li>Realizar los pagos en los plazos acordados</li>
          <li>No utilizar las traducciones para fines fraudulentos</li>
        </ul>

        <h2 style={{ fontSize: 18, color: "#1A3A2A", marginTop: 32, marginBottom: 8 }}>7. Propiedad de las traducciones</h2>
        <p>Las traducciones juradas son propiedad del cliente una vez completado el pago. El traductor conserva los derechos morales sobre su trabajo conforme a la Ley de Propiedad Intelectual.</p>

        <h2 style={{ fontSize: 18, color: "#1A3A2A", marginTop: 32, marginBottom: 8 }}>8. Limitación de responsabilidad</h2>
        <p>mitraductorjurado.es actúa como plataforma tecnológica intermediaria. No garantiza la disponibilidad de traductores ni la aceptación de presupuestos. La responsabilidad de la plataforma se limita al importe de la suscripción del último mes facturado.</p>

        <h2 style={{ fontSize: 18, color: "#1A3A2A", marginTop: 32, marginBottom: 8 }}>9. Resolución y baja</h2>
        <p>Cualquiera de las partes puede resolver la relación en cualquier momento. HBTJ Consultores Lingüísticos S.L. se reserva el derecho de suspender cuentas que incumplan estas condiciones, previo aviso.</p>

        <h2 style={{ fontSize: 18, color: "#1A3A2A", marginTop: 32, marginBottom: 8 }}>10. Jurisdicción</h2>
        <p>Estas condiciones se rigen por la legislación española. Para la resolución de controversias serán competentes los Juzgados y Tribunales de Málaga.</p>

        <p style={{ marginTop: 32, color: "#888", fontSize: 12 }}>Última actualización: marzo de 2026</p>
      </section>
    </main>
  );
}
