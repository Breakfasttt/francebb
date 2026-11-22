/**
 * Sauvegardes de la base du site au format JSON (carte 219).
 *
 * Usage, depuis apps/site :
 *   npx tsx scripts/site-backup.ts convert <ancienne sauvegarde .db>   convertit une sauvegarde SQLite de la bêta
 *   npx tsx scripts/site-backup.ts export <fichier .json>             exporte la base DATABASE_URL (lecture seule)
 *   npx tsx scripts/site-backup.ts restore <fichier .json>            restaure dans la base locale vide DATABASE_URL
 *
 * Format : `bbfrance-site-backup-AAAAMMJJ.json`, un objet { format, version, createdAt, source, migration, tables }.
 * `migration` est la dernière migration appliquée à la base exportée ; `tables` donne, par table Postgres, la liste
 * de ses lignes (colonnes générées exclues, comme `searchVector`). Le fichier contient des données personnelles :
 * il reste dans docs/backup-db, jamais dans git (`*.json` de ce dossier ignoré).
 *
 * Restauration : la base vide reçoit les migrations jusqu'à celle de la sauvegarde, puis les lignes, puis les
 * migrations plus récentes. Une sauvegarde ancienne passe donc par les mêmes transformations que la production
 * (thèmes, non-lus du forum…). Les clés étrangères ne sont pas vérifiées pendant la copie, l'ordre des tables
 * n'importe pas ; une migration qui ajoute ensuite une clé étrangère la vérifie, elle.
 *
 * Conversion : la structure de la bêta (SQLite, arrêtée le 4 novembre 2026) est celle de la migration `0_init`.
 * Une base locale temporaire (`import-test`) reçoit `0_init`, les lignes de la bêta (colonnes communes, valeurs
 * converties selon le type Postgres), puis les migrations suivantes ; elle est ensuite exportée à côté de
 * l'ancienne sauvegarde, qui n'est ni modifiée ni supprimée. Les tables du quiz et de BBScheme, supprimées du site
 * par leurs migrations, ne sont pas dans le résultat (BBScheme a son propre script dans apps/bbscheme ; le quiz a été abandonné).
 */
import { execSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated-client";
import { freshLocalDatabase, stopLocalDatabase } from "../../../scripts/local-postgres.mjs";

const FORMAT = "bbfrance-site-backup";
const VERSION = 1;
const SITE_DIR = join(import.meta.dirname, "..");
const MIGRATIONS_DIR = join(SITE_DIR, "prisma", "migrations");
/** Migration dont la structure est celle de la bêta. */
const BETA_MIGRATION = "0_init";

type Row = Record<string, unknown>;
interface Backup {
  format: string;
  version: number;
  createdAt: string;
  source: string;
  migration: string;
  tables: Record<string, Row[]>;
}
interface Column {
  table: string;
  column: string;
  type: string;
}

// --- Base Postgres -----------------------------------------------------------------------------------------------------

function client(url: string) {
  return new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
}

function prismaCli(args: string, url: string) {
  execSync(`npx prisma ${args}`, { cwd: SITE_DIR, stdio: ["ignore", "ignore", "inherit"], env: { ...process.env, DATABASE_URL: url } });
}

function migrationNames(): string[] {
  return readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

/** Applique les migrations jusqu'à `last` comprise, et les note comme appliquées pour `prisma migrate deploy`. */
function applyMigrationsUpTo(last: string, url: string) {
  const names = migrationNames();
  if (!names.includes(last)) throw new Error(`Migration « ${last} » introuvable dans prisma/migrations.`);
  for (const name of names.slice(0, names.indexOf(last) + 1)) {
    prismaCli(`db execute --file "${join(MIGRATIONS_DIR, name, "migration.sql")}"`, url);
    prismaCli(`migrate resolve --applied ${name}`, url);
  }
}

/** Colonnes écrivables des tables du site (colonnes générées et table des migrations exclues). */
async function columns(prisma: PrismaClient): Promise<Map<string, Column[]>> {
  const rows = await prisma.$queryRaw<{ table_name: string; column_name: string; data_type: string }[]>`
    SELECT table_name, column_name, data_type FROM information_schema.columns
    WHERE table_schema = 'public' AND is_generated = 'NEVER' AND table_name <> '_prisma_migrations'
    ORDER BY table_name, ordinal_position`;
  const byTable = new Map<string, Column[]>();
  for (const row of rows) {
    const list = byTable.get(row.table_name) ?? [];
    list.push({ table: row.table_name, column: row.column_name, type: row.data_type });
    byTable.set(row.table_name, list);
  }
  return byTable;
}

async function lastAppliedMigration(prisma: PrismaClient): Promise<string> {
  const rows = await prisma.$queryRaw<{ migration_name: string }[]>`
    SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NOT NULL ORDER BY migration_name DESC LIMIT 1`;
  if (!rows[0]) throw new Error("Aucune migration appliquée dans cette base.");
  return rows[0].migration_name;
}

const quote = (name: string) => `"${name.replaceAll('"', '""')}"`;

/** Copie les lignes, sans vérifier les clés étrangères pendant la copie (rôle de réplication, base locale). */
async function insertTables(prisma: PrismaClient, tables: Record<string, Row[]>) {
  const known = await columns(prisma);
  await prisma.$transaction(
    async (tx) => {
      await tx.$executeRawUnsafe("SET LOCAL session_replication_role = replica");
      for (const [table, rows] of Object.entries(tables)) {
        const tableColumns = known.get(table);
        if (!tableColumns) throw new Error(`Table « ${table} » absente de la base cible.`);
        if (rows.length === 0) continue;
        const list = tableColumns.map((c) => quote(c.column)).join(", ");
        await tx.$executeRawUnsafe(
          `INSERT INTO ${quote(table)} (${list}) SELECT ${list} FROM json_populate_recordset(NULL::${quote(table)}, $1::json)`,
          JSON.stringify(rows),
        );
      }
    },
    { timeout: 120_000 },
  );
}

async function exportTables(prisma: PrismaClient): Promise<Record<string, Row[]>> {
  const tables: Record<string, Row[]> = {};
  for (const [table, tableColumns] of await columns(prisma)) {
    const list = tableColumns.map((c) => quote(c.column)).join(", ");
    const result = await prisma.$queryRawUnsafe<{ rows: Row[] | null }[]>(
      `SELECT json_agg(row_to_json(t)) AS rows FROM (SELECT ${list} FROM ${quote(table)} ORDER BY 1) t`,
    );
    tables[table] = result[0]?.rows ?? [];
  }
  return tables;
}

function assertLocal(url: string | undefined): string {
  if (!url) throw new Error("DATABASE_URL absente.");
  const host = new URL(url).hostname;
  if (host !== "localhost" && host !== "127.0.0.1") {
    throw new Error(`Restauration refusée : « ${host} » n'est pas une base locale. Elle ne vise jamais la production.`);
  }
  return url;
}

function summary(tables: Record<string, Row[]>) {
  return Object.entries(tables)
    .filter(([, rows]) => rows.length > 0)
    .map(([table, rows]) => `${table} ${rows.length}`)
    .join(", ");
}

// --- Commandes ---------------------------------------------------------------------------------------------------------

async function exportCommand(url: string, outFile: string, source: string) {
  const prisma = client(url);
  try {
    const backup: Backup = {
      format: FORMAT,
      version: VERSION,
      createdAt: new Date().toISOString(),
      source,
      migration: await lastAppliedMigration(prisma),
      tables: await exportTables(prisma),
    };
    writeFileSync(outFile, `${JSON.stringify(backup, null, 1)}\n`);
    console.log(`Sauvegarde écrite : ${outFile}\n  ${summary(backup.tables)}`);
  } finally {
    await prisma.$disconnect();
  }
}

async function restoreCommand(url: string, file: string) {
  const backup = JSON.parse(readFileSync(file, "utf-8")) as Backup;
  if (backup.format !== FORMAT || backup.version !== VERSION) throw new Error(`${file} n'est pas une sauvegarde ${FORMAT} v${VERSION}.`);
  const prisma = client(url);
  try {
    const existing = await prisma.$queryRaw<{ n: number }[]>`
      SELECT COUNT(*)::int AS n FROM information_schema.tables WHERE table_schema = 'public'`;
    if (existing[0].n > 0) throw new Error("Restauration refusée : la base n'est pas vide (elle doit être neuve).");
    applyMigrationsUpTo(backup.migration, url);
    await insertTables(prisma, backup.tables);
  } finally {
    await prisma.$disconnect();
  }
  prismaCli("migrate deploy", url);
  console.log(`Sauvegarde restaurée : ${basename(file)}\n  ${summary(backup.tables)}`);
}

// Lecture de l'ancienne sauvegarde SQLite (module intégré à Node, comme scripts/import-beta-backup.ts)
type SqliteRow = Record<string, string | number | bigint | null | Uint8Array>;
interface SqliteDatabase {
  prepare(sql: string): { all(): SqliteRow[] };
  close(): void;
}
interface SqliteModule {
  DatabaseSync: new (path: string, options: { readOnly: boolean }) => SqliteDatabase;
}

/**
 * Date d'une colonne SQLite, copiée de scripts/import-beta-backup.ts : Prisma range les dates SQLite soit en texte
 * (« 2026-04-21T21:26:16.842+00:00 »), soit en millisecondes ; une date écrite par SQLite lui-même est en temps universel.
 */
function sqliteDate(value: string | number | bigint, column: string): string {
  let date: Date;
  if (typeof value === "number" || typeof value === "bigint") date = new Date(Number(value));
  else if (/^\d+$/.test(value)) date = new Date(Number(value));
  else {
    const hasZone = /(Z|[+-]\d{2}:?\d{2})$/.test(value);
    date = new Date(hasZone ? value : `${value.replace(" ", "T")}Z`);
  }
  if (Number.isNaN(date.getTime())) throw new Error(`Colonne ${column} : date illisible ${String(value)}`);
  return date.toISOString();
}

function convertValue(value: SqliteRow[string], column: Column): unknown {
  if (value === null || value === undefined) return null;
  if (value instanceof Uint8Array) throw new Error(`${column.table}.${column.column} : donnée binaire non prise en charge.`);
  const name = `${column.table}.${column.column}`;
  switch (column.type) {
    case "boolean":
      return typeof value === "string" ? value === "1" || value === "true" : Number(value) === 1;
    case "timestamp without time zone":
      return sqliteDate(value, name);
    case "integer":
    case "double precision":
      return Number(value);
    case "ARRAY":
      return typeof value === "string" ? JSON.parse(value) : value;
    default:
      return typeof value === "bigint" ? Number(value) : value;
  }
}

async function convertCommand(dbFile: string) {
  const date = basename(dbFile).match(/\d{8}/)?.[0];
  if (!date) throw new Error(`Date AAAAMMJJ introuvable dans le nom « ${basename(dbFile)} ».`);
  const outFile = join(dirname(dbFile), `${FORMAT}-${date}.json`);

  const sqlite = process.getBuiltinModule("node:sqlite") as SqliteModule | undefined;
  if (!sqlite) throw new Error("Le module node:sqlite est absent : il faut Node 22.13 ou plus récent.");
  const beta = new sqlite.DatabaseSync(dbFile, { readOnly: true });

  console.log(`Conversion de ${basename(dbFile)} (base temporaire import-test)...`);
  const url = freshLocalDatabase("import-test");
  const prisma = client(url);
  try {
    applyMigrationsUpTo(BETA_MIGRATION, url);
    const betaTables = new Set(beta.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map((r) => String(r.name)));
    const tables: Record<string, Row[]> = {};
    for (const [table, tableColumns] of await columns(prisma)) {
      if (!betaTables.has(table)) continue;
      const betaColumns = new Set(beta.prepare(`PRAGMA table_info(${quote(table)})`).all().map((r) => String(r.name)));
      const common = tableColumns.filter((c) => betaColumns.has(c.column));
      tables[table] = beta
        .prepare(`SELECT * FROM ${quote(table)}`)
        .all()
        .map((row) => Object.fromEntries(common.map((c) => [c.column, convertValue(row[c.column], c)])));
    }
    await insertTables(prisma, tables);
  } finally {
    beta.close();
    await prisma.$disconnect();
  }
  prismaCli("migrate deploy", url);
  await exportCommand(url, outFile, basename(dbFile));
  stopLocalDatabase("import-test");
}

async function main() {
  const [command, file] = process.argv.slice(2);
  if (!file) throw new Error("Usage : site-backup.ts convert <fichier .db> | export <fichier .json> | restore <fichier .json>");
  if (command === "convert") await convertCommand(file);
  else if (command === "export") {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL absente.");
    await exportCommand(process.env.DATABASE_URL, file, new URL(process.env.DATABASE_URL).hostname);
  } else if (command === "restore") await restoreCommand(assertLocal(process.env.DATABASE_URL), file);
  else throw new Error(`Commande inconnue : ${command}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
