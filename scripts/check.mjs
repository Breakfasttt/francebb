/**
 * Vérification rapide du code (niveau 1 des tests, carte 157) : `pnpm check` à la racine du dépôt.
 * Pas de serveur ni de navigateur : on vérifie seulement que le code est correct, en une minute environ.
 * - Vérification des types TypeScript (`tsc --noEmit`) dans chaque application et chaque paquet, en même temps ;
 * - les tests unitaires du site (`pnpm test:unit` dans apps/site : fonctions isolées comme le moteur BBCode, sans navigateur) ;
 * - puis le cliquet ESLint (apps/site/scripts/lint-ratchet.mjs : le nombre d'erreurs ne doit pas dépasser son plafond).
 * À lancer pendant le développement, à chaque étape. Les tests du site dans un navigateur se lancent à part :
 * `pnpm test:parcours` en fin de carte (niveau 2), `pnpm test:e2e` seulement à la demande (niveau 3).
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const TYPED = ["apps/site", "apps/hub", "packages/ui", "packages/bbscheme-player"];

/** Lance une commande dans un dossier ; renvoie son code de sortie, sa sortie et sa durée. */
function run(label, command, cwd) {
  const start = Date.now();
  return new Promise((resolve) => {
    // shell: true pour trouver npx et node sous Windows comme sous Linux
    const child = spawn(command, { cwd: path.join(ROOT, cwd), shell: true });
    let output = "";
    child.stdout.on("data", (chunk) => { output += chunk; });
    child.stderr.on("data", (chunk) => { output += chunk; });
    child.on("close", (code) => resolve({ label, code, output, seconds: ((Date.now() - start) / 1000).toFixed(0) }));
  });
}

function report({ label, code, output, seconds }) {
  console.log(`${code === 0 ? "OK    " : "ÉCHEC "} ${label} (${seconds} s)`);
  if (code !== 0) console.log(output.trim().split("\n").map((line) => `       ${line}`).join("\n"));
}

const start = Date.now();
const types = await Promise.all(TYPED.map((dir) => run(`types ${dir}`, "npx tsc --noEmit", dir)));
types.forEach(report);
const unit = await run("tests unitaires apps/site", "node --experimental-strip-types --no-warnings --test tests/unit/*.test.mjs", "apps/site");
report(unit);
const lint = await run("ESLint (cliquet)", "node scripts/lint-ratchet.mjs", "apps/site");
report(lint);

const failed = [...types, unit, lint].filter((result) => result.code !== 0);
console.log(`\n${failed.length === 0 ? "Tout est correct" : `${failed.length} vérification(s) en échec`} — ${((Date.now() - start) / 1000).toFixed(0)} s au total.`);
process.exit(failed.length === 0 ? 0 : 1);
