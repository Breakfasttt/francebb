/**
 * Ouvrir une notification (carte 167) : `/notifications/<identifiant>` marque la notification comme lue, puis envoie
 * le membre au bon endroit : la bonne page du sujet, sur le message concerné (mention ou réponse suivie), ou la
 * conversation de la messagerie (message privé). Une notification d'un sujet supprimé ou devenu inaccessible, ou qui
 * n'appartient pas au membre connecté, ramène à la liste des notifications.
 * C'est une adresse du serveur (« route ») plutôt qu'une page : elle ne fait que rediriger. La liste l'appelle par un
 * lien ordinaire, que le navigateur ne charge pas à l'avance.
 */
import { NextResponse } from "next/server";
import { getActiveSession } from "@/lib/authGuard";
import { getForumAccess } from "@/lib/forumAccess";
import { prisma } from "@/lib/prisma";
import { visibleNotificationsWhere } from "@/lib/notifications";
import { forumPostHref } from "@/lib/forumPostLink";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const to = (path: string) => NextResponse.redirect(new URL(path, request.url));

  const session = await getActiveSession();
  const userId = session?.user?.id;
  if (!userId) return to("/auth/login?callbackUrl=/notifications");

  const { roles } = await getForumAccess();
  const notification = await prisma.notification.findFirst({
    where: { id, ...visibleNotificationsWhere(userId, roles) },
    select: { id: true, readAt: true, topicId: true, postId: true, conversationId: true },
  });
  if (!notification) return to("/notifications");

  if (!notification.readAt) {
    await prisma.notification.update({ where: { id: notification.id }, data: { readAt: new Date() } });
  }

  if (notification.conversationId) return to(`/messagerie?id=${encodeURIComponent(notification.conversationId)}`);
  if (notification.topicId && notification.postId) return to(await forumPostHref(notification.topicId, notification.postId));
  if (notification.topicId) return to(`/forum/topic/${notification.topicId}`);
  return to("/notifications");
}
