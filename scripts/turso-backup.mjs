/**
 * Sauvegarde de la base Turso de prod sans la CLI turso (lecture seule : uniquement des SELECT).
 * 1. Dump SQL complet (schéma + données) dans backups/<date>.sql
 * 2. Test de restauration : rejoue le dump dans backups/<date>-restore.db et compare les comptes de lignes.
 * Usage (PowerShell) :
 *   $env:TURSO_DATABASE_URL="libsql://..."; $env:TURSO_AUTH_TOKEN="..."; node scripts/turso-backup.mjs
 */
import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url?.startsWith("libsql://")) {
  console.error("TURSO_DATABASE_URL (libsql://...) et TURSO_AUTH_TOKEN requis.");
  process.exit(1);
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const dumpFile = `backups/${stamp}.sql`;
const restoreFile = `backups/${stamp}-restore.db`;
mkdirSync("backups", { recursive: true });

function sqlValue(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number" || typeof value === "bigint") return String(value);
  if (value instanceof ArrayBuffer || ArrayBuffer.isView(value)) {
    return `X'${Buffer.from(value instanceof ArrayBuffer ? value : value.buffer).toString("hex")}'`;
  }
  return `'${String(value).replace(/'/g, "''")}'`;
}

const prod = createClient({ url, authToken });
try {
  await prod.execute("SELECT 1");
} catch {
  console.error(`Connexion impossible à ${url} : URL ou token invalide (token expiré, mauvaise base, ou valeurs d'exemple ?).`);
  process.exit(1);
}
const schema = await prod.execute(
  "SELECT type, name, sql FROM sqlite_master WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_litestream%' ORDER BY type = 'table' DESC, name"
);
const tables = schema.rows.filter((row) => row.type === "table").map((row) => String(row.name));

const lines = ["PRAGMA foreign_keys=OFF;", "BEGIN TRANSACTION;"];
const prodCounts = {};
for (const row of schema.rows.filter((r) => r.type === "table")) lines.push(`${row.sql};`);
for (const table of tables) {
  const data = await prod.execute(`SELECT * FROM "${table}"`);
  prodCounts[table] = data.rows.length;
  const columns = data.columns.map((column) => `"${column}"`).join(", ");
  for (const row of data.rows) {
    const values = data.columns.map((column) => sqlValue(row[column])).join(", ");
    lines.push(`INSERT INTO "${table}" (${columns}) VALUES (${values});`);
  }
}
for (const row of schema.rows.filter((r) => r.type !== "table")) lines.push(`${row.sql};`);
lines.push("COMMIT;");
writeFileSync(dumpFile, lines.join("\n") + "\n");
prod.close();
console.log(`Dump écrit : ${dumpFile} (${tables.length} tables)`);

const restored = createClient({ url: `file:${restoreFile}` });
await restored.executeMultiple(readFileSync(dumpFile, "utf-8"));
let mismatch = 0;
for (const table of tables) {
  const result = await restored.execute(`SELECT COUNT(*) AS n FROM "${table}"`);
  const count = Number(result.rows[0].n);
  if (count !== prodCounts[table]) {
    mismatch++;
    console.error(`  ✗ ${table} : prod ${prodCounts[table]} / restauré ${count}`);
  }
}
restored.close();

if (mismatch > 0) {
  console.error(`Restauration INCOMPLÈTE : ${mismatch} table(s) divergente(s).`);
  process.exit(1);
}
const total = Object.values(prodCounts).reduce((sum, n) => sum + n, 0);
console.log(`Restauration OK : ${tables.length} tables, ${total} lignes identiques (${restoreFile}).`);
