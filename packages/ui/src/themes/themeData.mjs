/**
 * Source unique des thèmes du site (ADR-0009, cartes 211 et 218). Ce fichier est la seule chose à modifier pour ajouter,
 * renommer ou recolorer un thème ; le script `packages/ui/scripts/build-themes.mjs` (commande `themes:build`, à la
 * racine du dépôt) en tire tout le reste :
 * - un fichier de couleurs par thème, `packages/ui/src/themes/<id>.css` (les variables `--bb-*`, voir tokens.css) ;
 * - `themes/index.css`, qui importe tous ces fichiers ;
 * - `themes/themeList.ts`, la liste lue par le site (sélecteur, validation du thème enregistré, tests).
 * Le script supprime aussi le fichier de couleurs d'un thème retiré de cette liste.
 *
 * Chaque thème a :
 * - `id` : l'identifiant enregistré dans le profil des membres (`User.theme`) et posé sur `<html data-theme>`.
 *   Ne jamais changer l'identifiant d'un thème gardé : les membres qui l'ont choisi le perdraient (ADR-0009). Un
 *   identifiant inconnu (thème retiré) fait retomber le membre sur le thème par défaut, `saison3`.
 * - `label` : le nom affiché au membre ;
 * - `comment` et `selector` : l'en-tête et le sélecteur CSS du fichier généré (facultatifs) ;
 * - `vars` : toutes les variables `--bb-*`, écrites à la main (thèmes de l'ADR-0006),
 *   ou `base` : quelques couleurs de base, dont le script calcule les autres et corrige le contraste.
 * Les fichiers générés sont enregistrés dans le dépôt : rien n'est calculé pendant que le site tourne.
 *
 * Carte 218 : le responsable a gardé 5 thèmes sur les 35 de l'ADR-0009. « Sombre » est l'ancien Vestiaire (identifiant
 * `vestiaire`) et « Violet » l'ancien thème des Elfes noirs (identifiant `elfes-noirs`). Depuis le 22/11/2026, le thème
 * par défaut est « Saison 3 » : posé sur :root, il habille aussi les applications sans attribut data-theme (le hub).
 */

