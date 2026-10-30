/**
 * Cliquet ESLint : échoue si le nombre d'erreurs dépasse le plafond de lint-baseline.json.
 * La dette existante est tolérée, toute nouvelle erreur est bloquée.
 * Le plafond existe pour le total et pour chaque règle : corriger une erreur d'une règle
 * ne donne pas le droit d'en ajouter une d'une autre règle. Une règle absente du fichier
 * a un plafond de zéro.
 * Quand le compte baisse, lancer `npm run lint:ratchet -- --update` pour abaisser le plafond.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { ESLint } from "eslint";

const BASELINE_FILE = "lint-baseline.json";

const eslint = new ESLint();
const results = await eslint.lintFiles(["."]);
const errorCount = results.reduce((sum, file) => sum + file.errorCount, 0);

// Nombre d'erreurs par règle. Une erreur sans règle (fichier illisible) est comptée à part.
const ruleCounts = {};
for (const file of results) {
  for (const message of file.messages) {
    if (message.severity !== 2) continue;
    const rule = message.ruleId ?? "(erreur de lecture)";
    ruleCounts[rule] = (ruleCounts[rule] ?? 0) + 1;
  }
}
const sortedRuleCounts = Object.fromEntries(Object.entries(ruleCounts).sort(([a], [b]) => a.localeCompare(b)));

const { maxErrors, rules: maxByRule = {} } = JSON.parse(readFileSync(BASELINE_FILE, "utf-8"));

if (process.argv.includes("--update")) {
  writeFileSync(BASELINE_FILE, JSON.stringify({ maxErrors: errorCount, rules: sortedRuleCounts }, null, 2) + "\n");
  console.log(`Plafond ESLint mis à jour : ${maxErrors} -> ${errorCount}`);
  for (const [rule, count] of Object.entries(sortedRuleCounts)) {
    const previous = maxByRule[rule] ?? 0;
    if (previous !== count) console.log(`  ${rule} : ${previous} -> ${count}`);
  }
  process.exit(0);
}

const rulesOverLimit = Object.entries(ruleCounts).filter(([rule, count]) => count > (maxByRule[rule] ?? 0));

if (errorCount > maxErrors || rulesOverLimit.length > 0) {
  const formatter = await eslint.loadFormatter("stylish");
  console.log(await formatter.format(results.filter((file) => file.errorCount > 0)));
  for (const [rule, count] of rulesOverLimit) {
    console.error(`Règle ${rule} : ${count} erreurs, plafond ${maxByRule[rule] ?? 0}.`);
  }
  console.error(`ESLint : ${errorCount} erreurs, plafond ${maxErrors}. Corriger les nouvelles erreurs.`);
  process.exit(1);
}

console.log(`ESLint : ${errorCount} erreurs (plafond ${maxErrors}).`);
const rulesUnderLimit = Object.entries(maxByRule).filter(([rule, max]) => (ruleCounts[rule] ?? 0) < max);
if (errorCount < maxErrors || rulesUnderLimit.length > 0) {
  console.log("Dette en baisse : lancer `npm run lint:ratchet -- --update`.");
}
