/**
 * Génère les fichiers des thèmes à partir de leur source unique, `src/themes/themeData.mjs` (ADR-0009, carte 211).
 * Lancement : `corepack pnpm themes:build` à la racine du dépôt (ou `node packages/ui/scripts/build-themes.mjs`).
 *
 * Fichiers écrits (à enregistrer dans git avec le fichier de données) :
 * - `src/themes/<id>.css` : les variables `--bb-*` de chaque thème ;
 * - `src/themes/index.css` : l'import de tous ces fichiers ;
 * - `src/themes/themeList.ts` : la liste des thèmes lue par le site (nom, couleurs d'aperçu pour le
 *   sélecteur).
 *
 * Un thème décrit par `vars` est recopié tel quel. Un thème décrit par `base` (quelques couleurs de base) est
 * complété par `deriveVars` : surfaces, bordures, textes, couleurs d'état. Chaque couleur de texte est ensuite
 * éclaircie (thème sombre) ou assombrie (thème clair) pas à pas jusqu'à atteindre le contraste demandé par
 * `apps/site/tests/e2e/contraste.spec.ts` (norme WCAG AA : 4,5 pour 1 pour un texte, 3 pour 1 pour une marque).
 * Le calcul garantit la lisibilité, pas la beauté : chaque nouveau thème se relit à l'œil.
 *
 * Fins de ligne : un fichier qui existe déjà garde les siennes (CRLF ou LF), pour que la génération ne change rien
 * quand les couleurs ne changent pas.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { THEMES } from "../src/themes/themeData.mjs";

const THEMES_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "themes");

// ---------- Couleurs ----------

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const rgbToHex = (rgb) => `#${rgb.map((c) => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, "0")).join("")}`;
/** Mélange `a` et `b` : `amount` vaut 0 pour `a` seul, 1 pour `b` seul. */
const mix = (a, b, amount) => {
  const [x, y] = [hexToRgb(a), hexToRgb(b)];
  return rgbToHex(x.map((c, i) => c + (y[i] - c) * amount));
};
const rgba = (hex, alpha) => `rgba(${hexToRgb(hex).join(", ")}, ${alpha})`;

/** Luminance relative et contraste, selon la formule WCAG 2 (la même que le test de contraste). */
function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((c) => c / 255).map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Rapproche `color` du blanc (`towards` = "#ffffff") ou du noir jusqu'à ce qu'elle atteigne `min` contre chacun des
 * fonds donnés. Pas de 4 % : la teinte reste reconnaissable.
 */
function ensure(color, backgrounds, min, towards) {
  let current = color;
  for (let step = 0; step < 30; step++) {
    if (backgrounds.every((bg) => contrast(current, bg) >= min)) return current;
    current = mix(current, towards, 0.08);
  }
  return current;
}

/** Texte posé sur une couleur pleine (bouton) : blanc, ou presque noir si le blanc ne se lit pas. */
const onColor = (fill) => (contrast("#ffffff", fill) >= 4.5 ? "#ffffff" : "#111111");

/**
 * Complète un thème décrit par ses couleurs de base :
 * `scheme` ("dark" ou "light"), `bg` (fond de page), `surface` (cartes), `accent` (boutons principaux),
 * et, facultatifs, `text`, `unread`, `rank`, `navBg`, `danger`, `bgImage`.
 */
export function deriveVars(base) {
  const dark = base.scheme === "dark";
  const light = dark ? "#ffffff" : "#000000"; // direction qui augmente le contraste
  const text = base.text ?? (dark ? mix("#eceef1", base.accent, 0.04) : mix("#16181d", base.accent, 0.06));
  const surface = base.surface;
  const surface2 = base.surface2 ?? mix(surface, text, dark ? 0.07 : 0.05);
  const border = base.border ?? mix(surface, text, dark ? 0.14 : 0.16);
  const textBgs = [base.bg, surface, surface2];
  const textMuted = ensure(mix(text, base.bg, 0.4), textBgs, 4.6, text);

  // Le fond des boutons principaux doit porter un texte lisible : on fonce ou éclaircit l'accent si besoin
  let accent = base.accent;
  if (Math.max(contrast("#ffffff", accent), contrast("#111111", accent)) < 4.6) accent = ensure(accent, ["#ffffff"], 4.6, "#000000");
  // Texte du bouton d'abord, puis l'état survolé : il s'éloigne de la couleur du texte (plus sombre sous un texte
  // blanc, plus clair sous un texte foncé), pour que le texte reste lisible quand le doigt ou la souris passe dessus
  const onAccent = onColor(accent);
  const accentHover = onAccent === "#ffffff"
    ? ensure(mix(accent, "#000000", 0.15), [onAccent], 4.6, "#000000")
    : ensure(mix(accent, "#ffffff", 0.15), [onAccent], 4.6, "#ffffff");
  const accentText = ensure(accent, [base.bg, surface], 4.6, light);

  const danger = base.danger ?? (dark ? "#c8102e" : "#b01a1a");
  const dangerText = ensure(danger, [surface], 4.6, light);
  const navBg = base.navBg ?? mix(base.bg, surface, 0.5);
  const unread = ensure(base.unread ?? (dark ? "#5aa9ff" : "#1d4ed8"), [surface, base.bg], 3.2, light);

  return {
    scheme: base.scheme,
    bg: base.bg,
    ...(base.bgImage ? { "bg-image": base.bgImage } : {}),
    surface,
    "surface-2": surface2,
    border,
    text,
    "text-muted": textMuted,
    accent,
    "accent-hover": accentHover,
    "on-accent": onAccent,
    "accent-text": accentText,
    "accent-soft": rgba(accentText, dark ? 0.14 : 0.1),
    danger,
    "on-danger": onColor(danger),
    "danger-text": dangerText,
    "success-text": ensure(dark ? "#4ade80" : "#1f6b32", [surface], 4.6, light),
    "warning-text": ensure(dark ? "#fbbf24" : "#8a5a00", [surface], 4.6, light),
    unread,
    rank: ensure(base.rank ?? (dark ? "#e2b54a" : "#8a6508"), [surface], 3.2, light),
    focus: ensure(unread, [base.bg], 3.2, light),
    "nav-bg": navBg,
    "nav-border": border,
    "nav-text": ensure(textMuted, [navBg], 4.6, text),
    "nav-active": ensure(accentText, [navBg], 4.6, light),
    overlay: dark ? "rgba(0, 0, 0, 0.6)" : rgba(text, 0.45),
    shadow: dark ? "0 8px 24px rgba(0, 0, 0, 0.35)" : `0 8px 24px ${rgba(text, 0.12)}`,
    "glass-blur": "0px",
  };
}

