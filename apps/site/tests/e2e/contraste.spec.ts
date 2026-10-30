/**
 * Contraste des 8 thèmes (ADR 0006, carte 077) : chaque paire texte / fond utilisée par l'interface doit atteindre
 * le niveau AA de la norme WCAG, soit un écart de luminosité d'au moins 4,5 pour 1 (3 pour 1 pour un élément
 * non textuel comme une pastille). Le test lit directement les fichiers de packages/ui/src/themes/ : un thème
 * ajouté ou modifié est vérifié sans rien écrire de plus. Aucun navigateur n'est nécessaire.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test, expect } from "@playwright/test";
import { SITE_THEMES } from "../../lib/themes";

const THEMES_DIR = join(__dirname, "../../../../packages/ui/src/themes");

/** Lit les variables `--bb-*` d'un fichier de thème (couleurs hexadécimales seulement). */
function readTheme(file: string): Record<string, string> {
  const css = readFileSync(join(THEMES_DIR, file), "utf-8");
  const vars: Record<string, string> = {};
  for (const match of css.matchAll(/--bb-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) vars[match[1]] = match[2];
  return vars;
}

/** Luminance relative d'une couleur hexadécimale, selon la formule WCAG 2. */
function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Paires [premier plan, fond, contraste minimal] vérifiées dans chaque thème. */
const PAIRS: [string, string, number][] = [
  ["text", "bg", 4.5], ["text", "surface", 4.5], ["text", "surface-2", 4.5],
  ["text-muted", "bg", 4.5], ["text-muted", "surface", 4.5], ["text-muted", "surface-2", 4.5],
  ["accent-text", "bg", 4.5], ["accent-text", "surface", 4.5],
  ["on-accent", "accent", 4.5], ["on-accent", "accent-hover", 4.5], ["on-danger", "danger", 4.5],
  ["danger-text", "surface", 4.5], ["success-text", "surface", 4.5], ["warning-text", "surface", 4.5],
  ["unread", "surface", 3], ["unread", "bg", 3], ["rank", "surface", 3], ["focus", "bg", 3],
  ["nav-text", "nav-bg", 4.5], ["nav-active", "nav-bg", 4.5],
];

test("chaque thème de la liste officielle a son fichier de variables v2", () => {
  const files = readdirSync(THEMES_DIR).filter((f) => f.endsWith(".css") && f !== "index.css");
  expect(files.map((f) => f.replace(".css", "")).sort()).toEqual(SITE_THEMES.map((t) => t.id).sort());
});

for (const theme of SITE_THEMES) {
  test(`contraste AA du thème ${theme.label}`, () => {
    const vars = readTheme(`${theme.id}.css`);
    const failures: string[] = [];
    for (const [fg, bg, min] of PAIRS) {
      expect(vars[fg], `--bb-${fg} manquant ou non hexadécimal`).toBeTruthy();
      expect(vars[bg], `--bb-${bg} manquant ou non hexadécimal`).toBeTruthy();
      const ratio = contrast(vars[fg], vars[bg]);
      if (ratio < min) failures.push(`--bb-${fg} sur --bb-${bg} : ${ratio.toFixed(2)} (minimum ${min})`);
    }
    expect(failures, failures.join("\n")).toEqual([]);
  });
}
