/**
 * Cliquet ESLint : échoue si le nombre d'erreurs dépasse le plafond de lint-baseline.json.
 * La dette existante est tolérée, toute nouvelle erreur est bloquée.
 * Quand le compte baisse, lancer `npm run lint:ratchet -- --update` pour abaisser le plafond.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { ESLint } from "eslint";

const BASELINE_FILE = "lint-baseline.json";

const eslint = new ESLint();
const results = await eslint.lintFiles(["."]);
const errorCount = results.reduce((sum, file) => sum + file.errorCount, 0);
const { maxErrors } = JSON.parse(readFileSync(BASELINE_FILE, "utf-8"));

if (process.argv.includes("--update")) {
  writeFileSync(BASELINE_FILE, JSON.stringify({ maxErrors: errorCount }, null, 2) + "\n");
  console.log(`Plafond ESLint mis à jour : ${maxErrors} -> ${errorCount}`);
  process.exit(0);
}

if (errorCount > maxErrors) {
  const formatter = await eslint.loadFormatter("stylish");
  console.log(await formatter.format(results.filter((file) => file.errorCount > 0)));
  console.error(`ESLint : ${errorCount} erreurs, plafond ${maxErrors}. Corriger les nouvelles erreurs.`);
  process.exit(1);
}

console.log(`ESLint : ${errorCount} erreurs (plafond ${maxErrors}).`);
if (errorCount < maxErrors) console.log("Dette en baisse : lancer `npm run lint:ratchet -- --update`.");
