/**
 * Scinder et fusionner des sujets du forum (carte 169), réservé aux modérateurs.
 *
 * - **Scinder** : des messages choisis d'un sujet partent dans un nouveau sujet (titre et forum donnés par le
 *   modérateur). Le premier message du sujet d'origine ne peut pas partir : le sujet d'origine garde son ouverture.
 * - **Fusionner** : tous les messages d'un sujet rejoignent un autre sujet, où ils se rangent à leur date. Le sujet
 *   vidé est supprimé en douce (carte 165), avec une raison écrite automatiquement.
 *
 * Dans les deux cas, tout se fait dans une transaction (tout réussit ou rien ne change), puis :
 * - le dernier message des deux sujets est recalculé (`refreshTopicLastPost`, carte 166), pour le tri et le non-lu ;
 * - les positions de lecture (`TopicView`) et les abonnements (`TopicFollow`) du sujet d'origine sont recopiés vers le
 *   sujet d'arrivée, sans écraser ceux qui y existent déjà : un membre qui avait lu les messages déplacés ne les voit
 *   pas revenir en non lu ;
 * - les notifications qui visent un message déplacé suivent ce message ;
 * - l'opération est inscrite au journal de modération.
 * Un sujet qui porte un tournoi ne peut être ni scindé ni fusionné : le tournoi est attaché à son premier message.
 *
 * Les messages changent de sujet par une requête SQL directe : leur date de modification (`updatedAt`) ne bouge pas,
 * sinon ils afficheraient tous « modifié le … ».
 */
"use server";

import { revalidatePath, updateTag } from "next/cache";
import { getActiveSession } from "@/lib/authGuard";
import { forumAccessWhere, getForumAccess, topicAccessWhere } from "@/lib/forumAccess";
import { logModerationAction } from "@/lib/moderationLog";
import { closePendingReports } from "@/lib/moderationReports";
import { prisma } from "@/lib/prisma";
import { isModerator } from "@/lib/roles";
import { refreshTopicLastPost } from "@/lib/forumTopicLastPost";
import { topicTitleError } from "@/lib/forumWriteRules";
import type { ActionResult } from "@/lib/actionResult";

/** Nombre maximum de messages déplacés en une fois par « Scinder ». */
const SPLIT_MAX_POSTS = 500;

/** Client d'une transaction Prisma (le paramètre `tx` de `prisma.$transaction`). */
type Tx = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/**
 * Recopie les positions de lecture et les abonnements d'un sujet vers un autre, sans écraser ceux qui existent déjà
 * dans le sujet d'arrivée (`ON CONFLICT DO NOTHING`).
 */
async function copyReadersAndFollowers(tx: Tx, fromTopicId: string, toTopicId: string) {
  await tx.$executeRaw`
    INSERT INTO "TopicView" ("userId", "topicId", "lastViewedAt", "lastReadPostAt", "lastPostId")
    SELECT "userId", ${toTopicId}, "lastViewedAt", "lastReadPostAt", "lastPostId" FROM "TopicView" WHERE "topicId" = ${fromTopicId}
    ON CONFLICT DO NOTHING`;
  await tx.$executeRaw`
    INSERT INTO "TopicFollow" ("userId", "topicId")
    SELECT "userId", ${toTopicId} FROM "TopicFollow" WHERE "topicId" = ${fromTopicId}
    ON CONFLICT DO NOTHING`;
}

/** Renouvelle les pages qui affichent ces sujets et leurs forums, et le cache de l'accueil du forum. */
function revalidateTopics(topics: { id: string; forumId: string }[]) {
  for (const topic of topics) {
    revalidatePath(`/forum/topic/${topic.id}`);
    revalidatePath(`/forum/${topic.forumId}`);
  }
  revalidatePath("/forum");
  revalidatePath("/forum/unread");
  updateTag("forum-categories");
}

/**
 * Scinde un sujet : les messages `postIds` partent dans un nouveau sujet, nommé `title`, dans le forum `forumId`.
 * Le nouveau sujet a pour auteur et pour date ceux du plus ancien message déplacé. Renvoie son identifiant.
 */
