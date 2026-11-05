/**
 * Notifications du site (carte 167) : ce qui s'affiche sous la cloche de la barre et sur la page `/notifications`.
 * Trois types :
 * - MENTION : un membre vous mentionne (`[mention=…]`) dans un nouveau sujet, une réponse ou un message modifié ;
 * - FOLLOWED_REPLY : une réponse dans un sujet que vous suivez ;
 * - PRIVATE_MESSAGE : un message privé dans l'une de vos conversations ;
 * - TOURNAMENT_PROMOTED : une place s'est libérée dans un tournoi, vous passez de la liste d'attente aux pré-inscrits
 *   (carte 186) ;
 * - TOURNAMENT_FORMAT_CHANGED : l'organisateur a changé le format d'un tournoi (individuel ou par équipes), votre
 *   inscription a été supprimée (carte 186).
 * Les deux notifications de tournoi n'envoient pas d'e-mail.
 * Les réponses d'un même sujet suivi et les messages d'une même conversation sont regroupés : tant que la notification
 * de ce sujet ou de cette conversation n'est pas lue, aucune autre n'est créée.
 *
 * Qui est prévenu : jamais l'auteur lui-même, ni un membre banni, ni un membre qui n'a pas accès au forum du sujet,
 * ni un membre qui a bloqué l'auteur (ou que l'auteur a bloqué). Au plus 10 mentions par message (lib/mentionRules.ts).
 *
 * E-mails : les mentions n'envoient plus d'e-mail. Les réponses dans un sujet suivi et les messages privés envoient
 * toujours un e-mail aux membres qui l'acceptent dans leur profil. Ces e-mails partent avec `after()` de Next.js :
 * le serveur répond d'abord au membre, puis attend la fin des envois avant de s'arrêter (auparavant, ils étaient
 * lancés sans attendre, et l'hébergeur pouvait arrêter le serveur avant leur départ).
 *
 * Fichier volontairement PAS « use server » : ces fonctions ne sont appelées que par les actions du forum et de la
 * messagerie, après leurs propres contrôles.
 */
import { after } from "next/server";
import type { Prisma } from "@/prisma/generated-client";
import { prisma, prismaWithEmail } from "@/lib/prisma";
import { sendFollowNotification, sendPmNotification } from "@/lib/mail";
import { accessibleRolesFor, canAccessForum, loadRolePowers, topicAccessWhere } from "@/lib/forumAccess";
import { extractMentionIds } from "@/lib/mentionRules";

export const NOTIFICATION_TYPE = {
  MENTION: "MENTION",
  FOLLOWED_REPLY: "FOLLOWED_REPLY",
  PRIVATE_MESSAGE: "PRIVATE_MESSAGE",
  TOURNAMENT_PROMOTED: "TOURNAMENT_PROMOTED",
  TOURNAMENT_FORMAT_CHANGED: "TOURNAMENT_FORMAT_CHANGED",
} as const;

/** Forum d'un sujet, avec ce qu'il faut pour savoir qui y a accès (voir FORUM_ACCESS_SELECT de lib/forumAccess.ts). */
type ForumNode = Parameters<typeof canAccessForum>[0];

/**
 * Garde, parmi `candidateIds`, les membres qui peuvent être prévenus d'un message de `authorId` dans `forum` :
 * pas l'auteur, pas banni, avec accès au forum, et sans blocage entre eux et l'auteur (dans un sens ou dans l'autre).
 */
async function filterForumRecipients(candidateIds: string[], authorId: string, forum: ForumNode): Promise<string[]> {
  const ids = candidateIds.filter((id) => id !== authorId);
  if (ids.length === 0) return [];

  // Requêtes l'une après l'autre, ici comme dans tout ce fichier : la base locale de développement ne sert qu'une
  // requête à la fois
  const users = await prisma.user.findMany({ where: { id: { in: ids }, isBanned: false }, select: { id: true, role: true } });
  const blocks = await prisma.block.findMany({
    where: {
      OR: [
        { blockerId: { in: ids }, blockedId: authorId },
        { blockerId: authorId, blockedId: { in: ids } },
      ],
    },
    select: { blockerId: true, blockedId: true },
  });
  const powers = await loadRolePowers();
  const blocked = new Set(blocks.map((block) => (block.blockerId === authorId ? block.blockedId : block.blockerId)));
  return users
    .filter((user) => !blocked.has(user.id) && canAccessForum(forum, accessibleRolesFor(user.role, powers)))
    .map((user) => user.id);
}

/**
 * Lit les mentions d'un message du forum et prévient les membres mentionnés (notification MENTION, sans e-mail).
 * Appelée à la création d'un sujet, d'une réponse et à la modification d'un message : un membre déjà mentionné dans
 * ce message (ligne de la table Mention) n'est pas prévenu une deuxième fois. Renvoie les membres prévenus.
 */
