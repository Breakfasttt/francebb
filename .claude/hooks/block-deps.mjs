/**
 * Hook PreToolUse (Bash/PowerShell) : toute commande qui ajoute une dépendance npm/pnpm/yarn
 * déclenche une demande de confirmation au user (règle projet : pas de dépendance sans accord + ADR).
 * `npm install` / `npm ci` sans nom de paquet (réinstallation) passent sans question.
 */
import { readFileSync } from "node:fs";

const input = JSON.parse(readFileSync(0, "utf-8"));
const command = String(input.tool_input?.command ?? "");

// npm i|install|add <pkg>, pnpm add <pkg>, yarn add <pkg>, pnpm/npm install <pkg>
const ADD_PATTERN = /\b(npm|pnpm|yarn)\s+(i|install|add)\b([^;&|\n]*)/g;
const added = [];
for (const match of command.matchAll(ADD_PATTERN)) {
  const packages = match[3].trim().split(/\s+/).filter((arg) => arg && !arg.startsWith("-"));
  added.push(...packages);
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