export async function splitTopic(topicId: string, postIds: string[], title: string, forumId: string): Promise<ActionResult & { topicId?: string }> {
  const session = await getActiveSession();
  if (!session?.user?.id || !isModerator(session.user.role)) {
    return { success: false, error: "Seuls les modérateurs peuvent scinder un sujet." };
  }

  const ids = Array.from(new Set(Array.isArray(postIds) ? postIds.filter((id) => typeof id === "string") : []));
  if (ids.length === 0) return { success: false, error: "Choisissez au moins un message à déplacer." };
  if (ids.length > SPLIT_MAX_POSTS) return { success: false, error: `Au plus ${SPLIT_MAX_POSTS} messages à la fois.` };
  const titleError = topicTitleError(title);
  if (titleError) return { success: false, error: titleError };

  const { roles } = await getForumAccess();
  const source = await prisma.topic.findFirst({
    where: { id: topicId, ...topicAccessWhere(roles) },
    select: { id: true, title: true, forumId: true, tournamentId: true },
  });
  if (!source) return { success: false, error: "Sujet introuvable." };
  if (source.tournamentId) return { success: false, error: "Un sujet de tournoi ne peut pas être scindé." };

  const forum = await prisma.forum.findFirst({ where: { id: forumId, ...forumAccessWhere(roles) }, select: { id: true, isTournamentForum: true } });
  if (!forum) return { success: false, error: "Forum de destination introuvable." };
  if (forum.isTournamentForum) return { success: false, error: "Un forum de tournois ne reçoit que des annonces de tournoi." };

  const firstPost = await prisma.post.findFirst({ where: { topicId }, orderBy: [{ createdAt: "asc" }, { id: "asc" }], select: { id: true } });
  if (firstPost && ids.includes(firstPost.id)) {
    return { success: false, error: "Le premier message reste dans le sujet d'origine : retirez-le de la sélection." };
  }

  const moved = await prisma.post.findMany({
    where: { id: { in: ids }, topicId },
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    select: { id: true, createdAt: true, authorId: true },
  });
  if (moved.length !== ids.length) {
    return { success: false, error: "Certains messages choisis ne font plus partie de ce sujet. Rechargez la page." };
  }
  const oldest = moved[0];

  const newTopic = await prisma.$transaction(async (tx) => {
    const created = await tx.topic.create({
      data: { title: title.trim(), forumId, authorId: oldest.authorId, createdAt: oldest.createdAt, lastPostAt: oldest.createdAt },
      select: { id: true },
    });
    await tx.$executeRaw`UPDATE "Post" SET "topicId" = ${created.id} WHERE "topicId" = ${topicId} AND "id" = ANY(${ids})`;
    await tx.$executeRaw`UPDATE "Notification" SET "topicId" = ${created.id} WHERE "postId" = ANY(${ids})`;
    await copyReadersAndFollowers(tx, topicId, created.id);
    await refreshTopicLastPost(topicId, tx);
    await refreshTopicLastPost(created.id, tx);
    return created;
  });

  const count = `${moved.length} message${moved.length > 1 ? "s" : ""}`;
  await logModerationAction("TOPIC_SPLIT", topicId, "TOPIC", `${count} déplacé${moved.length > 1 ? "s" : ""} du sujet « ${source.title} » vers le nouveau sujet « ${title.trim()} » (${newTopic.id})`);
  await logModerationAction("TOPIC_SPLIT", newTopic.id, "TOPIC", `Sujet créé en scindant « ${source.title} » (${topicId}) : ${count}`);

  revalidateTopics([source, { id: newTopic.id, forumId }]);
  return { success: true, topicId: newTopic.id };
}

/**
 * Fusionne le sujet `sourceId` dans le sujet `targetId` : tous ses messages rejoignent le sujet d'arrivée, puis le
 * sujet vidé est supprimé en douce avec une raison automatique. Ses vues s'ajoutent à celles du sujet d'arrivée et ses
 * signalements en attente se ferment. Renvoie l'identifiant du sujet d'arrivée.
 */
