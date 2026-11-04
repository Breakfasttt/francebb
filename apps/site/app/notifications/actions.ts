/**
 * Actions serveur de la page des notifications (carte 167) : lire la liste du membre connecté et tout marquer comme lu.
 * La création des notifications se fait dans lib/notifications.ts, appelée par le forum et la messagerie.
 */
"use server";

import { revalidatePath } from "next/cache";
import { getActiveSession } from "@/lib/authGuard";
import { getForumAccess } from "@/lib/forumAccess";
import { prisma } from "@/lib/prisma";
import { visibleNotificationsWhere } from "@/lib/notifications";
import type { ActionResult } from "@/lib/actionResult";

const NOTIFICATIONS_PER_PAGE = 30;

/**
 * Une page de notifications du membre connecté, de la plus récente à la plus ancienne, sans celles d'un sujet supprimé
 * ou devenu inaccessible. Renvoie null pour un visiteur non connecté.
 */
export async function getNotifications(page = 1) {
  const session = await getActiveSession();
  const userId = session?.user?.id;
  if (!userId) return null;

  const { roles } = await getForumAccess();
  const where = visibleNotificationsWhere(userId, roles);
  // Requêtes l'une après l'autre : la base locale de développement ne sert qu'une requête à la fois
  const total = await prisma.notification.count({ where });
  const unread = await prisma.notification.count({ where: { ...where, readAt: null } });
  const notifications = await prisma.notification.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * NOTIFICATIONS_PER_PAGE,
    take: NOTIFICATIONS_PER_PAGE,
    select: {
      id: true,
      type: true,
      readAt: true,
      createdAt: true,
      actor: { select: { name: true, image: true } },
      topic: { select: { title: true } },
      conversation: { select: { name: true, isGroup: true } },
    },
  });
  return { notifications, total, unread, totalPages: Math.max(1, Math.ceil(total / NOTIFICATIONS_PER_PAGE)) };
}

/** Marque comme lues toutes les notifications du membre connecté. */
export async function markAllNotificationsRead(): Promise<ActionResult> {
  const session = await getActiveSession();
  const userId = session?.user?.id;
  if (!userId) return { success: false, error: "Vous devez être connecté." };

  await prisma.notification.updateMany({ where: { userId, readAt: null }, data: { readAt: new Date() } });
  revalidatePath("/notifications");
  return { success: true };
}