export async function notifyMentions(params: {
  postId: string;
  topicId: string;
  forum: ForumNode;
  authorId: string;
  content: string;
}): Promise<string[]> {
  const { postId, topicId, forum, authorId, content } = params;
  const candidateIds = extractMentionIds(content, authorId);
  if (candidateIds.length === 0) return [];

  const already = await prisma.mention.findMany({
    where: { postId, mentionedUserId: { in: candidateIds } },
    select: { mentionedUserId: true },
  });
  const alreadyIds = new Set(already.map((mention) => mention.mentionedUserId));
  const recipients = await filterForumRecipients(candidateIds.filter((id) => !alreadyIds.has(id)), authorId, forum);
  if (recipients.length === 0) return [];

  await prisma.mention.createMany({
    data: recipients.map((userId) => ({ postId, mentionedUserId: userId, mentionerId: authorId })),
    skipDuplicates: true,
  });
  await prisma.notification.createMany({
    data: recipients.map((userId) => ({ userId, type: NOTIFICATION_TYPE.MENTION, topicId, postId, actorId: authorId })),
  });
  return recipients;
}

/**
 * Prévient les abonnés d'un sujet d'une nouvelle réponse : une notification FOLLOWED_REPLY (sauf s'ils en ont déjà
 * une non lue pour ce sujet, ou s'ils viennent d'être mentionnés dans cette réponse), et un e-mail à ceux qui
 * l'acceptent (`notifFollowedTopic`). Comme avant la carte 167, un seul e-mail tant que l'abonné n'est pas revenu :
 * il n'est envoyé que si l'abonné avait lu le sujet jusqu'au message précédent (`previousLastPostAt`), ou ne l'a jamais ouvert.
 */
export async function notifyFollowers(params: {
  postId: string;
  topic: { id: string; title: string; previousLastPostAt: Date };
  forum: ForumNode;
  author: { id: string; name: string };
  skipUserIds: string[];
}): Promise<void> {
  const { postId, topic, forum, author, skipUserIds } = params;
  const follows = await prisma.topicFollow.findMany({
    where: { topicId: topic.id, userId: { not: author.id } },
    select: { userId: true },
  });
  const recipients = await filterForumRecipients(follows.map((follow) => follow.userId), author.id, forum);
  if (recipients.length === 0) return;

  // Notifications dans le site
  const skipped = new Set(skipUserIds);
  const pending = await prisma.notification.findMany({
    where: { topicId: topic.id, type: NOTIFICATION_TYPE.FOLLOWED_REPLY, readAt: null, userId: { in: recipients } },
    select: { userId: true },
  });
  for (const notification of pending) skipped.add(notification.userId);
  const toNotify = recipients.filter((userId) => !skipped.has(userId));
  if (toNotify.length > 0) {
    await prisma.notification.createMany({
      data: toNotify.map((userId) => ({
        userId,
        type: NOTIFICATION_TYPE.FOLLOWED_REPLY,
        topicId: topic.id,
        postId,
        actorId: author.id,
      })),
    });
  }

  // E-mails
  const mailUsers = await prismaWithEmail.user.findMany({
    where: { id: { in: recipients }, notifFollowedTopic: true, email: { not: null } },
    select: { id: true, email: true },
  });
  const views = await prisma.topicView.findMany({
    where: { topicId: topic.id, userId: { in: recipients } },
    select: { userId: true, lastReadPostAt: true },
  });
  const lastReadByUser = new Map(views.map((view) => [view.userId, view.lastReadPostAt]));
  const emails = mailUsers
    .filter((user) => {
      const lastReadPostAt = lastReadByUser.get(user.id);
      return !lastReadPostAt || lastReadPostAt >= topic.previousLastPostAt;
    })
    .map((user) => user.email as string);
  if (emails.length > 0) {
    after(async () => {
      for (const email of emails) await sendFollowNotification(email, author.name, topic.title, topic.id);
    });
  }
}

/**
 * Abonnement automatique (carte 167) : le membre suit le sujet qu'il vient de créer ou auquel il vient de répondre,
 * sauf s'il a désactivé « Suivre automatiquement mes sujets » dans son profil (`autoFollowTopics`).
 */
export async function followTopicAutomatically(userId: string, topicId: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { autoFollowTopics: true } });
  if (!user?.autoFollowTopics) return;
  await prisma.topicFollow.createMany({ data: [{ userId, topicId }], skipDuplicates: true });
}