// ---------- Écriture ----------

/** Écrit `content` (fins de ligne LF) en gardant les fins de ligne d'un fichier existant ; renvoie vrai s'il a changé. */
function writeKeepingEol(file, content) {
  const previous = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null;
  const eol = previous?.includes("\r\n") ? "\r\n" : "\n";
  const next = content.replace(/\n/g, eol);
  if (previous === next) return false;
  fs.writeFileSync(file, next);
  return true;
}

function themeCss(theme, vars) {
  const lines = Object.entries(vars).map(([name, value]) => `  --bb-${name}: ${value};`);
  return `${theme.comment}\n${theme.selector} {\n${lines.join("\n")}\n}\n`;
}

const ids = new Set();
const list = [];
let changed = 0;
for (const theme of THEMES) {
  if (ids.has(theme.id)) throw new Error(`Identifiant de thème en double : ${theme.id}`);
  ids.add(theme.id);
  const vars = theme.vars ?? deriveVars(theme.base);
  const comment = theme.comment ?? `/* Thème « ${theme.label} » (ADR-0009) : fichier généré par packages/ui/scripts/build-themes.mjs, ne pas modifier à la main. */`;
  const selector = theme.selector ?? `[data-theme="${theme.id}"]`;
  if (writeKeepingEol(path.join(THEMES_DIR, `${theme.id}.css`), themeCss({ comment, selector }, vars))) changed++;
  list.push({
    id: theme.id,
    label: theme.label,
    scheme: vars.scheme,
    swatch: { bg: vars.bg, surface: vars.surface, accent: vars.accent, text: vars.text },
  });
}

// Un thème retiré du fichier de données perd son fichier de couleurs (carte 218) : tout fichier .css de ce dossier
// qui n'est ni un thème de la liste ni index.css est supprimé.
for (const file of fs.readdirSync(THEMES_DIR)) {
  if (!file.endsWith(".css") || file === "index.css" || ids.has(file.slice(0, -4))) continue;
  fs.rmSync(path.join(THEMES_DIR, file));
  changed++;
}

const index = `/*
 * Les thèmes du site en variables v2 (ADR 0006, ADR 0009). Fichier généré par packages/ui/scripts/build-themes.mjs
 * à partir de themeData.mjs : ne pas le modifier à la main. Chaque fichier importé définit les mêmes variables
 * \`--bb-*\` sous \`[data-theme="<id>"]\` ; Vestiaire est aussi posé sur :root (thème par défaut).
 * Le test de contraste (apps/site/tests/e2e/contraste.spec.ts) vérifie chaque thème de la liste.
 */
${THEMES.map((theme) => `@import "./${theme.id}.css";`).join("\n")}
`;
if (writeKeepingEol(path.join(THEMES_DIR, "index.css"), index)) changed++;

const ts = `/**
 * Liste des thèmes du site (ADR-0009). Fichier généré par packages/ui/scripts/build-themes.mjs à partir de
 * themeData.mjs : ne pas le modifier à la main. Il ne contient que des données : il peut être lu côté serveur, côté
 * navigateur et par les tests. \`swatch\` donne les couleurs d'aperçu du sélecteur de thèmes.
 */
export const THEME_LIST = ${JSON.stringify(list, null, 2)} as const;

export type ThemeId = (typeof THEME_LIST)[number]["id"];
`;
if (writeKeepingEol(path.join(THEMES_DIR, "themeList.ts"), ts)) changed++;

console.log(`${THEMES.length} thèmes ; ${changed} fichier(s) écrit(s) ou modifié(s).`);
