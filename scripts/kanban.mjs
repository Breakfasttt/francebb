/**
 * Vérifie le kanban et affiche un résumé (aucun fichier généré).
 * Le kanban est rangé en dossiers : le dossier d'une carte EST son statut.
 *   kanban/a-faire/   kanban/en-cours/   kanban/termine/   kanban/annule/   kanban/deprecie/
 * Contrôles : chaque carte est dans un dossier connu, son numéro (id) correspond au début du nom de fichier
 * et n'existe qu'une fois, son épic existe, ses dépendances existent, le champ verify est rempli.
 * Usage : pnpm kanban   (lancé aussi par la CI : échoue si une carte est mal rangée ou invalide)
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";

const FOLDERS = [
  ["en-cours", "En cours"],
  ["a-faire", "À faire"],
  ["termine", "Terminé"],
  ["deprecie", "Déprécié"],
  ["annule", "Annulé"],
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
const knownFolders = new Set(FOLDERS.map(([folder]) => folder));
for (const entry of readdirSync("kanban", { withFileTypes: true })) {
  if (entry.isDirectory() && !knownFolders.has(entry.name) && entry.name !== "epics") errors.push(`kanban/${entry.name}/ : dossier inconnu`);
  if (entry.isFile() && entry.name !== "README.md") errors.push(`kanban/${entry.name} : une carte doit être rangée dans un dossier d'état`);
}

const epicIds = new Set(
  readdirSync("kanban/epics")
    .filter((name) => /^E\d+-.*\.md$/.test(name))
    .map((name) => parseFrontmatter(`kanban/epics/${name}`)?.id)
);

const cards = [];
for (const [folder] of FOLDERS) {
  if (!existsSync(`kanban/${folder}`)) continue;
  for (const name of readdirSync(`kanban/${folder}`)) {
    if (name === "README.md") continue;
    if (!/^\d{3}-.*\.md$/.test(name)) {
      errors.push(`kanban/${folder}/${name} : nom attendu NNN-titre.md`);
      continue;
    }
    const data = parseFrontmatter(`kanban/${folder}/${name}`);
    if (!data) errors.push(`kanban/${folder}/${name} : en-tête (frontmatter) absent`);
    cards.push({ folder, file: name, ...data });
  }
}

const ids = new Set();
for (const card of cards) {
  const where = `kanban/${card.folder}/${card.file}`;
  if (card.id !== card.file.slice(0, 3)) errors.push(`${where} : id « ${card.id} » différent du début du nom de fichier`);
  if (ids.has(card.id)) errors.push(`${where} : numéro ${card.id} déjà utilisé`);
  ids.add(card.id);
  if (card.status !== undefined) errors.push(`${where} : champ status interdit (le dossier donne le statut)`);
  if (card.epic && !epicIds.has(card.epic)) errors.push(`${where} : épic inconnue « ${card.epic} »`);
  if (!card.verify) errors.push(`${where} : champ verify vide`);
  if (!Array.isArray(card.depends_on)) errors.push(`${where} : depends_on doit être une liste ([] si aucune)`);
}
for (const card of cards) {
  for (const dep of card.depends_on ?? []) if (!ids.has(dep)) errors.push(`kanban/${card.folder}/${card.file} : dépendance inconnue ${dep}`);
}

if (errors.length > 0) {
  console.error(`Kanban invalide :\n  ${errors.join("\n  ")}`);
  process.exit(1);
}

for (const [folder, label] of FOLDERS) {
  const list = cards.filter((card) => card.folder === folder);
  if (folder === "termine" || folder === "annule" || folder === "deprecie") {
    console.log(`${label} : ${list.length} carte(s)`);
    continue;
  }
  console.log(`${label} (${list.length})`);
  for (const card of list) console.log(`  ${card.id}  ${card.title}`);
}
