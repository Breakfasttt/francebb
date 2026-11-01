/**
 * Mappage des départements aux régions administratives françaises.
 */
export const DEPARTMENTS_BY_REGION: Record<string, string[]> = {
  "Auvergne-Rhône-Alpes": ["01", "03", "07", "15", "26", "38", "42", "43", "63", "69", "73", "74"],
  "Bourgogne-Franche-Comté": ["21", "25", "39", "58", "70", "71", "89", "90"],
  "Bretagne": ["22", "29", "35", "56"],
  "Centre-Val de Loire": ["18", "28", "36", "37", "41", "45"],
  "Corse": ["2A", "2B"],
  "Grand Est": ["08", "10", "51", "52", "54", "55", "57", "67", "68", "88"],
  "Hauts-de-France": ["02", "59", "60", "62", "80"],
  "Île-de-France": ["75", "77", "78", "91", "92", "93", "94", "95"],
  "Normandie": ["14", "27", "50", "61", "76"],
  "Nouvelle-Aquitaine": ["16", "17", "19", "23", "24", "33", "40", "47", "64", "79", "86", "87"],
  "Occitanie": ["09", "11", "12", "30", "31", "32", "34", "46", "48", "65", "66", "81", "82"],
  "Pays de la Loire": ["44", "49", "53", "72", "85"],
  "Provence-Alpes-Côte d'Azur": ["04", "05", "06", "13", "83", "84"],
  "Guadeloupe": ["971"],
  "Martinique": ["972"],
  "Guyane": ["973"],
  "La Réunion": ["974"],
  "Mayotte": ["976"]
};

// Map inverse pour retrouver la région à partir du département
export const REGION_BY_DEPARTMENT: Record<string, string> = {};
for (const [region, depts] of Object.entries(DEPARTMENTS_BY_REGION)) {
  for (const dept of depts) {
    REGION_BY_DEPARTMENT[dept] = region;
  }
}

/** Retire les accents d'un texte (« Île-de-France » devient « Ile-de-France »), pour comparer deux écritures. */
export function withoutAccents(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

/**
 * Nom officiel (accentué) d'une région écrite avec ou sans accents, ou `null` si le nom ne correspond à aucune région.
 * Sert à garder valables les anciennes adresses de `/tournois` (carte 129), dont le filtre utilisait des noms sans
 * accents (« ?region=Ile-de-France »).
 */
export function canonicalRegion(name: string): string | null {
  if (DEPARTMENTS_BY_REGION[name]) return name;
  const plain = withoutAccents(name).toLowerCase();
  return Object.keys(DEPARTMENTS_BY_REGION).find((region) => withoutAccents(region).toLowerCase() === plain) ?? null;
}

/**
 * Numéro d'un département (« 35 ») à partir de ce qui a été enregistré : le numéro lui-même, ou le libellé
 * « 35 - Ille-et-Vilaine » que le formulaire des ligues enregistrait avant la carte 137. Une valeur vide donne `null`.
 */
export function departmentNumber(value: string | null | undefined): string | null {
  const text = (value ?? "").trim();
  if (!text) return null;
  const match = text.match(/^([0-9]{2,3}|2[AB])\s*-\s/i);
  return match ? match[1].toUpperCase() : text;
}
