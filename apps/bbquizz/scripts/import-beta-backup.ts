/**
 * Reprise des données du quiz de la bêta (carte 180, suite de la carte 178).
 *
 * Copie les données du quiz de l'ancienne production, sauvegarde SQLite du 4 novembre 2026, dans la base Postgres de
 * l'application BBQuizz désignée par `BBQUIZZ_DATABASE_URL`. Script ponctuel : à supprimer après la reprise en
 * production.
 *
 * Usage, depuis le dossier apps/bbquizz :
 *   BBQUIZZ_DATABASE_URL="<adresse de la base cible>" npx tsx scripts/import-beta-backup.ts <chemin du fichier .db>
 * En local, l'adresse de la base est donnée par `node ../../scripts/local-postgres.mjs url bbquizz`.
 *
 * Ce qui est repris :
 * - les questions (QuizQuestion), avec leurs compteurs de réponses ;
 * - les parties terminées (QuizAttempt), les gagnants du jour (QuizDailyWinner) et les questions proposées en attente
 *   (QuizQuestionSuggestion) ; les parties en cours (QuizGame) ne sont pas reprises : elles n'ont pas de sens après
 *   une interruption, et la sauvegarde n'a pas cette table ;
 * - les scores des joueurs, rangés sur la fiche des membres dans la sauvegarde (colonnes quizTotalScore,
 *   quizBestScore, quizStreak, quizAttemptsCount), dans la table QuizPlayerStats : une ligne par membre dont au moins
 *   une de ces valeurs n'est pas nulle.
 *
 * Fonctionnement :
 * - La sauvegarde est ouverte en lecture seule avec le module SQLite intégré à Node (`node:sqlite`, Node 22.13 ou plus
 *   récent), sans bibliothèque à installer. Elle n'est jamais modifiée.
 * - La base cible doit être à jour de ses migrations (`npx prisma migrate deploy`).
 * - Chaque ligne garde son identifiant d'origine. Une ligne absente est créée, une ligne présente est mise à jour si
 *   ses valeurs diffèrent. Le script peut donc être relancé sans créer de doublon, et il ne supprime jamais rien.
 * - Questions : la clé naturelle est le texte de la question. Une question dont le texte est déjà en base sous un autre
 *   identifiant est gardée telle quelle en base, et la ligne de la sauvegarde est comptée comme ignorée (la sauvegarde
 *   contient elle-même un texte en double).
 * - Les membres sont désignés par leur identifiant du site, gardé tel quel : cette base n'a pas de table de membres.
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

function textOrNull(row: SqliteRow, column: string): string | null {
  const value = row[column];
  return value === null || value === undefined ? null : String(value);
}

function int(row: SqliteRow, column: string): number {
  const value = row[column];
  if (value === null || value === undefined) return 0;
  const result = Number(value);
  if (!Number.isInteger(result)) throw new Error(`Colonne ${column} : nombre entier attendu, reçu ${String(value)}`);
  return result;
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

// --- Comptes du résumé -----------------------------------------------------------------------------------------------

type Counts = { read: number; created: number; updated: number; unchanged: number; ignored: number };
const summary = new Map<string, Counts>();

function countsFor(table: string): Counts {
  const counts = { read: 0, created: 0, updated: 0, unchanged: 0, ignored: 0 };
  summary.set(table, counts);
  return counts;
}

/** Vrai si une valeur de `data` diffère de la ligne déjà en base (les dates sont comparées à la milliseconde). */
function differs(existing: Record<string, unknown>, data: Record<string, unknown>): boolean {
  return Object.entries(data).some(([key, value]) => {
    const current = existing[key];
    if (value instanceof Date && current instanceof Date) return value.getTime() !== current.getTime();
    return JSON.stringify(value) !== JSON.stringify(current);
  });
}

/** Crée la ligne si elle est absente, la met à jour si ses valeurs diffèrent, sinon la compte comme inchangée. */
async function upsert<T extends Record<string, unknown>>(
  counts: Counts,
  existing: Record<string, unknown> | null,
  data: T,
  create: () => Promise<unknown>,
  update: () => Promise<unknown>,
) {
  if (!existing) {
    await create();
    counts.created++;
  } else if (differs(existing, data)) {
    await update();
    counts.updated++;
  } else {
    counts.unchanged++;
  }
}

// --- Reprise ---------------------------------------------------------------------------------------------------------

