/**
 * Reprise des données de la bêta (carte 178).
 *
 * Copie les membres et les données utiles de l'ancienne production (sauvegarde SQLite du 4 novembre 2026) dans la base
 * Postgres désignée par `DATABASE_URL`. Script ponctuel : à supprimer après la reprise en production.
 *
 * Usage, depuis le dossier apps/site :
 *   DATABASE_URL="<adresse de la base cible>" npx tsx scripts/import-beta-backup.ts <chemin du fichier .db>
 *
 * Fonctionnement :
 * - La sauvegarde est ouverte en lecture seule avec le module SQLite intégré à Node (`node:sqlite`), sans bibliothèque
 *   à installer. Elle n'est jamais modifiée.
 * - La base cible doit être à jour de ses migrations et avoir reçu les données de base (`prisma/firstSetup.ts`).
 * - Chaque ligne garde son identifiant d'origine : une ligne absente est créée, une ligne présente est mise à jour si
 *   ses valeurs diffèrent. Le script peut donc être relancé sans créer de doublon, et il ne supprime jamais rien.
 * - Quand une ligne existe déjà sous la même clé naturelle (le nom d'un rôle, le groupe et la clé d'une donnée de
 *   référence…) mais avec un autre identifiant, la version déjà en base est gardée
 *   (en général celle de firstSetup) et la ligne de la sauvegarde est comptée comme ignorée.
 * - Les tables qui ne sont pas reprises (messages privés, forum, tournoi, modération, sessions…) ne
 *   sont pas lues : le résumé indique seulement leur nombre de lignes.
 * - Les schémas BBScheme (table BBSchemeState) ne sont plus repris ici depuis la carte 179 : ils vont dans la base de
 *   l'application BBScheme, par le script apps/bbscheme/scripts/import-beta-backup.ts.
 * - Les données du quiz (questions, parties, et les scores rangés sur la fiche des membres : colonnes quizTotalScore,
 *   quizBestScore, quizStreak, quizAttemptsCount) ne sont plus reprises ici depuis la carte 180 : elles vont dans la
 *   base de l'application BBQuizz, par le script apps/bbquizz/scripts/import-beta-backup.ts.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../prisma/generated-client";

// --- Lecture de la sauvegarde SQLite ---------------------------------------------------------------------------------

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

// --- Conversion des valeurs SQLite -----------------------------------------------------------------------------------

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
  const value = Number(row[column]);
  if (!Number.isInteger(value)) throw new Error(`Colonne ${column} : nombre entier attendu, reçu ${String(row[column])}`);
  return value;
}

function intOrNull(row: SqliteRow, column: string): number | null {
  return row[column] === null || row[column] === undefined ? null : int(row, column);
}

function floatOrNull(row: SqliteRow, column: string): number | null {
  return row[column] === null || row[column] === undefined ? null : Number(row[column]);
}

/** SQLite range les booléens sous forme de nombres 0 ou 1 (parfois de texte « true » ou « false »). */
function bool(row: SqliteRow, column: string): boolean {
  const value = row[column];
  if (typeof value === "string") return value === "1" || value === "true";
  return Number(value) === 1;
}

/**
 * Prisma range les dates SQLite soit en texte (« 2026-04-21T21:26:16.842+00:00 »), soit en millisecondes depuis le
 * 1er janvier 1970. Une date écrite par SQLite lui-même (« 2026-04-21 21:26:16 ») est en temps universel.
 */
function dateOrNull(row: SqliteRow, column: string): Date | null {
  const value = row[column];
  if (value === null || value === undefined) return null;
  let date: Date;
  if (typeof value === "number" || typeof value === "bigint") date = new Date(Number(value));
  else if (/^\d+$/.test(String(value))) date = new Date(Number(value));
  else {
    const raw = String(value);
    const hasZone = /(Z|[+-]\d{2}:?\d{2})$/.test(raw);
    date = new Date(hasZone ? raw : `${raw.replace(" ", "T")}Z`);
  }
  if (Number.isNaN(date.getTime())) throw new Error(`Colonne ${column} : date illisible ${String(value)}`);
  return date;
}

function date(row: SqliteRow, column: string): Date {
  const value = dateOrNull(row, column);
  if (!value) throw new Error(`Colonne ${column} : date attendue, valeur vide`);
  return value;
}

