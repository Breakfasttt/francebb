/**
 * Hook PostToolUse (Edit/Write) : lance ESLint sur le fichier TS/JS qui vient d'être modifié
 * et renvoie ses erreurs à l'IA (contexte additionnel, non bloquant). Les warnings sont ignorés.
 * Monorepo : utilise l'ESLint et la config de l'app/package qui contient le fichier (eslint.config.mjs le plus proche).
 * Le fichier peut contenir de la dette antérieure : le plafond global reste géré par le cliquet (lint:ratchet).
 */
import { readFileSync, existsSync } from "node:fs";
import { relative, dirname, join } from "node:path";
import { createRequire } from "node:module";

const input = JSON.parse(readFileSync(0, "utf-8"));
const filePath = String(input.tool_input?.file_path ?? "");
const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const relativePath = relative(projectDir, filePath);

if (!/\.(tsx?|m?js)$/.test(filePath) || relativePath.startsWith("..")) process.exit(0);

let appDir = dirname(filePath);
while (!existsSync(join(appDir, "eslint.config.mjs"))) {
  const parent = dirname(appDir);
  if (parent === appDir || relative(projectDir, parent).startsWith("..")) process.exit(0);
  appDir = parent;
}

const { ESLint } = createRequire(join(appDir, "package.json"))("eslint");
const eslint = new ESLint({ cwd: appDir });
if (await eslint.isPathIgnored(filePath)) process.exit(0);

const [result] = await eslint.lintFiles([filePath]);
const errors = (result?.messages ?? []).filter((message) => message.severity === 2);
if (errors.length === 0) process.exit(0);

const lines = errors.slice(0, 10).map((error) => `  ${relativePath}:${error.line}:${error.column} ${error.message} (${error.ruleId ?? "parse"})`);
if (errors.length > 10) lines.push(`  … et ${errors.length - 10} autres`);
console.log(
  JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: `ESLint : ${errors.length} erreur(s) dans ${relativePath}. Corriger celles introduites par la modification (ne pas augmenter la dette) :\n${lines.join("\n")}`,
    },
  })
);
process.exit(0);
