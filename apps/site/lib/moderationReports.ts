/**
 * Fermeture automatique des signalements (carte 168).
 * Ce fichier n'est volontairement PAS marqué « use server » : sa fonction n'est appelable que par le code serveur
 * (une fonction exportée d'un fichier « use server » serait appelable par n'importe qui depuis le navigateur).
 */
import { prisma } from "@/lib/prisma";

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