// --- Comptes du résumé -----------------------------------------------------------------------------------------------

class TableStats {
  read = 0;
  created = 0;
  updated = 0;
  unchanged = 0;
  /** Lignes non reprises, par raison. */
  ignored = new Map<string, number>();
  /** Champs vidés parce qu'ils pointaient vers une donnée non reprise, par raison. */
  cleared = new Map<string, number>();

  ignore(reason: string) {
    this.ignored.set(reason, (this.ignored.get(reason) ?? 0) + 1);
  }

  clear(reason: string) {
    this.cleared.set(reason, (this.cleared.get(reason) ?? 0) + 1);
  }
}

const stats = new Map<string, TableStats>();

function statsFor(table: string): TableStats {
  let entry = stats.get(table);
  if (!entry) {
    entry = new TableStats();
    stats.set(table, entry);
  }
  return entry;
}

function sameValue(a: unknown, b: unknown): boolean {
  if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
  return a === b;
}

/** Vrai si une des valeurs de `data` diffère de la ligne déjà en base. */
function differs(existing: object, data: object): boolean {
  const current = existing as Record<string, unknown>;
  return Object.entries(data).some(([key, value]) => !sameValue(current[key], value));
}

/** Crée la ligne si elle est absente, la met à jour si ses valeurs diffèrent, sinon ne fait rien. */
async function upsertById(
  table: TableStats,
  existing: object | null,
  data: object,
  create: () => Promise<unknown>,
  update: () => Promise<unknown>,
): Promise<void> {
  if (!existing) {
    await create();
    table.created++;
  } else if (differs(existing, data)) {
    await update();
    table.updated++;
  } else {
    table.unchanged++;
  }
}

/** Ligne déjà en base sous la même clé naturelle avec un autre identifiant : la version en base est gardée. */
function keepExisting(table: TableStats, existing: object, data: object) {
  table.ignore(
    differs(existing, data)
      ? "déjà en base sous un autre identifiant, avec d'autres valeurs : version en base gardée"
      : "déjà en base sous un autre identifiant, valeurs identiques",
  );
}

// --- Reprise ---------------------------------------------------------------------------------------------------------

/** Tables lues et reprises ; toutes les autres tables de la sauvegarde sont ignorées. */
const IMPORTED_TABLES = [
  "RoleConfig", "SiteSetting", "ReferenceData", "User", "Account", "Ligue", "_LigueMembers", "_LigueCommissaires",
  "ResourceTag", "Resource", "_ResourceToResourceTag", "ArticleTag", "Article", "_ArticleToArticleTag",
  "ArticleReaction", "RankingArchive",
];

