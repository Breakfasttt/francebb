/**
 * Liste officielle des 7 thèmes visuels du site.
 * L'identifiant (`id`) est la valeur enregistrée dans le profil du membre (colonne `theme`)
 * et posée sur la balise <html> (attribut `data-theme`) ; il doit correspondre à un fichier
 * `app/theme/theme.<id>.css` (le thème sombre `default` est celui de `:root`).
 * Le nom (`label`) est celui affiché au membre. Toute liste de thèmes du site part de celle-ci.
 * Ce fichier ne contient que des données : il peut être lu côté serveur comme côté navigateur.
 */
export const SITE_THEMES = [
  { id: "saison3", label: "Saison 3" },
  { id: "default", label: "Sombre" },
  { id: "light", label: "Clair" },
  { id: "blood", label: "Blood" },
  { id: "malpierre", label: "Malpierre" },
  { id: "nehekhara", label: "Néhékhara" },
  { id: "naf", label: "NAF" },
] as const;

export type SiteThemeId = (typeof SITE_THEMES)[number]["id"];

/** Thème donné à un nouveau membre (même valeur que la colonne `theme` du schéma Prisma). */
export const DEFAULT_SITE_THEME: SiteThemeId = "saison3";

/** Vrai si la valeur reçue est l'identifiant d'un des 7 thèmes. */
export function isSiteTheme(value: string): value is SiteThemeId {
  return SITE_THEMES.some((theme) => theme.id === value);
}
