/**
 * Droits de modération dans le forum (carte 225) : la modération du site modère tous les forums ; un membre inscrit
 * comme modérateur d'un forum (table `ForumModerator`, administration > Forums) modère ce forum et ses sous-forums.
 * Les actions de modération du forum (masquer, supprimer, épingler, verrouiller, déplacer, renommer, scinder,
 * fusionner, modifier le message d'un autre) passent toutes par `canModerateForum`. Restent réservés à la modération
 * du site : créer, supprimer et verrouiller un forum, la CDF, l'écran /moderation, le bannissement.
 * Fichier serveur, volontairement sans « use server ».
 */
import { prisma } from "@/lib/prisma";
import { isModerator } from "@/lib/roles";
import { isForumInModeratorScope } from "@/lib/forumModeratorRules";

/** Forums dont le membre est modérateur en propre (sans les sous-forums). */
export async function assignedForumIds(userId: string): Promise<Set<string>> {
  const rows = await prisma.forumModerator.findMany({ where: { userId }, select: { forumId: true } });
  return new Set(rows.map((row) => row.forumId));
}

/** Le membre peut-il modérer le forum `forumId` (modération du site, ou modérateur de ce forum ou d'un parent) ? */
export async function canModerateForum(userId: string | null | undefined, role: string | null | undefined, forumId: string | null | undefined): Promise<boolean> {
  if (isModerator(role)) return true;
  if (!userId || !forumId) return false;
  const assigned = await assignedForumIds(userId);
  if (assigned.size === 0) return false;
  // Remontée des forums parents, une requête par niveau (deux ou trois au plus)
  const parents = new Map<string, string | null>();
  let current: string | null = forumId;
  while (current && !parents.has(current)) {
    const forum: { parentForumId: string | null } | null = await prisma.forum.findUnique({ where: { id: current }, select: { parentForumId: true } });
    parents.set(current, forum?.parentForumId ?? null);
    current = forum?.parentForumId ?? null;
  }
  return isForumInModeratorScope(forumId, assigned, (id) => parents.get(id));
}

/** Même règle pour le forum d'un sujet. */
export async function canModerateTopic(userId: string | null | undefined, role: string | null | undefined, topicId: string): Promise<boolean> {
  if (isModerator(role)) return true;
  if (!userId) return false;
  const topic = await prisma.topic.findUnique({ where: { id: topicId }, select: { forumId: true } });
  return canModerateForum(userId, role, topic?.forumId);
}

/** Même règle pour le forum du sujet d'un message. */
export async function canModeratePost(userId: string | null | undefined, role: string | null | undefined, postId: string): Promise<boolean> {
  if (isModerator(role)) return true;
  if (!userId) return false;
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { topic: { select: { forumId: true } } } });
  return canModerateForum(userId, role, post?.topic.forumId);
}

/**
 * Périmètre de modération du membre, calculé une fois pour toute une page : une fonction qui dit, pour un forum, s'il
 * peut le modérer. Sert à filtrer une liste de forums (déplacer un sujet, créer un sujet) sans une requête par forum.
 */
export async function forumModerationScope(userId: string | null | undefined, role: string | null | undefined): Promise<(forumId: string) => boolean> {
  if (isModerator(role)) return () => true;
  if (!userId) return () => false;
  const assigned = await assignedForumIds(userId);
  if (assigned.size === 0) return () => false;
  const forums = await prisma.forum.findMany({ select: { id: true, parentForumId: true } });
  const parents = new Map(forums.map((forum) => [forum.id, forum.parentForumId]));
  return (forumId) => isForumInModeratorScope(forumId, assigned, (id) => parents.get(id));
}