async function main() {
  const backupPath = process.argv[2];
  const databaseUrl = process.env.DATABASE_URL;
  if (!backupPath || !databaseUrl) {
    console.error('Usage : DATABASE_URL="<adresse de la base cible>" npx tsx scripts/import-beta-backup.ts <fichier .db>');
    process.exit(1);
  }

  const backup = openBackup(backupPath);
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: databaseUrl }) });
  const rows = (table: string) => backup.prepare(`SELECT * FROM "${table}"`).all();
  console.log(`Base cible : ${new URL(databaseUrl).host}`);

  try {
    // Rôles : la version de firstSetup est toujours gardée ; seuls les rôles absents sont créés.
    const roles = statsFor("RoleConfig");
    for (const row of rows("RoleConfig")) {
      roles.read++;
      const data = {
        label: text(row, "label"),
        color: text(row, "color"),
        power: int(row, "power"),
        isBaseRole: bool(row, "isBaseRole"),
      };
      const existing = await prisma.roleConfig.findUnique({ where: { name: text(row, "name") } });
      if (existing) {
        if (differs(existing, data)) roles.ignore("déjà en base avec d'autres valeurs : version en base gardée");
        else roles.unchanged++;
        continue;
      }
      await prisma.roleConfig.create({ data: { name: text(row, "name"), ...data, updatedAt: date(row, "updatedAt") } });
      roles.created++;
    }
    const knownRoles = new Set((await prisma.roleConfig.findMany({ select: { name: true } })).map((r) => r.name));

    // Réglages du site (textes du guide du débutant) : la version de la bêta, modifiée par l'administration, l'emporte.
    const settings = statsFor("SiteSetting");
    for (const row of rows("SiteSetting")) {
      settings.read++;
      const key = text(row, "key");
      const data = { value: text(row, "value") };
      await upsertById(
        settings,
        await prisma.siteSetting.findUnique({ where: { key } }),
        data,
        () => prisma.siteSetting.create({ data: { key, ...data } }),
        () => prisma.siteSetting.update({ where: { key }, data }),
      );
    }

    // Données de référence : clé naturelle = groupe + clé ; la version de firstSetup est gardée.
    const references = statsFor("ReferenceData");
    for (const row of rows("ReferenceData")) {
      references.read++;
      const id = text(row, "id");
      const naturalKey = { group: text(row, "group"), key: text(row, "key") };
      const data = { ...naturalKey, label: text(row, "label"), order: int(row, "order"), isActive: bool(row, "isActive") };
      const sameKey = await prisma.referenceData.findUnique({ where: { group_key: naturalKey } });
      if (sameKey && sameKey.id !== id) {
        keepExisting(references, sameKey, data);
        continue;
      }
      await upsertById(
        references,
        sameKey,
        data,
        () => prisma.referenceData.create({ data: { id, ...data } }),
        () => prisma.referenceData.update({ where: { id }, data }),
      );
    }

    // Membres. Le thème : comme la migration de la carte 078, tout le monde passe au thème « vestiaire » et l'ancien
    // thème est gardé dans previousTheme pour que le bandeau du nouveau look propose d'y revenir.
    // Colonnes nouvelles laissées à leur valeur par défaut : autoFollowTopics, forumReadAllAt (date de la reprise).
    // Colonne disparue : notifMention.
    const users = statsFor("User");
    const importedUsers = new Set<string>();
    for (const row of rows("User")) {
      users.read++;
      const id = text(row, "id");
      const role = text(row, "role");
      if (!knownRoles.has(role)) {
        users.ignore(`rôle inconnu dans la base cible`);
        continue;
      }
      const oldTheme = text(row, "theme");
      const data = {
        name: textOrNull(row, "name"),
        email: textOrNull(row, "email"),
        emailVerified: dateOrNull(row, "emailVerified"),
        image: textOrNull(row, "image"),
        role,
        nafNumber: textOrNull(row, "nafNumber"),
        region: textOrNull(row, "region"),
        signature: textOrNull(row, "signature"),
        isBanned: bool(row, "isBanned"),
        banReason: textOrNull(row, "banReason"),
        avatarFrame: textOrNull(row, "avatarFrame"),
        theme: "vestiaire",
        previousTheme: oldTheme === "vestiaire" ? null : oldTheme,
        equipe: textOrNull(row, "equipe"),
        ligueCustom: textOrNull(row, "ligueCustom"),
        legacyId: textOrNull(row, "legacyId"),
        forumactifName: textOrNull(row, "forumactifName"),
        hasFinishedOnboarding: bool(row, "hasFinishedOnboarding"),
        notifPm: bool(row, "notifPm"),
        notifFollowedTopic: bool(row, "notifFollowedTopic"),
        notifNewsletter: bool(row, "notifNewsletter"),
      };
      if (data.email) {
        const sameEmail = await prisma.user.findUnique({ where: { email: data.email } });
        if (sameEmail && sameEmail.id !== id) {
          users.ignore("adresse email déjà utilisée par un autre membre de la base cible");
          continue;
        }
      }
      await upsertById(
        users,
        await prisma.user.findUnique({ where: { id } }),
        data,
        () => prisma.user.create({ data: { id, ...data } }),
        () => prisma.user.update({ where: { id }, data }),
      );
      importedUsers.add(id);
    }

    // Liaisons Discord ou Google des membres : clé naturelle = fournisseur + identifiant chez ce fournisseur.
    const accounts = statsFor("Account");
    for (const row of rows("Account")) {
      accounts.read++;
      const id = text(row, "id");
      const userId = text(row, "userId");
      if (!importedUsers.has(userId)) {
        accounts.ignore("membre non repris");
        continue;
      }
      const data = {
        userId,
        type: text(row, "type"),
        provider: text(row, "provider"),
        providerAccountId: text(row, "providerAccountId"),
        refresh_token: textOrNull(row, "refresh_token"),
        access_token: textOrNull(row, "access_token"),
        expires_at: intOrNull(row, "expires_at"),
        token_type: textOrNull(row, "token_type"),
        scope: textOrNull(row, "scope"),
        id_token: textOrNull(row, "id_token"),
        session_state: textOrNull(row, "session_state"),
      };
      const sameKey = await prisma.account.findUnique({
        where: { provider_providerAccountId: { provider: data.provider, providerAccountId: data.providerAccountId } },
      });
      if (sameKey && sameKey.id !== id) {
        keepExisting(accounts, sameKey, data);
        continue;
      }
      await upsertById(
        accounts,
        sameKey,
        data,
        () => prisma.account.create({ data: { id, ...data } }),
        () => prisma.account.update({ where: { id }, data }),
      );
    }

    // Ligues, puis leurs membres et commissaires (seulement les membres repris). Aucune liaison n'est retirée.
    const ligues = statsFor("Ligue");
    const importedLigues = new Set<string>();
    for (const row of rows("Ligue")) {
      ligues.read++;
      const id = text(row, "id");
      const creatorId = text(row, "creatorId");
      if (!importedUsers.has(creatorId)) {
        ligues.ignore("créateur non repris");
        continue;
      }
      const data = {
        name: text(row, "name"),
        acronym: text(row, "acronym"),
        geographicalZone: textOrNull(row, "geographicalZone"),
        gmapsUrl: textOrNull(row, "gmapsUrl"),
        region: textOrNull(row, "region"),
        departement: textOrNull(row, "departement"),
        ville: textOrNull(row, "ville"),
        address: textOrNull(row, "address"),
        description: textOrNull(row, "description"),
        image: textOrNull(row, "image"),
        createdAt: date(row, "createdAt"),
        updatedAt: date(row, "updatedAt"),
        creatorId,
        lat: floatOrNull(row, "lat"),
        lng: floatOrNull(row, "lng"),
      };
      await upsertById(
        ligues,
        await prisma.ligue.findUnique({ where: { id } }),
        data,
        () => prisma.ligue.create({ data: { id, ...data } }),
        () => prisma.ligue.update({ where: { id }, data }),
      );
      importedLigues.add(id);
    }
    for (const [table, relation] of [["_LigueMembers", "members"], ["_LigueCommissaires", "commissaires"]] as const) {
      const links = statsFor(table);
      for (const row of rows(table)) {
        links.read++;
        // Table de liaison de Prisma : A = la ligue, B = le membre (ordre alphabétique des deux modèles).
        const ligueId = text(row, "A");
        const userId = text(row, "B");
        if (!importedLigues.has(ligueId)) {
          links.ignore("ligue non reprise");
          continue;
        }
        if (!importedUsers.has(userId)) {
          links.ignore("membre non repris");
          continue;
        }
        const ligue = await prisma.ligue.findUniqueOrThrow({
          where: { id: ligueId },
          select: { members: { select: { id: true } }, commissaires: { select: { id: true } } },
        });
        if (ligue[relation].some((user) => user.id === userId)) {
          links.unchanged++;
          continue;
        }
        await prisma.ligue.update({ where: { id: ligueId }, data: { [relation]: { connect: { id: userId } } } });
        links.created++;
      }
    }

    // Étiquettes des ressources et des articles : clé naturelle = nom. Si le nom existe déjà sous un autre
    // identifiant, les liaisons de la sauvegarde sont reportées sur l'étiquette déjà en base.
    const resourceTagIds = new Map<string, string>();
    const resourceTags = statsFor("ResourceTag");
    for (const row of rows("ResourceTag")) {
      resourceTags.read++;
      const id = text(row, "id");
      const data = { name: text(row, "name") };
      const sameName = await prisma.resourceTag.findUnique({ where: { name: data.name } });
      if (sameName && sameName.id !== id) {
        keepExisting(resourceTags, sameName, data);
        resourceTagIds.set(id, sameName.id);
        continue;
      }
      await upsertById(resourceTags, sameName, data, () => prisma.resourceTag.create({ data: { id, ...data } }), () =>
        prisma.resourceTag.update({ where: { id }, data }),
      );
      resourceTagIds.set(id, id);
    }

    const articleTagIds = new Map<string, string>();
    const articleTags = statsFor("ArticleTag");
    for (const row of rows("ArticleTag")) {
      articleTags.read++;
      const id = text(row, "id");
      const data = { name: text(row, "name") };
      const sameName = await prisma.articleTag.findUnique({ where: { name: data.name } });
      if (sameName && sameName.id !== id) {
        keepExisting(articleTags, sameName, data);
        articleTagIds.set(id, sameName.id);
        continue;
      }
      await upsertById(articleTags, sameName, data, () => prisma.articleTag.create({ data: { id, ...data } }), () =>
        prisma.articleTag.update({ where: { id }, data }),
      );
      articleTagIds.set(id, id);
    }

    // Ressources (outils et aides de jeu proposés par les membres) et leurs étiquettes.
    const resources = statsFor("Resource");
    const importedResources = new Set<string>();
    for (const row of rows("Resource")) {
      resources.read++;
      const id = text(row, "id");
      const authorId = text(row, "authorId");
      if (!importedUsers.has(authorId)) {
        resources.ignore("auteur non repris");
        continue;
      }
      const data = {
        title: text(row, "title"),
        description: text(row, "description"),
        imageUrl: textOrNull(row, "imageUrl"),
        link: text(row, "link"),
        status: text(row, "status"),
        authorId,
        createdAt: date(row, "createdAt"),
        updatedAt: date(row, "updatedAt"),
        isSystem: bool(row, "isSystem"),
      };
      await upsertById(
        resources,
        await prisma.resource.findUnique({ where: { id } }),
        data,
        () => prisma.resource.create({ data: { id, ...data } }),
        () => prisma.resource.update({ where: { id }, data }),
      );
      importedResources.add(id);
    }
    const resourceLinks = statsFor("_ResourceToResourceTag");
    for (const row of rows("_ResourceToResourceTag")) {
      resourceLinks.read++;
      const resourceId = text(row, "A");
      const tagId = resourceTagIds.get(text(row, "B"));
      if (!importedResources.has(resourceId) || !tagId) {
        resourceLinks.ignore("ressource ou étiquette non reprise");
        continue;
      }
      const resource = await prisma.resource.findUniqueOrThrow({
        where: { id: resourceId },
        select: { tags: { select: { id: true } } },
      });
      if (resource.tags.some((tag) => tag.id === tagId)) {
        resourceLinks.unchanged++;
        continue;
      }
      await prisma.resource.update({ where: { id: resourceId }, data: { tags: { connect: { id: tagId } } } });
      resourceLinks.created++;
    }

    // Articles : l'auteur doit être repris ; le modérateur et la ligue sont vidés s'ils ne le sont pas.
    const articles = statsFor("Article");
    const importedArticles = new Set<string>();
    for (const row of rows("Article")) {
      articles.read++;
      const id = text(row, "id");
      const authorId = text(row, "authorId");
      if (!importedUsers.has(authorId)) {
        articles.ignore("auteur non repris");
        continue;
      }
      let moderatedBy = textOrNull(row, "moderatedBy");
      if (moderatedBy && !importedUsers.has(moderatedBy)) {
        articles.clear("modérateur non repris : champ moderatedBy vidé");
        moderatedBy = null;
      }
      let ligueId = textOrNull(row, "ligueId");
      if (ligueId && !importedLigues.has(ligueId)) {
        articles.clear("ligue non reprise : champ ligueId vidé");
        ligueId = null;
      }
      const data = {
        title: text(row, "title"),
        content: text(row, "content"),
        createdAt: date(row, "createdAt"),
        updatedAt: date(row, "updatedAt"),
        views: int(row, "views"),
        authorId,
        isModerated: bool(row, "isModerated"),
        moderationReason: textOrNull(row, "moderationReason"),
        moderatedBy,
        ligueId,
        ligueCustom: textOrNull(row, "ligueCustom"),
      };
      await upsertById(
        articles,
        await prisma.article.findUnique({ where: { id } }),
        data,
        () => prisma.article.create({ data: { id, ...data } }),
        () => prisma.article.update({ where: { id }, data }),
      );
      importedArticles.add(id);
    }
    const articleLinks = statsFor("_ArticleToArticleTag");
    for (const row of rows("_ArticleToArticleTag")) {
      articleLinks.read++;
      const articleId = text(row, "A");
      const tagId = articleTagIds.get(text(row, "B"));
      if (!importedArticles.has(articleId) || !tagId) {
        articleLinks.ignore("article ou étiquette non repris");
        continue;
      }
      const article = await prisma.article.findUniqueOrThrow({
        where: { id: articleId },
        select: { tags: { select: { id: true } } },
      });
      if (article.tags.some((tag) => tag.id === tagId)) {
        articleLinks.unchanged++;
        continue;
      }
      await prisma.article.update({ where: { id: articleId }, data: { tags: { connect: { id: tagId } } } });
      articleLinks.created++;
    }

    // Réactions aux articles : clé naturelle = article + membre + émoji.
    const reactions = statsFor("ArticleReaction");
    for (const row of rows("ArticleReaction")) {
      reactions.read++;
      const id = text(row, "id");
      const data = {
        emoji: text(row, "emoji"),
        createdAt: date(row, "createdAt"),
        articleId: text(row, "articleId"),
        userId: text(row, "userId"),
      };
      if (!importedArticles.has(data.articleId) || !importedUsers.has(data.userId)) {
        reactions.ignore("article ou membre non repris");
        continue;
      }
      const sameKey = await prisma.articleReaction.findUnique({
        where: { articleId_userId_emoji: { articleId: data.articleId, userId: data.userId, emoji: data.emoji } },
      });
      if (sameKey && sameKey.id !== id) {
        keepExisting(reactions, sameKey, data);
        continue;
      }
      await upsertById(
        reactions,
        sameKey,
        data,
        () => prisma.articleReaction.create({ data: { id, ...data } }),
        () => prisma.articleReaction.update({ where: { id }, data }),
      );
    }

    // Archives du classement : clé naturelle = année.
    const archives = statsFor("RankingArchive");
    for (const row of rows("RankingArchive")) {
      archives.read++;
      const id = text(row, "id");
      const data = {
        year: int(row, "year"),
        name: text(row, "name"),
        data: text(row, "data"),
        createdAt: date(row, "createdAt"),
        updatedAt: date(row, "updatedAt"),
        archivedById: text(row, "archivedById"),
      };
      if (!importedUsers.has(data.archivedById)) {
        archives.ignore("membre qui a archivé non repris");
        continue;
      }
      const sameYear = await prisma.rankingArchive.findUnique({ where: { year: data.year } });
      if (sameYear && sameYear.id !== id) {
        keepExisting(archives, sameYear, data);
        continue;
      }
      await upsertById(
        archives,
        sameYear,
        data,
        () => prisma.rankingArchive.create({ data: { id, ...data } }),
        () => prisma.rankingArchive.update({ where: { id }, data }),
      );
    }

    printSummary(backup);
  } finally {
    backup.close();
    await prisma.$disconnect();
  }
}

