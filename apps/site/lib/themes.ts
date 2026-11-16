/**
 * Liste officielle des thèmes visuels du site (ADR 0006, ADR 0009). Elle vient de la source unique des thèmes,
 * `packages/ui/src/themes/themeData.mjs`, par le fichier généré `themeList.ts` (commande `themes:build`) : pour
 * ajouter, renommer ou recolorer un thème, modifier le fichier de données et relancer le script, jamais cette liste.
 * L'identifiant (`id`) est la valeur enregistrée dans le profil du membre (colonne `theme`) et posée sur la balise
 * <html> (attribut `data-theme`) ; il ne change jamais (ADR-0009). Le nom (`label`) est celui affiché au membre,
 * `swatch` les couleurs d'aperçu.
 * Ce fichier ne contient que des données : il peut être lu côté serveur comme côté navigateur.
 */
import { THEME_LIST } from "@bbfrance/ui/themes";

export const SITE_THEMES = THEME_LIST;

export type SiteThemeId = (typeof SITE_THEMES)[number]["id"];

/** Thème donné à un nouveau membre (même valeur que la colonne `theme` du schéma Prisma). */
export const DEFAULT_SITE_THEME: SiteThemeId = "vestiaire";

/** Vrai si la valeur reçue est l'identifiant d'un des thèmes du site. */
export function isSiteTheme(value: string): value is SiteThemeId {
  return SITE_THEMES.some((theme) => theme.id === value);
}

/**
 * Nom du cookie qui garde le thème choisi sur cet appareil (carte 147). `ThemeProvider` l'écrit à chaque changement
 * de thème ; la mise en page générale (`app/layout.tsx`) le lit pour un visiteur non connecté, afin que le serveur
 * envoie la page directement dans ce thème (ADR 0005 : le thème est posé par le serveur). Pour un membre connecté,
 * c'est le thème de son profil qui compte.
 */
export const THEME_COOKIE = "bbfrance_theme";
