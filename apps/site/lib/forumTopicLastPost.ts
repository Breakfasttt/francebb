/**
 * Dernier message d'un sujet (carte 166), interne au serveur. Déplacé ici depuis `app/forum/actions.ts` à la carte 169,
 * pour servir aussi aux actions qui scindent et fusionnent des sujets : un fichier d'actions serveur (« use server »)
 * rend appelable depuis le navigateur toute fonction qu'il exporte, ce qui ne doit pas être le cas de celle-ci.
 */
import { prisma } from "@/lib/prisma";

/** Client de base utilisable ici : `prisma` lui-même, ou le client d'une transaction (`tx`). */
type RawExecutor = Pick<typeof prisma, "$executeRaw">;

/**
 * Recalcule le dernier message visible d'un sujet (`lastPostAt`, `lastPostId`, `lastPostAuthorId`, carte 166) après la
 * suppression ou la restauration d'un message : le plus récent des messages non supprimés, ou la date de création du
 * sujet s'il n'en reste aucun. Même calcul que la migration `20261104190000_forum_non_lus`. Requête SQL directe, pour
 * ne pas changer `updatedAt`. `db` permet de l'appeler dans une transaction.
 */
export async function refreshTopicLastPost(topicId: string, db: RawExecutor = prisma) {
  await db.$executeRaw`
    UPDATE "Topic" AS t
    SET "lastPostAt" = COALESCE(lp."createdAt", t."createdAt"),
        "lastPostId" = lp."id",
        "lastPostAuthorId" = lp."authorId"
    FROM "Topic" AS t2
    LEFT JOIN LATERAL (
      SELECT p."id", p."createdAt", p."authorId"
      FROM "Post" AS p
      WHERE p."topicId" = t2."id" AND p."isDeleted" = false
      ORDER BY p."createdAt" DESC, p."id" DESC
      LIMIT 1
    ) AS lp ON true
    WHERE t2."id" = ${topicId} AND t."id" = t2."id"`;
}
