/**
 * Compteurs de dette technique (baseline du refacto) sur app/, common/, lib/.
 * Usage : node scripts/debt-count.mjs
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOTS = ["app", "common", "lib"];
const COUNTERS = {
  "`any` explicites": /:\s*any\b|as any\b|<any>/g,
  "Couleurs hex en TSX": /#[0-9a-fA-F]{3,8}\b(?=["'`;\s,)])/g,
  "<button> natifs": /<button\b/g,
  "<select> natifs": /<select\b/g,
  "style={{ inline": /style=\{\{/g,
  "@ts-ignore / @ts-expect-error": /@ts-(ignore|expect-error)/g,
  "<img> (hors next/image)": /<img\b/g,
};

function listFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return listFiles(path);
    return /\.(tsx?|css)$/.test(name) ? [path] : [];
  });
}

const files = ROOTS.flatMap(listFiles);
const codeFiles = files.filter((file) => /\.tsx?$/.test(file));
const totals = Object.fromEntries(Object.keys(COUNTERS).map((key) => [key, 0]));
let clientFiles = 0;

for (const file of codeFiles) {
  const content = readFileSync(file, "utf-8");
  for (const [key, regex] of Object.entries(COUNTERS)) totals[key] += (content.match(regex) ?? []).length;
  if (/^\s*["']use client["']/m.test(content)) clientFiles++;
}

const cssFiles = files.filter((file) => file.endsWith(".css") && !file.includes(`theme${"\\"}`) && !file.includes("theme/"));
const cssHex = cssFiles.reduce((sum, file) => sum + (readFileSync(file, "utf-8").match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).length, 0);

console.log("| Compteur | Valeur |");
console.log("|---|---|");
console.log(`| Fichiers TS/TSX | ${codeFiles.length} |`);
console.log(`| Fichiers "use client" | ${clientFiles} |`);
for (const [key, value] of Object.entries(totals)) console.log(`| ${key} | ${value} |`);
console.log(`| Couleurs hex en CSS (hors thèmes) | ${cssHex} |`);
