/**
 * Génère kanban/BOARD.md à partir du frontmatter des cartes (kanban/NNN-*.md) et des épics (kanban/epics/).
 * Valide au passage : ids uniques = préfixe du fichier, statut connu, épic existante, dépendances existantes, verify présent.
 * Usage : node scripts/board.mjs           → écrit BOARD.md
 *         node scripts/board.mjs --check   → échoue si BOARD.md n'est pas à jour ou si une carte est invalide (CI)
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";

const BOARD_FILE = "kanban/BOARD.md";
const STATUSES = [
  ["in_progress", "En cours"],
  ["ready", "Prêtes"],
  ["refine", "À raffiner"],
  ["done", "Terminées"],
  ["cancelled", "Annulées"],
];

function parseFrontmatter(path) {
  const content = readFileSync(path, "utf-8").replace(/\r\n/g, "\n");
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const data = {};
  for (const line of match[1].split("\n")) {
    const pair = line.match(/^(\w+):\s*(.*)$/);
    if (!pair) continue;
    const raw = pair[2].trim();
    data[pair[1]] = raw.startsWith("[")
      ? raw.slice(1, -1).split(",").map((item) => item.trim()).filter(Boolean)
      : raw;
  }
  return data;
}

const errors = [];
const epics = readdirSync("kanban/epics")
  .filter((name) => /^E\d+-.*\.md$/.test(name))
  .map((name) => ({ file: name, ...parseFrontmatter(`kanban/epics/${name}`) }));
const epicIds = new Set(epics.map((epic) => epic.id));

const cards = readdirSync("kanban")
  .filter((name) => /^\d{3}-.*\.md$/.test(name))
  .map((name) => {
    const data = parseFrontmatter(`kanban/${name}`);
    if (!data) errors.push(`${name} : frontmatter absent`);
    return { file: name, ...data };
  });

const cardIds = new Set();
for (const card of cards) {
  if (card.id !== card.file.slice(0, 3)) errors.push(`${card.file} : id « ${card.id} » ≠ préfixe du fichier`);
  if (cardIds.has(card.id)) errors.push(`${card.file} : id ${card.id} en double`);
  cardIds.add(card.id);
  if (!STATUSES.some(([status]) => status === card.status)) errors.push(`${card.file} : statut inconnu « ${card.status} »`);
  if (card.epic && !epicIds.has(card.epic)) errors.push(`${card.file} : épic inconnue « ${card.epic} »`);
  if (!card.verify) errors.push(`${card.file} : champ verify vide`);
  if (!Array.isArray(card.depends_on)) errors.push(`${card.file} : depends_on doit être une liste ([] si aucune)`);
}
for (const card of cards) {
  for (const dep of card.depends_on ?? []) if (!cardIds.has(dep)) errors.push(`${card.file} : dépendance inconnue ${dep}`);
}

if (errors.length > 0) {
  console.error(`Cartes invalides :\n  ${errors.join("\n  ")}`);
  process.exit(1);
}

const byId = new Map(cards.map((card) => [card.id, card]));
const blocked = (card) => (card.depends_on ?? []).filter((dep) => byId.get(dep)?.status !== "done");
const link = (card) => `[${card.id}](${card.file})`;

const lines = ["# Board", "", "> Généré par `npm run board` depuis le frontmatter des cartes — ne pas éditer.", "", "## Épics", ""];
lines.push("| Épic | Phase | Avancement | Cartes ouvertes |", "|---|---|---|---|");
for (const epic of epics) {
  const epicCards = cards.filter((card) => card.epic === epic.id && card.status !== "cancelled");
  const done = epicCards.filter((card) => card.status === "done").length;
  const open = epicCards.filter((card) => card.status !== "done").map(link).join(" ") || "—";
  lines.push(`| [${epic.id} — ${epic.title}](epics/${epic.file}) | ${epic.phase} | ${done}/${epicCards.length} | ${open} |`);
}

for (const [status, label] of STATUSES) {
  const group = cards.filter((card) => card.status === status);
  if (group.length === 0) continue;
  lines.push("", `## ${label} (${group.length})`, "", "| Carte | Titre | Épic | Bloquée par | ADR |", "|---|---|---|---|---|");
  for (const card of group) {
    const waiting = status === "done" || status === "cancelled" ? "" : blocked(card).join(", ");
    lines.push(`| ${link(card)} | ${card.title} | ${card.epic || "—"} | ${waiting || "—"} | ${card.adr || "—"} |`);
  }
}
const board = lines.join("\n") + "\n";

if (process.argv.includes("--check")) {
  const current = existsSync(BOARD_FILE) ? readFileSync(BOARD_FILE, "utf-8").replace(/\r\n/g, "\n") : "";
  if (current !== board) {
    console.error(`${BOARD_FILE} n'est pas à jour : lancer npm run board et commiter le résultat.`);
    process.exit(1);
  }
  console.log(`${BOARD_FILE} à jour (${cards.length} cartes).`);
} else {
  writeFileSync(BOARD_FILE, board);
  console.log(`${BOARD_FILE} généré (${cards.length} cartes, ${epics.length} épics).`);
}
