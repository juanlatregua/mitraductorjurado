import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso legal",
};

export default function AvisoLegal() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "60px 24px" }}>
      <h1 className="font-playfair" style={{ fontSize: 28, color: "#1A3A2A", marginBottom: 24 }}>Aviso legal</h1>

      <section className="font-sans" style={{ fontSize: 14, lineHeight: 1.8, color: "#444" }}>
        <h2 style={{ fontSize: 18, color: "#1A3A2A", marginTop: 32, marginBottom: 8 }}>1. Datos identificativos</h2>
        <p>En cumplimiento del artículo 10 de la Ley 34/2002 de Servicios de la Sociedad de la Información y Comercio Electrónico (LSSI-CE), se informa:</p>
        <ul style={{ paddingLeft: 20 }}>
          <li><strong>Titular:</strong> HBTJ Consultores Lingüísticos S.L.</li>
          <li><strong>CIF:</strong> B-72578907</li>
          <li><strong>Domicilio social:</strong> Málaga, España</li>
          <li><strong>Email:</strong> info@mitraductorjurado.es</li>
          <li><strong>Sitio web:</strong> https://mitraductorjurado.es</li>
          <li><strong>Registro Mercantil:</strong> Inscrita en el Registro Mercantil de Málaga</li>
        </ul>

        <h2 style={{ fontSize: 18, color: "#1A3A2A", marginTop: 32, marginBottom: 8 }}>2. Objeto</h2>
        <p>mitraductorjurado.es es una plataforma digital que conecta a traductores-intérpretes jurados nombrados por el MAEC con clientes que necesitan traducciones juradas oficiales. La plataforma proporciona herramientas profesionales de traducción, facturación y gestión de pedidos.</p>

        <h2 style={{ fontSize: 18, color: "#1A3A2A", marginTop: 32, marginBottom: 8 }}>3. Propiedad intelectual</h2>
        <p>Todos los contenidos del sitio web (textos, imágenes, logotipos, código fuente, diseño gráfico) son propiedad de HBTJ Consultores Lingüísticos S.L. o de sus respectivos titulares. Queda prohibida su reproducción total o parcial sin autorización expresa.</p>

        <h2 style={{ fontSize: 18, color: "#1A3A2A", marginTop: 32, marginBottom: 8 }}>4. Responsabilidad</h2>
        <p>HBTJ Consultores Lingüísticos S.L. actúa como intermediario tecnológico entre traductores jurados y clientes. La responsabilidad sobre la calidad de las traducciones recae en el traductor jurado titular del encargo. La plataforma no se hace responsable de errores u omisiones en las traducciones realizadas por los traductores registrados.</p>

        <h2 style={{ fontSize: 18, color: "#1A3A2A", marginTop: 32, marginBottom: 8 }}>5. Legislación aplicable</h2>
        <p>Las presentes condiciones se rigen por la legislación española. Para la resolución de conflictos serán competentes los Juzgados y Tribunales de Málaga.</p>

        <p style={{ marginTop: 32, color: "#888", fontSize: 12 }}>Última actualización: marzo de 2026</p>
      </section>
    </main>
  );
}