function printSummary(backup: SqliteDatabase) {
  console.log("\nRésumé de la reprise (lues / créées / mises à jour / inchangées / ignorées) :");
  for (const [table, entry] of stats) {
    const ignored = [...entry.ignored.values()].reduce((sum, count) => sum + count, 0);
    console.log(
      `- ${table} : ${entry.read} lues, ${entry.created} créées, ${entry.updated} mises à jour, ` +
        `${entry.unchanged} inchangées, ${ignored} ignorées`,
    );
    for (const [reason, count] of entry.ignored) console.log(`    ignorées (${count}) : ${reason}`);
    for (const [reason, count] of entry.cleared) console.log(`    note (${count}) : ${reason}`);
  }

  console.log("\nTables de la sauvegarde non reprises (hors du périmètre de la carte 178) :");
  const tables = backup
    .prepare(`SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name`)
    .all()
    .map((row) => text(row, "name"))
    .filter((name) => !IMPORTED_TABLES.includes(name) && name !== "_prisma_migrations");
  for (const table of tables) {
    const count = Number(backup.prepare(`SELECT COUNT(*) AS n FROM "${table}"`).all()[0].n);
    if (count > 0) console.log(`- ${table} : ${count} lignes non reprises`);
  }
}

main().catch((error) => {
  console.error("La reprise a échoué :", error);
  process.exit(1);
});
