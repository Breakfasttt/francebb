/**
 * État « non lu » du forum pour un utilisateur, calculé en une seule requête minimale
 * et mémoïsé par requête : partagé entre l'accueil du forum et le compteur de la sidebar.
 * Un topic est non lu si l'utilisateur ne l'a jamais vu ou s'il a bougé depuis sa dernière visite.
 */
import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getUnreadState = cache(async (userId: string) => {
  const topics = await prisma.topic.findMany({
    where: { isArchived: false },
    select: {
      forumId: true,
      updatedAt: true,
      topicViews: { where: { userId }, select: { lastViewedAt: true } },
    },
  });

  const unreadForumIds = new Set<string>();
  let count = 0;
  for (const topic of topics) {
    const view = topic.topicViews[0];
    if (!view || topic.updatedAt > view.lastViewedAt) {
      count++;
      unreadForumIds.add(topic.forumId);
    }
  }
  return { count, unreadForumIds };
});
