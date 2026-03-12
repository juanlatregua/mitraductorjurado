// Plantillas de documentos frecuentes para traducción jurada
// Estructura: fixedFields (campos fijos del documento) + variables (datos a rellenar)

export const TEMPLATE_SEEDS = [
  // ─── ACADÉMICO ────────────────────────────────────────────────────────
  {
    category: "academico" as const,
    type: "titulo-universitario",
    language: "fr",
    label: "Título universitario (FR→ES)",
    structure: {
      fixedFields: [
        { key: "university", label: "Universidad", type: "text" },
        { key: "degree", label: "Titulación", type: "text" },
        { key: "issueDate", label: "Fecha de expedición", type: "date" },
        { key: "grade", label: "Calificación / Mención", type: "text" },
      ],
      variables: [
        { key: "fullName", label: "Nombre completo del titular", placeholder: "Jean Dupont" },
        { key: "birthDate", label: "Fecha de nacimiento", placeholder: "01/01/1990" },
        { key: "birthPlace", label: "Lugar de nacimiento", placeholder: "París, Francia" },
        { key: "nationalId", label: "N.º identificación", placeholder: "N.º INE o pasaporte" },
      ],
    },
    exampleAnon: "RÉPUBLIQUE FRANÇAISE\nMINISTÈRE DE L'ENSEIGNEMENT SUPÉRIEUR\n\nDIPLÔME DE [TITULACIÓN]\n\nNous, Président de l'Université de [UNIVERSIDAD],\ncertifions que [NOMBRE COMPLETO], né(e) le [FECHA NAC.]\nà [LUGAR NAC.], a obtenu le diplôme de [TITULACIÓN]\navec la mention [CALIFICACIÓN].\n\nFait à [CIUDAD], le [FECHA EXPEDICIÓN]",
  },
  {
    category: "academico" as const,
    type: "titulo-universitario",
    language: "en",
    label: "Título universitario (EN→ES)",
    structure: {
      fixedFields: [
        { key: "university", label: "University", type: "text" },
        { key: "degree", label: "Degree", type: "text" },
        { key: "issueDate", label: "Date of issue", type: "date" },
        { key: "honors", label: "Honors / Classification", type: "text" },
      ],
      variables: [
        { key: "fullName", label: "Full name", placeholder: "John Smith" },
        { key: "birthDate", label: "Date of birth", placeholder: "01/01/1990" },
        { key: "studentId", label: "Student ID", placeholder: "STU-123456" },
      ],
    },
  },
  {
    category: "academico" as const,
    type: "expediente-academico",
    language: "fr",
    label: "Expediente académico / Relevé de notes (FR→ES)",
    structure: {
      fixedFields: [
        { key: "university", label: "Universidad", type: "text" },
        { key: "program", label: "Programa / Formación", type: "text" },
        { key: "academicYear", label: "Año académico", type: "text" },
      ],
      variables: [
        { key: "fullName", label: "Nombre del estudiante", placeholder: "Marie Martin" },
        { key: "subjects", label: "Asignaturas (una por línea)", placeholder: "Droit civil - 14/20\nDroit pénal - 16/20" },
      ],
    },
  },

  // ─── NOTARIAL ─────────────────────────────────────────────────────────
  {
    category: "notarial" as const,
    type: "acta-nacimiento",
    language: "fr",
    label: "Acta de nacimiento (FR→ES)",
    structure: {
      fixedFields: [
        { key: "municipality", label: "Municipio / Mairie", type: "text" },
        { key: "registryNumber", label: "N.º de registro", type: "text" },
        { key: "issueDate", label: "Fecha de expedición", type: "date" },
      ],
      variables: [
        { key: "fullName", label: "Nombre completo", placeholder: "Pierre Durand" },
        { key: "birthDate", label: "Fecha de nacimiento", placeholder: "15/03/1985" },
        { key: "birthPlace", label: "Lugar de nacimiento", placeholder: "Lyon, Rhône" },
        { key: "fatherName", label: "Nombre del padre", placeholder: "Jacques Durand" },
        { key: "motherName", label: "Nombre de la madre", placeholder: "Marie Dupont" },
      ],
    },
    exampleAnon: "RÉPUBLIQUE FRANÇAISE\nEXTRAIT D'ACTE DE NAISSANCE\n\nLe [FECHA], à [HORA],\nest né(e) à [LUGAR NAC.], [NOMBRE COMPLETO],\nde [PADRE] et de [MADRE].\n\nDressé le [FECHA REGISTRO], sur la déclaration de [DECLARANTE].",
  },
  {
    category: "notarial" as const,
    type: "acta-matrimonio",
    language: "fr",
    label: "Acta de matrimonio (FR→ES)",
    structure: {
      fixedFields: [
        { key: "municipality", label: "Municipio / Mairie", type: "text" },
        { key: "marriageDate", label: "Fecha de matrimonio", type: "date" },
        { key: "registryNumber", label: "N.º de registro", type: "text" },
      ],
      variables: [
        { key: "spouse1", label: "Nombre cónyuge 1", placeholder: "Jean Dupont" },
        { key: "spouse2", label: "Nombre cónyuge 2", placeholder: "Marie Martin" },
        { key: "regime", label: "Régimen matrimonial", placeholder: "Comunidad de bienes" },
      ],
    },
  },
  {
    category: "notarial" as const,
    type: "poder-notarial",
    language: "fr",
    label: "Poder notarial / Procuration (FR→ES)",
    structure: {
      fixedFields: [
        { key: "notary", label: "Notario otorgante", type: "text" },
        { key: "date", label: "Fecha del acto", type: "date" },
        { key: "scope", label: "Alcance del poder", type: "select", options: ["General", "Especial", "Inmobiliario", "Bancario"] },
      ],
      variables: [
        { key: "grantor", label: "Poderdante", placeholder: "Nombre del otorgante" },
        { key: "grantee", label: "Apoderado", placeholder: "Nombre del apoderado" },
        { key: "purpose", label: "Finalidad", placeholder: "Venta de inmueble sito en..." },
      ],
    },
  },

  // ─── ADMINISTRATIVO ───────────────────────────────────────────────────
  {
    category: "administrativo" as const,
    type: "certificado-antecedentes",
    language: "fr",
    label: "Certificado de antecedentes penales (FR→ES)",
    structure: {
      fixedFields: [
        { key: "authority", label: "Autoridad emisora", type: "text" },
        { key: "issueDate", label: "Fecha de expedición", type: "date" },
        { key: "bulletinType", label: "Tipo de boletín", type: "select", options: ["Bulletin n°3", "Bulletin n°2", "Bulletin n°1"] },
      ],
      variables: [
        { key: "fullName", label: "Nombre completo", placeholder: "Nombre Apellido" },
        { key: "birthDate", label: "Fecha de nacimiento", placeholder: "01/01/1990" },
        { key: "birthPlace", label: "Lugar de nacimiento", placeholder: "Ciudad, País" },
        { key: "result", label: "Resultado", placeholder: "NÉANT (sin antecedentes)" },
      ],
    },
  },
  {
    category: "administrativo" as const,
    type: "certificado-residencia",
    language: "fr",
    label: "Certificado de residencia / Attestation de domicile (FR→ES)",
    structure: {
      fixedFields: [
        { key: "authority", label: "Autoridad / Entidad", type: "text" },
        { key: "issueDate", label: "Fecha de expedición", type: "date" },
      ],
      variables: [
        { key: "fullName", label: "Nombre completo", placeholder: "Nombre Apellido" },
        { key: "address", label: "Dirección", placeholder: "12 Rue de la Paix, 75002 Paris" },
        { key: "since", label: "Residente desde", placeholder: "01/01/2020" },
      ],
    },
  },

  // ─── JURÍDICO ─────────────────────────────────────────────────────────
  {
    category: "juridico" as const,
    type: "sentencia-divorcio",
    language: "fr",
    label: "Sentencia de divorcio (FR→ES)",
    structure: {
      fixedFields: [
        { key: "court", label: "Tribunal", type: "text" },
        { key: "caseNumber", label: "N.º de procedimiento", type: "text" },
        { key: "judgmentDate", label: "Fecha de la sentencia", type: "date" },
      ],
      variables: [
        { key: "plaintiff", label: "Demandante", placeholder: "Nombre Apellido" },
        { key: "defendant", label: "Demandado/a", placeholder: "Nombre Apellido" },
        { key: "type", label: "Tipo de divorcio", placeholder: "Consentimiento mutuo / Contencioso" },
      ],
    },
  },
  {
    category: "juridico" as const,
    type: "contrato-trabajo",
    language: "fr",
    label: "Contrato de trabajo (FR→ES)",
    structure: {
      fixedFields: [
        { key: "employer", label: "Empresa", type: "text" },
        { key: "contractType", label: "Tipo de contrato", type: "select", options: ["CDI", "CDD", "Intérim", "Stage"] },
        { key: "startDate", label: "Fecha de inicio", type: "date" },
      ],
      variables: [
        { key: "employeeName", label: "Nombre del trabajador", placeholder: "Nombre Apellido" },
        { key: "position", label: "Puesto", placeholder: "Développeur / Comptable..." },
        { key: "salary", label: "Salario bruto mensual", placeholder: "3.500,00 €" },
      ],
    },
  },

  // ─── ECONÓMICO ────────────────────────────────────────────────────────
  {
    category: "economico" as const,
    type: "factura-comercial",
    language: "en",
    label: "Factura comercial / Commercial Invoice (EN→ES)",
    structure: {
      fixedFields: [
        { key: "company", label: "Empresa emisora", type: "text" },
        { key: "invoiceNumber", label: "N.º de factura", type: "text" },
        { key: "invoiceDate", label: "Fecha de factura", type: "date" },
      ],
      variables: [
        { key: "client", label: "Cliente / Destinatario", placeholder: "Nombre o razón social" },
        { key: "items", label: "Conceptos (uno por línea)", placeholder: "Servicio consultoría - 5.000€" },
        { key: "total", label: "Importe total", placeholder: "6.050,00 €" },
      ],
    },
  },
  {
    category: "economico" as const,
    type: "kbis",
    language: "fr",
    label: "Extracto Kbis / Registro mercantil (FR→ES)",
    structure: {
      fixedFields: [
        { key: "rcs", label: "N.º RCS", type: "text" },
        { key: "court", label: "Tribunal de comercio", type: "text" },
        { key: "issueDate", label: "Fecha de expedición", type: "date" },
      ],
      variables: [
        { key: "companyName", label: "Denominación social", placeholder: "SARL Dupont & Fils" },
        { key: "legalForm", label: "Forma jurídica", placeholder: "SARL / SAS / SA" },
        { key: "capital", label: "Capital social", placeholder: "10.000,00 €" },
        { key: "address", label: "Sede social", placeholder: "12 Rue de Commerce, 75015 Paris" },
        { key: "manager", label: "Dirigente / Gérant", placeholder: "Nombre del administrador" },
        { key: "activity", label: "Actividad (NAF)", placeholder: "6201Z - Programación informática" },
      ],
    },
    exampleAnon: "EXTRAIT KBIS\nGREFFE DU TRIBUNAL DE COMMERCE DE [TRIBUNAL]\n\nN° RCS: [RCS]\nDénomination: [EMPRESA]\nForme juridique: [FORMA]\nCapital: [CAPITAL]\nSiège social: [DIRECCIÓN]\nActivité: [ACTIVIDAD]\nDirigeant: [DIRIGENTE]\n\nDélivré le [FECHA]",
  },
];
