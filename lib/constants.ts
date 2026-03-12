// Nombres de idiomas ISO 639-1 → español
export const LANG_NAMES: Record<string, string> = {
  fr: "Francés", en: "Inglés", de: "Alemán", it: "Italiano", pt: "Portugués",
  ar: "Árabe", zh: "Chino", ja: "Japonés", ru: "Ruso", ro: "Rumano",
  pl: "Polaco", nl: "Neerlandés", ca: "Catalán", eu: "Euskera", gl: "Gallego",
  es: "Español",
};

// DocumentCategory enum → nombre legible
export const CATEGORY_NAMES: Record<string, string> = {
  academico: "Académico",
  notarial: "Notarial",
  administrativo: "Administrativo",
  economico: "Económico",
  juridico: "Jurídico",
};

// 52 provincias españolas (orden alfabético)
export const PROVINCES = [
  "Álava", "Albacete", "Alicante", "Almería", "Asturias",
  "Ávila", "Badajoz", "Barcelona", "Burgos", "Cáceres",
  "Cádiz", "Cantabria", "Castellón", "Ciudad Real", "Córdoba",
  "A Coruña", "Cuenca", "Girona", "Granada", "Guadalajara",
  "Gipuzkoa", "Huelva", "Huesca", "Illes Balears", "Jaén",
  "León", "Lleida", "Lugo", "Madrid", "Málaga",
  "Murcia", "Navarra", "Ourense", "Palencia", "Las Palmas",
  "Pontevedra", "La Rioja", "Salamanca", "Santa Cruz de Tenerife",
  "Segovia", "Sevilla", "Soria", "Tarragona", "Teruel",
  "Toledo", "Valencia", "Valladolid", "Bizkaia", "Zamora",
  "Zaragoza", "Ceuta", "Melilla",
] as const;
