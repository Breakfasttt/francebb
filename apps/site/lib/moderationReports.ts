/**
 * Fermeture des signalements (cartes 168 et 223) et visibilité de ce qu'on signale (carte 221).
 * Ce fichier n'est volontairement PAS marqué « use server » : sa fonction n'est appelable que par le code serveur
 * (une fonction exportée d'un fichier « use server » serait appelable par n'importe qui depuis le navigateur).
 */
import { prisma } from "@/lib/prisma";
import { topicAccessWhere } from "@/lib/forumAccess";
import type { ReportTargetType } from "@/lib/reportRules";
import { NOTIFICATION_TYPE } from "@/lib/notifications";

/**
 * Ferme les signalements en attente qui répondent à `where`, puis prévient chaque membre qui avait signalé
 * (carte 223) : « Ton signalement a été traité », une notification par membre, sans dire la décision prise.
 * Le membre qui ferme le signalement n'est pas prévenu de son propre geste.
 */
export async function closeReports(
  where: { targetType: string; targetId: string | { in: string[] } },
  status: "RESOLVED" | "IGNORED",
  resolvedById: string,
): Promise<void> {
  const pending = { ...where, status: "PENDING" };
  const reporters = await prisma.moderationReport.findMany({ where: pending, select: { reporterId: true }, distinct: ["reporterId"] });
  await prisma.moderationReport.updateMany({ where: pending, data: { status, resolvedById, resolvedAt: new Date() } });
  const toNotify = reporters.map((report) => report.reporterId).filter((id) => id !== resolvedById);
  if (toNotify.length === 0) return;
  // Le contenu signalé, quand la notification peut y mener : sujet (d'un sujet ou d'un message) ou conversation
  const ids = typeof where.targetId === "string" ? [where.targetId] : where.targetId.in;
  const link = ids.length !== 1 ? {} : await reportLink(where.targetType, ids[0]);
  await prisma.notification.createMany({ data: toNotify.map((userId) => ({ userId, type: NOTIFICATION_TYPE.REPORT_HANDLED, ...link })) });
}

/** Sujet ou conversation d'un contenu signalé, pour la notification « signalement traité » (carte 223). */
async function reportLink(targetType: string, targetId: string): Promise<{ topicId?: string; conversationId?: string }> {
  if (targetType === "TOPIC") {
    const topic = await prisma.topic.findUnique({ where: { id: targetId }, select: { id: true } });
    return topic ? { topicId: topic.id } : {};
  }
  if (targetType === "POST") {
    const post = await prisma.post.findUnique({ where: { id: targetId }, select: { topicId: true } });
    return post ? { topicId: post.topicId } : {};
  }
  if (targetType === "CONVERSATION") {
    const conversation = await prisma.conversation.findUnique({ where: { id: targetId }, select: { id: true } });
    return conversation ? { conversationId: conversation.id } : {};
  }
  return {};
}

/**
 * Ferme, comme « traités » (statut RESOLVED), les signalements encore en attente d'un ou de plusieurs contenus.
 * Appelée quand la modération a déjà agi sur le contenu : message masqué, message ou sujet supprimé. Le modérateur
 * n'a ainsi plus à revenir dans l'écran de modération pour fermer le signalement à la main.
 * `resolvedById` est le membre qui a agi sur le contenu. L'action elle-même est déjà écrite au journal par
 * l'appelant : aucune ligne de plus n'y est ajoutée.
 */
export async function closePendingReports(targetType: string, targetIds: string[], resolvedById: string) {
  if (targetIds.length === 0) return;
  await closeReports({ targetType, targetId: { in: targetIds } }, "RESOLVED", resolvedById);
}

/**
 * Le membre voit-il ce qu'il signale (carte 221) ? Un signalement ne doit pas servir à deviner l'existence d'un
 * message d'un forum réservé, d'un sujet supprimé ou d'un article masqué. `roles` : rôles accessibles au membre
 * (getForumAccess). Les modérateurs voient tout, mais n'ont pas besoin de signaler : on applique la même règle.
 */
export async function canSeeReportTarget(input: {
  reporterId: string;
  targetType: ReportTargetType;
  targetId: string;
  roles: string[];
}): Promise<boolean> {
  const { targetId, roles } = input;
  switch (input.targetType) {
    case "POST":
      return !!(await prisma.post.findFirst({
        where: { id: targetId, isDeleted: false, topic: topicAccessWhere(roles) },
        select: { id: true },
      }));
    case "TOPIC":
      return !!(await prisma.topic.findFirst({ where: { id: targetId, ...topicAccessWhere(roles) }, select: { id: true } }));
    case "USER":
      return !!(await prisma.user.findUnique({ where: { id: targetId }, select: { id: true } }));
    case "ARTICLE":
      return !!(await prisma.article.findFirst({
        where: { id: targetId, OR: [{ isModerated: false }, { authorId: input.reporterId }] },
        select: { id: true },
      }));
    case "LIGUE":
      return !!(await prisma.ligue.findUnique({ where: { id: targetId }, select: { id: true } }));
    case "CONVERSATION":
      // Seul un participant encore présent signale sa conversation (carte 223)
      return !!(await prisma.conversationParticipant.findFirst({
        where: { conversationId: targetId, userId: input.reporterId, deletedAt: null },
        select: { id: true },
      }));
  }
}
