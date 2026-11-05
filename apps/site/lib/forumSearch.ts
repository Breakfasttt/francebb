/**
 * Recherche plein texte du forum (carte 191), côté base de données : messages qui correspondent aux mots-clés, dans
 * l'ordre d'affichage, et extraits à surligner. Utilisé par la recherche avancée (app/forum/search/page.tsx).
 * La colonne `searchVector` des messages et des sujets, son index et la configuration `french_unaccent` sont créés par
 * la migration 20261105150000_recherche_plein_texte.
 */
import { prisma } from "@/lib/prisma";
import { BBCODE_TAG_PATTERN, HEADLINE_OPTIONS } from "@/lib/forumSearchSnippet";
import type { Prisma } from "@/prisma/generated-client";

/**
 * Nombre maximum de messages trouvés par la recherche plein texte, avant les filtres et les droits d'accès. Au-delà,
 * les messages les moins pertinents (ou, avec un tri par date, les plus éloignés) ne sont pas proposés.
 */
const CANDIDATE_LIMIT = 1000;

export type SearchSort = "relevance" | "desc" | "asc";

/**
 * Recherche plein texte (carte 191) : identifiants des messages qui correspondent aux mots-clés, dans l'ordre
 * d'affichage. `websearch_to_tsquery` lit les mots-clés comme un moteur de recherche : tous les mots sont exigés, une
 * expression entre guillemets doit être trouvée telle quelle, « -mot » exclut un mot. La configuration
 * `french_unaccent` (migration 20261105150000_recherche_plein_texte) ignore les accents, les pluriels et les mots
 * vides comme « du ».
 * Un message est trouvé si son texte contient les mots, ou s'il est le premier message (non supprimé) d'un sujet dont
 * le titre les contient (règle de la carte 169) ; sa pertinence (`ts_rank`) est alors la somme des deux.
 * Seuls les messages et sujets supprimés sont écartés ici : les droits d'accès, la modération et les autres filtres
 * sont appliqués ensuite par Prisma, avec les mêmes fonctions que partout ailleurs (lib/forumAccess.ts), plutôt que
 * recopiés en SQL où ils risqueraient de diverger.
 */
async function searchCandidates(q: string, sort: SearchSort): Promise<string[]> {
  const byRelevance = sort === "relevance";
  const ascending = sort === "asc";
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    WITH query AS (SELECT websearch_to_tsquery('french_unaccent', ${q}) AS tsq),
    hits AS (
      SELECT p."id", p."createdAt", ts_rank(p."searchVector", query.tsq) AS rank
      FROM "Post" AS p CROSS JOIN query
      WHERE p."searchVector" @@ query.tsq AND p."isDeleted" = false
      UNION ALL
      SELECT first_posts."id", first_posts."createdAt", first_posts.rank FROM (
        SELECT DISTINCT ON (p."topicId") p."id", p."createdAt", ts_rank(t."searchVector", query.tsq) AS rank
        FROM "Topic" AS t CROSS JOIN query
        JOIN "Post" AS p ON p."topicId" = t."id"
        WHERE t."searchVector" @@ query.tsq AND t."isDeleted" = false AND p."isDeleted" = false
        ORDER BY p."topicId", p."createdAt" ASC, p."id" ASC
      ) AS first_posts
    )
    SELECT "id" FROM hits
    GROUP BY "id", "createdAt"
    ORDER BY
      CASE WHEN ${byRelevance} THEN SUM(rank) END DESC NULLS LAST,
      CASE WHEN ${ascending} THEN "createdAt" END ASC NULLS LAST,
      "createdAt" DESC, "id" DESC
    LIMIT ${CANDIDATE_LIMIT}`;
  return rows.map((row) => row.id);
}

/**
 * Extraits des messages affichés, préparés par Postgres (`ts_headline`) : les passages qui contiennent les mots
 * cherchés, chaque mot trouvé étant marqué pour être surligné (lib/forumSearchSnippet.ts). Une seule requête pour la
 * page, 20 messages au plus.
 */
export async function headlinesFor(postIds: string[], q: string): Promise<Map<string, string>> {
  if (postIds.length === 0) return new Map();
  const rows = await prisma.$queryRaw<{ id: string; headline: string }[]>`
    SELECT p."id", ts_headline(
      'french_unaccent',
      regexp_replace(p."content", ${BBCODE_TAG_PATTERN}, ' ', 'g'),
      websearch_to_tsquery('french_unaccent', ${q}),
      ${HEADLINE_OPTIONS}
    ) AS headline
    FROM "Post" AS p
    WHERE p."id" = ANY(${postIds})`;
  return new Map(rows.map((row) => [row.id, row.headline]));
}

/**
 * Identifiants des messages trouvés par les mots-clés `q` et qui passent le filtre Prisma `where` (droits d'accès,
 * modération, auteur, forum, période), dans l'ordre d'affichage. Le filtre est appliqué par Prisma, avec les mêmes
 * fonctions que partout ailleurs (lib/forumAccess.ts), plutôt que recopié en SQL où il risquerait de diverger.
 */
export async function searchPostIds(q: string, sort: SearchSort, where: Prisma.PostWhereInput): Promise<string[]> {
  const candidates = await searchCandidates(q, sort);
  if (candidates.length === 0) return [];
  const allowed = await prisma.post.findMany({ where: { ...where, id: { in: candidates } }, select: { id: true } });
  const allowedIds = new Set(allowed.map((post) => post.id));
  return candidates.filter((id) => allowedIds.has(id));
}
