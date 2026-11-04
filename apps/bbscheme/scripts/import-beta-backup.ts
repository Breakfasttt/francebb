/**
 * Reprise des schémas BBScheme de la bêta (carte 179, suite de la carte 178).
 *
 * Copie les schémas tactiques (table BBSchemeState) de l'ancienne production, sauvegarde SQLite du 4 novembre 2026,
 * dans la base Postgres de l'application BBScheme désignée par `BBSCHEME_DATABASE_URL`. Script ponctuel : à supprimer
 * après la reprise en production.
 *
 * Usage, depuis le dossier apps/bbscheme :
 *   BBSCHEME_DATABASE_URL="<adresse de la base cible>" npx tsx scripts/import-beta-backup.ts <chemin du fichier .db>
 * En local, l'adresse de la base est donnée par `node ../../scripts/local-postgres.mjs url bbscheme`.
 *
 * Fonctionnement :
 * - La sauvegarde est ouverte en lecture seule avec le module SQLite intégré à Node (`node:sqlite`, Node 22.13 ou plus
 *   récent), sans bibliothèque à installer. Elle n'est jamais modifiée.
 * - La base cible doit être à jour de ses migrations (`npx prisma migrate deploy`).
 * - Chaque schéma garde son identifiant d'origine, pour que les balises [bbscheme] des messages le retrouvent. Un
 *   schéma absent est créé, un schéma présent est mis à jour si ses valeurs diffèrent. Le script peut donc être relancé
 *   sans créer de doublon, et il ne supprime jamais rien.
 * - Un schéma déjà en base sous la même empreinte (hash) mais avec un autre identifiant est gardé tel quel : la ligne
 *   de la sauvegarde est comptée comme ignorée.
 * - Le créateur (`creatorId`) est un simple identifiant de membre du site, gardé tel quel. Il est vidé s'il ne
 *   correspond à aucun membre de la sauvegarde.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated-client";

// Types minimaux du module `node:sqlite` : les types de Node installés dans le projet (version 20) ne le décrivent pas.
type SqliteValue = string | number | bigint | null | Uint8Array;
type SqliteRow = Record<string, SqliteValue>;
interface SqliteDatabase {
  prepare(sql: string): { all(): SqliteRow[] };
  close(): void;
}
interface SqliteModule {
  DatabaseSync: new (path: string, options: { readOnly: boolean }) => SqliteDatabase;
}

function openBackup(path: string): SqliteDatabase {
  const sqlite = process.getBuiltinModule("node:sqlite") as SqliteModule | undefined;
  if (!sqlite) throw new Error("Le module node:sqlite est absent : il faut Node 22.13 ou plus récent.");
  return new sqlite.DatabaseSync(path, { readOnly: true });
}

function text(row: SqliteRow, column: string): string {
  const value = row[column];
  if (typeof value !== "string") throw new Error(`Colonne ${column} : texte attendu, reçu ${String(value)}`);
  return value;
}

/**
 * Prisma range les dates SQLite soit en texte (« 2026-04-21T21:26:16.842+00:00 »), soit en millisecondes depuis le
 * 1er janvier 1970. Une date écrite par SQLite lui-même (« 2026-04-21 21:26:16 ») est en temps universel.
 */
function date(row: SqliteRow, column: string): Date {
  const value = row[column];
  if (value === null || value === undefined) throw new Error(`Colonne ${column} : date attendue, valeur vide`);
  let result: Date;
  if (typeof value === "number" || typeof value === "bigint" || /^\d+$/.test(String(value))) result = new Date(Number(value));
  else {
    const raw = String(value);
    const hasZone = /(Z|[+-]\d{2}:?\d{2})$/.test(raw);
    result = new Date(hasZone ? raw : `${raw.replace(" ", "T")}Z`);
  }
  if (Number.isNaN(result.getTime())) throw new Error(`Colonne ${column} : date illisible ${String(value)}`);
  return result;
}

async function main() {
  const backupPath = process.argv[2];
  const databaseUrl = process.env.BBSCHEME_DATABASE_URL;
  if (!backupPath || !databaseUrl) {
    console.error('Usage : BBSCHEME_DATABASE_URL="<adresse de la base cible>" npx tsx scripts/import-beta-backup.ts <fichier .db>');
    process.exit(1);
  }

  const backup = openBackup(backupPath);
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
  console.log(`Base cible : ${new URL(databaseUrl).host}`);

  const counts = { read: 0, created: 0, updated: 0, unchanged: 0, ignored: 0, creatorCleared: 0 };
  try {
    const members = new Set(backup.prepare(`SELECT "id" FROM "User"`).all().map((row) => text(row, "id")));
    for (const row of backup.prepare(`SELECT * FROM "BBSchemeState"`).all()) {
      counts.read++;
      const id = text(row, "id");
      let creatorId = row.creatorId === null || row.creatorId === undefined ? null : String(row.creatorId);
      if (creatorId && !members.has(creatorId)) {
        creatorId = null;
        counts.creatorCleared++;
      }
      const data = { hash: text(row, "hash"), data: text(row, "data"), creatorId, createdAt: date(row, "createdAt") };

      const sameHash = await prisma.bBSchemeState.findUnique({ where: { hash: data.hash } });
      if (sameHash && sameHash.id !== id) {
        counts.ignored++;
        continue;
      }
      if (!sameHash) {
        await prisma.bBSchemeState.create({ data: { id, ...data } });
        counts.created++;
      } else if (
        sameHash.data !== data.data ||
        sameHash.creatorId !== data.creatorId ||
        sameHash.createdAt.getTime() !== data.createdAt.getTime()
      ) {
        await prisma.bBSchemeState.update({ where: { id }, data });
        counts.updated++;
      } else {
        counts.unchanged++;
      }
    }

    const total = await prisma.bBSchemeState.count();
    console.log(
      `\nSchémas de la sauvegarde : ${counts.read} lus, ${counts.created} créés, ${counts.updated} mis à jour, ` +
        `${counts.unchanged} inchangés, ${counts.ignored} ignorés (déjà en base sous un autre identifiant).`,
    );
    if (counts.creatorCleared > 0) console.log(`Note : ${counts.creatorCleared} créateur(s) inconnu(s) de la sauvegarde, champ creatorId vidé.`);
    console.log(`Base BBScheme : ${total} schémas au total.`);
  } finally {
    backup.close();
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("La reprise a échoué :", error);
  process.exit(1);
});