export async function mergeTopics(sourceId: string, targetId: string): Promise<ActionResult & { topicId?: string }> {
  const session = await getActiveSession();
  if (!session?.user?.id || !isModerator(session.user.role)) {
    return { success: false, error: "Seuls les modérateurs peuvent fusionner des sujets." };
  }
  const moderatorId = session.user.id;
  if (!targetId || sourceId === targetId) return { success: false, error: "Choisissez un autre sujet." };

  const { roles } = await getForumAccess();
  const select = { id: true, title: true, forumId: true, tournamentId: true, views: true } as const;
  const source = await prisma.topic.findFirst({ where: { id: sourceId, ...topicAccessWhere(roles) }, select });
  const target = await prisma.topic.findFirst({ where: { id: targetId, ...topicAccessWhere(roles) }, select });
  if (!source) return { success: false, error: "Sujet introuvable." };
  if (!target) return { success: false, error: "Le sujet d'arrivée est introuvable." };
  if (source.tournamentId || target.tournamentId) {
    return { success: false, error: "Un sujet de tournoi ne peut pas être fusionné." };
  }

  const reason = `Fusionné avec le sujet « ${target.title} »`;
  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`UPDATE "Post" SET "topicId" = ${targetId} WHERE "topicId" = ${sourceId}`;
    await tx.$executeRaw`UPDATE "Notification" SET "topicId" = ${targetId} WHERE "topicId" = ${sourceId}`;
    await copyReadersAndFollowers(tx, sourceId, targetId);
    // Vues et suppression douce en SQL direct, pour ne pas changer la date de modification des sujets (`updatedAt`)
    await tx.$executeRaw`UPDATE "Topic" SET "views" = COALESCE("views", 0) + ${source.views ?? 0} WHERE "id" = ${targetId}`;
    await tx.$executeRaw`UPDATE "Topic" SET "isDeleted" = true, "deletedAt" = NOW(), "deletedById" = ${moderatorId}, "deletionReason" = ${reason} WHERE "id" = ${sourceId}`;
    await refreshTopicLastPost(targetId, tx);
    await refreshTopicLastPost(sourceId, tx);
  });

  await logModerationAction("TOPIC_MERGED", sourceId, "TOPIC", `Sujet « ${source.title} » fusionné dans « ${target.title} » (${targetId}), puis supprimé`);
  await logModerationAction("TOPIC_MERGED", targetId, "TOPIC", `A reçu les messages du sujet « ${source.title} » (${sourceId})`);
  // Le sujet vidé n'a plus besoin d'être traité : ses signalements en attente se ferment (carte 168)
  await closePendingReports("TOPIC", [sourceId], moderatorId);

  revalidateTopics([source, target]);
  updateTag("home-tournaments");
  return { success: true, topicId: targetId };
}

/**
 * Sujets proposés pour « Fusionner » : recherche par titre (au moins 2 caractères) ou par identifiant exact, parmi les
 * sujets accessibles, non supprimés et sans tournoi, hors du sujet lui-même. 10 au plus, les plus récents d'abord.
 */
export async function searchMergeTargets(topicId: string, query: string) {
  const session = await getActiveSession();
  if (!session?.user?.id || !isModerator(session.user.role)) return [];
  const clean = typeof query === "string" ? query.trim() : "";
  if (clean.length < 2) return [];

  const { roles } = await getForumAccess();
  return prisma.topic.findMany({
    where: {
      ...topicAccessWhere(roles),
      id: { not: topicId },
      tournamentId: null,
      OR: [{ id: clean }, { title: { contains: clean, mode: "insensitive" } }],
    },
    orderBy: { lastPostAt: "desc" },
    take: 10,
    select: { id: true, title: true, lastPostAt: true, forum: { select: { name: true } }, _count: { select: { posts: true } } },
  });
}
