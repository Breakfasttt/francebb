/**
 * État « non lu » du forum pour un membre (carte 166), mémorisé pendant le rendu d'une page : partagé entre l'accueil
 * du forum, la liste d'un forum, la page des non-lus et le compteur de la colonne latérale.
 *
 * Un sujet est non lu quand son dernier message (`Topic.lastPostAt`) est plus récent que la position de lecture du
 * membre dans ce sujet (`TopicView.lastReadPostAt`) ou, s'il ne l'a jamais ouvert, que sa date « tout est lu avant
 * le… » (`User.forumReadAllAt`). C'est la règle `isTopicUnread` de `lib/forumReadPosition.ts`, écrite ici en SQL pour
 * que la base fasse le tri elle-même, en une seule requête, au lieu de renvoyer tous les sujets du forum.
 * Seuls comptent les sujets visibles : forums accessibles au rôle du membre (lib/forumAccess.ts), ni archivés, ni
 * supprimés.
 */
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { forumAccessWhere, getForumAccess } from "@/lib/forumAccess";

export const getUnreadState = cache(async (userId: string) => {
  const { roles } = await getForumAccess();
  // Forums accessibles au rôle : une petite liste (quelques dizaines de forums), lue à part car la règle d'accès
  // (catégorie, forum parent) est écrite comme un filtre Prisma
  const forums = await prisma.forum.findMany({ where: forumAccessWhere(roles), select: { id: true } });
  const forumIds = forums.map((forum) => forum.id);

  // Requête entière dans un seul gabarit : les morceaux Prisma.sql du client généré ne sont pas reconnus (voir
  // lib/unreadMessages.ts). Les sujets sont rendus du plus récent au plus ancien dernier message.
  const rows = forumIds.length === 0
    ? []
    : await prisma.$queryRaw<{ id: string; forumId: string }[]>`
        SELECT t."id", t."forumId"
        FROM "Topic" AS t
        JOIN "User" AS u ON u."id" = ${userId}
        LEFT JOIN "TopicView" AS v ON v."topicId" = t."id" AND v."userId" = ${userId}
        WHERE t."forumId" = ANY(${forumIds})
          AND t."isArchived" = false
          AND t."isDeleted" = false
          AND t."lastPostAt" > COALESCE(v."lastReadPostAt", u."forumReadAllAt")
        ORDER BY t."lastPostAt" DESC, t."id" DESC`;

  return {
    count: rows.length,
    /** Identifiants des sujets non lus, du plus récent au plus ancien dernier message. */
    topicIds: rows.map((row) => row.id),
    unreadTopicIds: new Set(rows.map((row) => row.id)),
    unreadForumIds: new Set(rows.map((row) => row.forumId)),
  };
});
