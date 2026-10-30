/**
 * Cliquet ESLint : échoue si le nombre d'erreurs dépasse le plafond du fichier lint-baseline.json.
 * La dette existante est tolérée, toute nouvelle erreur est bloquée.
 * Le plafond existe pour le total et pour chaque règle : corriger une erreur d'une règle
 * ne donne pas le droit d'en ajouter une d'une autre règle. Une règle absente du fichier
 * a un plafond de zéro.
 *
 * Le cliquet contrôle trois cibles, chacune avec son propre plafond :
 *  - le site (apps/site, configuration eslint.config.mjs, plafond lint-baseline.json) ;
 *  - packages/ui et packages/bbscheme-player (configuration eslint.packages.config.mjs,
 *    plafond lint-baseline.json dans le dossier de chaque paquet). Les paquets n'installent
 *    pas ESLint : ils utilisent celui du site.
 * Quand le compte baisse, lancer `npm run lint:ratchet -- --update` pour abaisser les plafonds.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";

const SITE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PACKAGES_CONFIG = path.join(SITE_DIR, "eslint.packages.config.mjs");

const TARGETS = [
  { name: "site", cwd: SITE_DIR, options: {} },
  ...["ui", "bbscheme-player"].map((paquet) => ({
    name: `packages/${paquet}`,
    cwd: path.resolve(SITE_DIR, "../../packages", paquet),
    options: { overrideConfigFile: PACKAGES_CONFIG },
  })),
];

const update = process.argv.includes("--update");
let failed = false;

for (const target of TARGETS) {
  const baselineFile = path.join(target.cwd, "lint-baseline.json");
  const eslint = new ESLint({ cwd: target.cwd, ...target.options });
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

  let baseline = { maxErrors: 0, rules: {} };
  try {
    baseline = JSON.parse(readFileSync(baselineFile, "utf-8"));
  } catch {
    if (!update) {
      console.error(`${target.name} : fichier ${baselineFile} introuvable. Lancer le cliquet avec --update.`);
      process.exit(1);
    }
  }
  const { maxErrors, rules: maxByRule = {} } = baseline;

  if (update) {
    writeFileSync(baselineFile, JSON.stringify({ maxErrors: errorCount, rules: sortedRuleCounts }, null, 2) + "\n");
    console.log(`${target.name} : plafond ESLint mis à jour : ${maxErrors} -> ${errorCount}`);
    for (const [rule, count] of Object.entries(sortedRuleCounts)) {
      const previous = maxByRule[rule] ?? 0;
      if (previous !== count) console.log(`  ${rule} : ${previous} -> ${count}`);
    }
    continue;
  }

  const rulesOverLimit = Object.entries(ruleCounts).filter(([rule, count]) => count > (maxByRule[rule] ?? 0));

  if (errorCount > maxErrors || rulesOverLimit.length > 0) {
    failed = true;
    const formatter = await eslint.loadFormatter("stylish");
    console.log(await formatter.format(results.filter((file) => file.errorCount > 0)));
    for (const [rule, count] of rulesOverLimit) {
      console.error(`${target.name} : règle ${rule} : ${count} erreurs, plafond ${maxByRule[rule] ?? 0}.`);
    }
    console.error(`${target.name} : ESLint : ${errorCount} erreurs, plafond ${maxErrors}. Corriger les nouvelles erreurs.`);
    continue;
  }

  console.log(`${target.name} : ESLint : ${errorCount} erreurs (plafond ${maxErrors}).`);
  const rulesUnderLimit = Object.entries(maxByRule).filter(([rule, max]) => (ruleCounts[rule] ?? 0) < max);
  if (errorCount < maxErrors || rulesUnderLimit.length > 0) {
    console.log("Dette en baisse : lancer `npm run lint:ratchet -- --update`.");
  }
}

if (failed) process.exit(1);
