/**
 * Hook PostToolUse (Edit/Write) : lance ESLint sur le fichier TS/JS qui vient d'être modifié
 * et renvoie ses erreurs à l'IA (contexte additionnel, non bloquant). Les warnings sont ignorés.
 * Le fichier peut contenir de la dette antérieure : le plafond global reste géré par npm run lint:ratchet.
 */
import { readFileSync } from "node:fs";
import { relative } from "node:path";
import { ESLint } from "eslint";

const input = JSON.parse(readFileSync(0, "utf-8"));
const filePath = String(input.tool_input?.file_path ?? "");
const projectDir = process.env.CLAUDE_PROJECT_DIR ?? process.cwd();
const relativePath = relative(projectDir, filePath);

if (!/\.(tsx?|m?js)$/.test(filePath) || relativePath.startsWith("..")) process.exit(0);

const eslint = new ESLint({ cwd: projectDir });
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
