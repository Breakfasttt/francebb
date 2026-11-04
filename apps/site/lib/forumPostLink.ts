/**
 * Adresse d'un message du forum : la bonne page de son sujet, avec l'ancre qui fait défiler jusqu'au message
 * (« /forum/topic/<sujet>?page=3#post-<message> »). Les messages sont classés par date puis par identifiant, comme
 * sur la page d'un sujet (app/forum/topic/[id]/page.tsx), à raison de TOPIC_POSTS_PER_PAGE par page.
 * Créé pour les notifications (carte 167). Depuis la carte 169, la page d'un sujet, la recherche, la modification d'un
 * message, l'écran de modération et le lien permanent `/forum/post/<message>` passent tous par ces fonctions.
 */
import { prisma } from "@/lib/prisma";

export const TOPIC_POSTS_PER_PAGE = 20;

/** Page du sujet où se trouve ce message : on compte les messages placés avant lui, dans l'ordre de la page. */
export async function forumPostPage(topicId: string, post: { id: string; createdAt: Date }): Promise<number> {
  const countBefore = await prisma.post.count({
    where: {
      topicId,
      OR: [{ createdAt: { lt: post.createdAt } }, { createdAt: post.createdAt, id: { lt: post.id } }],
    },
  });
  return Math.floor(countBefore / TOPIC_POSTS_PER_PAGE) + 1;
}

/** Adresse d'un message dont on connaît déjà la date de création (aucune requête pour relire le message). */
export async function forumPostHrefFor(topicId: string, post: { id: string; createdAt: Date }): Promise<string> {
  return `/forum/topic/${topicId}?page=${await forumPostPage(topicId, post)}#post-${post.id}`;
}

export async function forumPostHref(topicId: string, postId: string): Promise<string> {
  const post = await prisma.post.findFirst({ where: { id: postId, topicId }, select: { id: true, createdAt: true } });
  if (!post) return `/forum/topic/${topicId}`;
  return forumPostHrefFor(topicId, post);
}
