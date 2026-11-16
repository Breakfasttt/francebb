/**
 * Liste les cartes du kanban (gros chantiers) et vérifie leurs numéros.
 * Le dossier d'une carte est son état : kanban/a-faire/ ou kanban/en-cours/.
 * Les cartes terminées ou abandonnées sont dans archive/kanban/ : leurs numéros comptent pour l'unicité.
 * Contrôles : nom NNN-titre.md, en-tête avec un id égal au début du nom, numéro unique.
 * Usage : pnpm kanban
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const FOLDERS = [
  ["en-cours", "En cours"],
  ["a-faire", "À faire"],
];

function frontmatter(path) {
  const content = readFileSync(path, "utf-8").replace(/\r\n/g, "\n");
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const data = {};
  for (const line of match[1].split("\n")) {
    const pair = line.match(/^(\w+):\s*(.*)$/);
    if (pair) data[pair[1]] = pair[2].trim().replace(/^"(.*)"$/, "$1");
  }
  return data;
}

// Numéros déjà pris dans les archives (tous sous-dossiers)
function archivedIds(dir) {
  if (!existsSync(dir)) return [];
  const ids = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) ids.push(...archivedIds(join(dir, entry.name)));
    else if (/^\d{3}-.*\.md$/.test(entry.name)) ids.push(entry.name.slice(0, 3));
  }
  return ids;
}

const errors = [];
const cards = [];
for (const [folder] of FOLDERS) {
  const dir = `kanban/${folder}`;
  if (!existsSync(dir)) continue;
  for (const name of readdirSync(dir)) {
    if (name === "README.md") continue;
    const where = `${dir}/${name}`;
    if (!/^\d{3}-.*\.md$/.test(name)) {
      errors.push(`${where} : nom attendu NNN-titre.md`);
      continue;
    }
    const data = frontmatter(where);
    if (!data) errors.push(`${where} : en-tête (frontmatter) absent`);
    else if (data.id !== name.slice(0, 3)) errors.push(`${where} : id « ${data.id} » différent du début du nom`);
    cards.push({ folder, id: name.slice(0, 3), title: data?.title ?? name });
  }
}

const seen = new Set(archivedIds("archive/kanban"));
for (const card of cards) {
  if (seen.has(card.id)) errors.push(`carte ${card.id} : numéro déjà utilisé`);
  seen.add(card.id);
}

if (errors.length > 0) {
  console.error(`Kanban invalide :\n  ${errors.join("\n  ")}`);
  process.exit(1);
}

for (const [folder, label] of FOLDERS) {
  const list = cards.filter((card) => card.folder === folder);
  console.log(`${label} (${list.length})`);
  for (const card of list) console.log(`  ${card.id}  ${card.title}`);
}
const next = String(Math.max(0, ...[...seen].map(Number)) + 1).padStart(3, "0");
console.log(`Prochain numéro libre : ${next}`);