async function main() {
  const backupPath = process.argv[2];
  const databaseUrl = process.env.BBQUIZZ_DATABASE_URL;
  if (!backupPath || !databaseUrl) {
    console.error('Usage : BBQUIZZ_DATABASE_URL="<adresse de la base cible>" npx tsx scripts/import-beta-backup.ts <fichier .db>');
    process.exit(1);
  }

  const backup = openBackup(backupPath);
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
  const tables = new Set(backup.prepare(`SELECT "name" FROM "sqlite_master" WHERE "type" = 'table'`).all().map((row) => text(row, "name")));
  // Une table absente de la sauvegarde ne donne aucune ligne
  const rows = (table: string) => (tables.has(table) ? backup.prepare(`SELECT * FROM "${table}"`).all() : []);
  console.log(`Base cible : ${new URL(databaseUrl).host}`);

  try {
    const questions = countsFor("QuizQuestion");
    for (const row of rows("QuizQuestion")) {
      questions.read++;
      const id = text(row, "id");
      const data = {
        category: text(row, "category"),
        question: text(row, "question"),
        imageUrl: textOrNull(row, "imageUrl"),
        options: text(row, "options"),
        correctIndex: int(row, "correctIndex"),
        explanation: textOrNull(row, "explanation"),
        timesCorrect: int(row, "timesCorrect"),
        timesOption0: int(row, "timesOption0"),
        timesOption1: int(row, "timesOption1"),
        timesOption2: int(row, "timesOption2"),
        timesOption3: int(row, "timesOption3"),
        createdAt: date(row, "createdAt"),
        updatedAt: date(row, "updatedAt"),
      };
      if (await prisma.quizQuestion.findFirst({ where: { question: data.question, NOT: { id } } })) {
        questions.ignored++;
        continue;
      }
      await upsert(
        questions,
        await prisma.quizQuestion.findUnique({ where: { id } }),
        data,
        () => prisma.quizQuestion.create({ data: { id, ...data } }),
        () => prisma.quizQuestion.update({ where: { id }, data }),
      );
    }

    const attempts = countsFor("QuizAttempt");
    for (const row of rows("QuizAttempt")) {
      attempts.read++;
      const id = text(row, "id");
      const data = {
        userId: text(row, "userId"),
        score: int(row, "score"),
        correct: int(row, "correct"),
        total: int(row, "total"),
        duration: int(row, "duration"),
        jokersUsed: int(row, "jokersUsed"),
        createdAt: date(row, "createdAt"),
      };
      await upsert(
        attempts,
        await prisma.quizAttempt.findUnique({ where: { id } }),
        data,
        () => prisma.quizAttempt.create({ data: { id, ...data } }),
        () => prisma.quizAttempt.update({ where: { id }, data }),
      );
    }

    const winners = countsFor("QuizDailyWinner");
    for (const row of rows("QuizDailyWinner")) {
      winners.read++;
      const day = date(row, "date");
      const data = { userId: text(row, "userId"), score: int(row, "score"), streak: int(row, "streak") };
      await upsert(
        winners,
        await prisma.quizDailyWinner.findUnique({ where: { date: day } }),
        data,
        () => prisma.quizDailyWinner.create({ data: { date: day, ...data } }),
        () => prisma.quizDailyWinner.update({ where: { date: day }, data }),
      );
    }

    const suggestions = countsFor("QuizQuestionSuggestion");
    for (const row of rows("QuizQuestionSuggestion")) {
      suggestions.read++;
      const id = text(row, "id");
      const data = {
        category: text(row, "category"),
        question: text(row, "question"),
        imageUrl: textOrNull(row, "imageUrl"),
        options: text(row, "options"),
        correctIndex: int(row, "correctIndex"),
        explanation: textOrNull(row, "explanation"),
        authorId: text(row, "authorId"),
        status: text(row, "status"),
        createdAt: date(row, "createdAt"),
        updatedAt: date(row, "updatedAt"),
      };
      await upsert(
        suggestions,
        await prisma.quizQuestionSuggestion.findUnique({ where: { id } }),
        data,
        () => prisma.quizQuestionSuggestion.create({ data: { id, ...data } }),
        () => prisma.quizQuestionSuggestion.update({ where: { id }, data }),
      );
    }

    // Scores des joueurs : seuls les membres qui ont au moins une valeur non nulle ont une ligne
    const players = countsFor("QuizPlayerStats (depuis User)");
    for (const row of rows("User")) {
      const data = {
        totalScore: int(row, "quizTotalScore"),
        bestScore: int(row, "quizBestScore"),
        streak: int(row, "quizStreak"),
        attemptsCount: int(row, "quizAttemptsCount"),
      };
      if (Object.values(data).every((value) => value === 0)) continue;
      players.read++;
      const userId = text(row, "id");
      await upsert(
        players,
        await prisma.quizPlayerStats.findUnique({ where: { userId } }),
        data,
        () => prisma.quizPlayerStats.create({ data: { userId, ...data } }),
        () => prisma.quizPlayerStats.update({ where: { userId }, data }),
      );
    }

    console.log("\nRésumé de la reprise :");
    for (const [table, counts] of summary) {
      console.log(
        `- ${table} : ${counts.read} lues, ${counts.created} créées, ${counts.updated} mises à jour, ` +
          `${counts.unchanged} inchangées, ${counts.ignored} ignorées` +
          (counts.ignored > 0 ? " (texte de question déjà en base sous un autre identifiant)" : ""),
      );
    }
    console.log(
      `\nBase BBQuizz : ${await prisma.quizQuestion.count()} questions, ${await prisma.quizAttempt.count()} parties terminées, ` +
        `${await prisma.quizDailyWinner.count()} gagnants du jour, ${await prisma.quizQuestionSuggestion.count()} propositions, ` +
        `${await prisma.quizPlayerStats.count()} joueurs avec des scores.`,
    );
    if (!tables.has("QuizGame")) console.log("Note : la sauvegarde n'a pas de table QuizGame (parties en cours) : rien à reprendre.");
  } finally {
    backup.close();
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("La reprise a échoué :", error);
  process.exit(1);
});
