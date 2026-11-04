/**
 * Calcul des messages privés non lus (carte 170).
 *
 * Chaque participant d'une conversation a sa propre date de lecture, la colonne `lastReadAt` de
 * `ConversationParticipant`. Ses non-lus sont les messages écrits par les autres après cette date ; si la date est
 * vide, il n'a encore rien lu et tous les messages des autres sont non lus.
 *
 * Ce calcul compare une date de la conversation (`lastReadAt`) à une date de chaque message (`createdAt`). Prisma ne
 * sait pas écrire cette comparaison entre deux tables : on passe donc par une requête SQL écrite à la main. Les
 * valeurs y sont insérées par `$queryRaw`, qui les transmet séparément de la requête (aucun risque d'injection).
 *
 * La condition « message non lu » est écrite en entier dans chaque requête, sans morceau partagé (`Prisma.sql`,
 * `Prisma.join`) : l'objet `Prisma` du client généré venait d'anciens fichiers et ses morceaux étaient envoyés à la
 * base comme une simple valeur, ce qui faisait échouer le compteur de la barre à chaque page.
 * Condition : message écrit par un autre que le participant `p`, après sa date de lecture.
 */
import { prisma } from "@/lib/prisma";

/** Nombre total de messages non lus d'un membre, dans les conversations qu'il n'a pas quittées (pastille de la barre). */
export async function countUnreadMessages(userId: string): Promise<number> {
  const [row] = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT COUNT(*) AS count
    FROM "PrivateMessage" AS m
    JOIN "ConversationParticipant" AS p ON p."conversationId" = m."conversationId"
    WHERE p."userId" = ${userId} AND p."deletedAt" IS NULL
      AND m."authorId" <> p."userId" AND (p."lastReadAt" IS NULL OR m."createdAt" > p."lastReadAt")`;
  return Number(row?.count ?? 0);
}

/** Nombre de messages non lus d'un membre pour chacune des conversations demandées (absente = aucun non-lu). */
export async function countUnreadByConversation(userId: string, conversationIds: string[]): Promise<Map<string, number>> {
  if (conversationIds.length === 0) return new Map();
  const rows = await prisma.$queryRaw<{ conversationId: string; count: bigint }[]>`
    SELECT m."conversationId" AS "conversationId", COUNT(*) AS count
    FROM "PrivateMessage" AS m
    JOIN "ConversationParticipant" AS p ON p."conversationId" = m."conversationId"
    WHERE p."userId" = ${userId} AND m."conversationId" = ANY(${conversationIds})
      AND m."authorId" <> p."userId" AND (p."lastReadAt" IS NULL OR m."createdAt" > p."lastReadAt")
    GROUP BY m."conversationId"`;
  return new Map(rows.map((row) => [row.conversationId, Number(row.count)]));
}
