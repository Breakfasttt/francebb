/**
 * Liste des thèmes du site (ADR-0009). Fichier généré par packages/ui/scripts/build-themes.mjs à partir de
 * themeData.mjs : ne pas le modifier à la main. Il ne contient que des données : il peut être lu côté serveur, côté
 * navigateur et par les tests. `swatch` donne les couleurs d'aperçu du sélecteur de thèmes.
 */
export const THEME_LIST = [
  {
    "id": "vestiaire",
    "label": "Sombre",
    "scheme": "dark",
    "swatch": {
      "bg": "#111215",
      "surface": "#1a1c21",
      "accent": "#c8102e",
      "text": "#eceef1"
    }
  },
  {
    "id": "saison3",
    "label": "Saison 3",
    "scheme": "light",
    "swatch": {
      "bg": "#ead9bf",
      "surface": "#f7ecdb",
      "accent": "#8b1919",
      "text": "#231a12"
    }
  },
  {
    "id": "naf",
    "label": "NAF",
    "scheme": "light",
    "swatch": {
      "bg": "#f4f4f4",
      "surface": "#ffffff",
      "accent": "#990000",
      "text": "#2b2b2b"
    }
  },
  {
    "id": "nehekhara",
    "label": "Néhékhara",
    "scheme": "dark",
    "swatch": {
      "bg": "#0b0e14",
      "surface": "#141924",
      "accent": "#d97706",
      "text": "#f3eee2"
    }
  },
  {
    "id": "elfes-noirs",
    "label": "Violet",
    "scheme": "dark",
    "swatch": {
      "bg": "#0f0c14",
      "surface": "#1a1523",
      "accent": "#8e2dbf",
      "text": "#e8e6ef"
    }
  }
] as const;

export type ThemeId = (typeof THEME_LIST)[number]["id"];
