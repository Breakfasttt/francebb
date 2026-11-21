/**
 * Hook PreToolUse (Bash/PowerShell) : toute commande qui ajoute une dépendance npm/pnpm/yarn
 * déclenche une demande de confirmation au user (règle projet : pas de dépendance sans accord + ADR).
 * `npm install` / `npm ci` sans nom de paquet (réinstallation) passent sans question.
 */
import { readFileSync } from "node:fs";

const input = JSON.parse(readFileSync(0, "utf-8"));
const toolInput = input.tool_input ?? {};
const added = [];

if (typeof toolInput.command === "string") {
  // npm i|install|add <pkg>, pnpm add <pkg>, yarn add <pkg>, pnpm/npm install <pkg>
  // Arguments lus jusqu'au premier séparateur ou redirection : `2>&1` ou `> fichier` ne sont pas des noms de paquets
  const ADD_PATTERN = /\b(npm|pnpm|yarn)\s+(i|install|add)\b([^;&|\n<>]*)/g;
  for (const match of toolInput.command.matchAll(ADD_PATTERN)) {
    const packages = match[3].trim().split(/\s+/).filter((arg) => arg && !arg.startsWith("-") && !/^\d$/.test(arg));
    added.push(...packages);
  }
} else if (/package\.json$/.test(String(toolInput.file_path ?? ""))) {
  // Edit/Write direct d'un package.json : nouveaux noms de paquets dans le texte écrit
  const PKG_LINE = /"(@?[\w./-]+)"\s*:\s*"(?:\^|~)?(?:\d|workspace:|npm:|github:)/g;
  const names = (text) => new Set([...String(text ?? "").matchAll(PKG_LINE)].map((m) => m[1]));
  const before = names(toolInput.old_string);
  const after = names(toolInput.new_string ?? toolInput.content);
  for (const name of after) if (!before.has(name) && name !== "version") added.push(name);
}

if (added.length > 0) {
  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "ask",
        permissionDecisionReason: `Ajout de dépendance (${added.join(", ")}) : accord du user + ADR requis (règle reuse-first, voir ARCHITECTURE.md).`,
      },
    })
  );
}
process.exit(0);