/** Les thèmes, dans l'ordre d'affichage du sélecteur. */
export const THEMES = [
  {
    id: "vestiaire",
    label: "Sombre",
    comment: "/*\n * Thème « Vestiaire » (ADR 0006) : sombre et sobre, surfaces pleines, accent rouge Blood Bowl.\n *  * Liste et rôle de chaque variable : packages/ui/src/tokens.css.\n */",
    selector: "[data-theme=\"vestiaire\"]",
    vars: {
      "scheme": "dark",
      "bg": "#111215",
      "surface": "#1a1c21",
      "surface-2": "#252830",
      "border": "#2f333b",
      "text": "#eceef1",
      "text-muted": "#a3a9b3",
      "accent": "#c8102e",
      "accent-hover": "#a90d26",
      "on-accent": "#ffffff",
      "accent-text": "#ff7b80",
      "accent-soft": "rgba(255, 123, 128, 0.14)",
      "danger": "#c8102e",
      "on-danger": "#ffffff",
      "danger-text": "#ff7b80",
      "success-text": "#4ade80",
      "warning-text": "#fbbf24",
      "unread": "#5aa9ff",
      "rank": "#e2b54a",
      "focus": "#5aa9ff",
      "nav-bg": "#16181c",
      "nav-border": "#2f333b",
      "nav-text": "#a3a9b3",
      "nav-active": "#ff7b80",
      "overlay": "rgba(0, 0, 0, 0.6)",
      "shadow": "0 8px 24px rgba(0, 0, 0, 0.35)",
      "glass-blur": "0px",
    },
  },
  {
    id: "saison3",
    label: "Saison 3",
    comment: "/* Thème « Saison 3 », thème par défaut : les couleurs du livre de règles officiel (2025) — parchemin chaud, bandeaux bleu marine (pages d'histoire), titres rouges, jaune des pieds de page. */",
    // Thème par défaut (22/11/2026) : il s'applique aussi sans attribut data-theme (:root), par exemple au hub
    selector: ":root,\n[data-theme=\"saison3\"]",
    vars: {
      "scheme": "light",
      "bg": "#ead9bf",
      "bg-image": "linear-gradient(135deg, #f2e5d3 0%, #e2cdaa 100%)",
      "surface": "#f7ecdb",
      "surface-2": "#dfc59c",
      "border": "#c4a57a",
      "text": "#231a12",
      "text-muted": "#5f4a36",
      "accent": "#8b1919",
      "accent-hover": "#6e1212",
      "on-accent": "#ffffff",
      "accent-text": "#8b1919",
      "accent-soft": "rgba(139, 25, 25, 0.1)",
      "danger": "#8b1919",
      "on-danger": "#ffffff",
      "danger-text": "#8b1919",
      "success-text": "#2f5b1c",
      "warning-text": "#7a4d00",
      "unread": "#293c76",
      "rank": "#7a5a0c",
      "focus": "#293c76",
      "nav-bg": "#2b3b76",
      "nav-border": "#1c2852",
      "nav-text": "#ece3cf",
      "nav-active": "#f5c518",
      "logo-accent": "#ff6b5e",
      "overlay": "rgba(35, 26, 18, 0.5)",
      "shadow": "0 8px 24px rgba(35, 26, 18, 0.2)",
      "glass-blur": "0px",
    },
  },
  {
    id: "naf",
    label: "NAF",
    comment: "/* Thème « NAF » : clair, bandeau et liens rouge foncé, dans l'esprit du site de la NAF (thenaf.net). */",
    selector: "[data-theme=\"naf\"]",
    vars: {
      "scheme": "light",
      "bg": "#f4f4f4",
      "surface": "#ffffff",
      "surface-2": "#f3eeee",
      "border": "#ddd3d3",
      "text": "#2b2b2b",
      "text-muted": "#595959",
      "accent": "#990000",
      "accent-hover": "#760000",
      "on-accent": "#ffffff",
      "accent-text": "#990000",
      "accent-soft": "rgba(153, 0, 0, 0.08)",
      "danger": "#b01a1a",
      "on-danger": "#ffffff",
      "danger-text": "#b01a1a",
      "success-text": "#1f6b32",
      "warning-text": "#8a5a00",
      "unread": "#1d4ed8",
      "rank": "#8a6508",
      "focus": "#1d4ed8",
      "nav-bg": "#990000",
      "nav-border": "#760000",
      "nav-text": "#f6d9d9",
      "nav-active": "#ffffff",
      "overlay": "rgba(43, 43, 43, 0.45)",
      "shadow": "0 8px 24px rgba(43, 43, 43, 0.12)",
      "glass-blur": "0px",
    },
  },
  {
    id: "nehekhara",
    label: "Néhékhara",
    comment: "/* Thème « Néhékhara » : sombre, ambre et turquoise des Rois des Tombes. */",
    selector: "[data-theme=\"nehekhara\"]",
    vars: {
      "scheme": "dark",
      "bg": "#0b0e14",
      "bg-image": "radial-gradient(circle at 50% 50%, #1a1e2e 0%, #0b0e14 100%)",
      "surface": "#141924",
      "surface-2": "#1c2331",
      "border": "#2a3344",
      "text": "#f3eee2",
      "text-muted": "#a9b0bd",
      "accent": "#d97706",
      "accent-hover": "#e8860c",
      "on-accent": "#0b0e14",
      "accent-text": "#f59e0b",
      "accent-soft": "rgba(245, 158, 11, 0.14)",
      "danger": "#c8102e",
      "on-danger": "#ffffff",
      "danger-text": "#ff8a8a",
      "success-text": "#4ade80",
      "warning-text": "#fbbf24",
      "unread": "#3fc1b4",
      "rank": "#f59e0b",
      "focus": "#3fc1b4",
      "nav-bg": "#080a0f",
      "nav-border": "#2a3344",
      "nav-text": "#a9b0bd",
      "nav-active": "#f59e0b",
      "overlay": "rgba(0, 0, 0, 0.65)",
      "shadow": "0 8px 24px rgba(0, 0, 0, 0.45)",
      "glass-blur": "0px",
    },
  },
  {
    id: "elfes-noirs",
    label: "Violet",
    base: { scheme: "dark", bg: "#0f0c14", surface: "#1a1523", accent: "#8e2dbf" },
  },
];