/**
 * Prévient les autres participants d'une conversation d'un nouveau message privé : une notification PRIVATE_MESSAGE
 * par conversation (aucune nouvelle tant que la précédente n'est pas lue), et un e-mail à ceux qui l'acceptent
 * (`notifPm`), seulement pour le premier message non lu (pour ne pas envoyer un e-mail par message).
 */
export async function notifyPrivateMessage(params: {
  conversationId: string;
  author: { id: string; name: string };
  preview: string;
  recipients: { userId: string; lastReadAt: Date | null }[];
}): Promise<void> {
  const { conversationId, author, preview, recipients } = params;
  const recipientIds = recipients.map((recipient) => recipient.userId).filter((id) => id !== author.id);
  if (recipientIds.length === 0) return;

  const pending = await prisma.notification.findMany({
    where: { conversationId, type: NOTIFICATION_TYPE.PRIVATE_MESSAGE, readAt: null, userId: { in: recipientIds } },
    select: { userId: true },
  });
  const pendingIds = new Set(pending.map((notification) => notification.userId));
  const toNotify = recipientIds.filter((userId) => !pendingIds.has(userId));
  if (toNotify.length > 0) {
    await prisma.notification.createMany({
      data: toNotify.map((userId) => ({ userId, type: NOTIFICATION_TYPE.PRIVATE_MESSAGE, conversationId, actorId: author.id })),
    });
  }

  const mailUsers = await prismaWithEmail.user.findMany({
    where: { id: { in: recipientIds }, notifPm: true, email: { not: null } },
    select: { id: true, email: true },
  });
  const emails: string[] = [];
  for (const user of mailUsers) {
    // Premier message non lu pour ce participant : on compte les messages des autres écrits après sa propre date de
    // lecture (carte 170)
    const lastReadAt = recipients.find((recipient) => recipient.userId === user.id)?.lastReadAt;
    const unread = await prisma.privateMessage.count({
      where: { conversationId, authorId: { not: user.id }, ...(lastReadAt ? { createdAt: { gt: lastReadAt } } : {}) },
    });
    if (unread === 1) emails.push(user.email as string);
  }
  if (emails.length > 0) {
    after(async () => {
      for (const email of emails) await sendPmNotification(email, author.name, preview, conversationId);
    });
  }
}

/**
 * Prévient des membres d'un événement de leur tournoi (carte 186), sans e-mail : montée de la liste d'attente
 * (TOURNAMENT_PROMOTED) ou suppression des inscriptions après un changement de format (TOURNAMENT_FORMAT_CHANGED).
 * La notification mène au sujet du tournoi. Jamais l'auteur du changement lui-même, ni un membre banni.
 */
export async function notifyTournamentMembers(params: {
  userIds: string[];
  topicId: string | null | undefined;
  type: typeof NOTIFICATION_TYPE.TOURNAMENT_PROMOTED | typeof NOTIFICATION_TYPE.TOURNAMENT_FORMAT_CHANGED;
  actorId?: string | null;
}): Promise<void> {
  const { topicId, type, actorId = null } = params;
  const ids = [...new Set(params.userIds)].filter((id) => id !== actorId);
  if (!topicId || ids.length === 0) return;
  const users = await prisma.user.findMany({ where: { id: { in: ids }, isBanned: false }, select: { id: true } });
  if (users.length === 0) return;
  await prisma.notification.createMany({
    data: users.map((user) => ({ userId: user.id, type, topicId, actorId })),
  });
}

/**
 * Notifications que le membre peut voir : celles d'un sujet supprimé ou devenu inaccessible à son rôle (forum
 * réservé, sujet déplacé) ne s'affichent pas. `roles` vient de getForumAccess() (lib/forumAccess.ts).
 */
export function visibleNotificationsWhere(userId: string, roles: string[]): Prisma.NotificationWhereInput {
  return { userId, OR: [{ topicId: null }, { topic: topicAccessWhere(roles) }] };
}

/** Nombre de notifications non lues et visibles, pour la pastille de la cloche. */
export function countUnreadNotifications(userId: string, roles: string[]): Promise<number> {
  return prisma.notification.count({ where: { ...visibleNotificationsWhere(userId, roles), readAt: null } });
}

/**
 * Marque comme lues les notifications d'un sujet dont le message a été vu, c'est-à-dire écrit au plus tard à la date
 * `readUpTo` (la position de lecture du membre). Appelée quand le membre lit le sujet.
 */
export async function markTopicNotificationsRead(userId: string, topicId: string, readUpTo: Date): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, topicId, readAt: null, post: { createdAt: { lte: readUpTo } } },
    data: { readAt: new Date() },
  });
}

/** Marque comme lue la notification d'une conversation, quand le membre l'ouvre. */
export async function markConversationNotificationsRead(userId: string, conversationId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, conversationId, readAt: null },
    data: { readAt: new Date() },
  });
}
