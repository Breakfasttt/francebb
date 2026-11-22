/**
 * Fermeture automatique des signalements (carte 168).
 * Ce fichier n'est volontairement PAS marqué « use server » : sa fonction n'est appelable que par le code serveur
 * (une fonction exportée d'un fichier « use server » serait appelable par n'importe qui depuis le navigateur).
 */
import { prisma } from "@/lib/prisma";
import { topicAccessWhere } from "@/lib/forumAccess";
import type { ReportTargetType } from "@/lib/reportRules";

/**
 * Ferme, comme « traités » (statut RESOLVED), les signalements encore en attente d'un ou de plusieurs contenus.
 * Appelée quand la modération a déjà agi sur le contenu : message masqué, message ou sujet supprimé. Le modérateur
 * n'a ainsi plus à revenir dans l'écran de modération pour fermer le signalement à la main.
 * `resolvedById` est le membre qui a agi sur le contenu. L'action elle-même est déjà écrite au journal par
 * l'appelant : aucune ligne de plus n'y est ajoutée.
 */
export async function closePendingReports(targetType: string, targetIds: string[], resolvedById: string) {
  if (targetIds.length === 0) return;
  await prisma.moderationReport.updateMany({
    where: { targetType, targetId: { in: targetIds }, status: "PENDING" },
    data: { status: "RESOLVED", resolvedById, resolvedAt: new Date() },
  });
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
  }
}
