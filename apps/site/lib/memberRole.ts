/**
 * Changement du rôle d'un membre, partagé par les deux actions serveur qui le proposent (carte 221) :
 * `updateUserRole` (liste des membres) et `updateCoachRole` (onglet Coachs de l'administration).
 * Fichier sans « use server » : appelable seulement par du code serveur, qui lui passe le membre connecté.
 */
import { prisma } from "@/lib/prisma";
import { roleChangeRefusal } from "@/lib/roles";
import { logModerationAction } from "@/lib/moderationLog";
import type { ActionResult } from "@/lib/actionResult";

export async function changeMemberRole(actorId: string, targetId: string, newRole: string): Promise<ActionResult> {
  // Le rôle de l'auteur est relu en base : la session pourrait dater d'avant un changement.
  const [actor, target, roleConfig] = await Promise.all([
    prisma.user.findUnique({ where: { id: actorId }, select: { role: true } }),
    prisma.user.findUnique({ where: { id: targetId }, select: { role: true } }),
    typeof newRole === "string" ? prisma.roleConfig.findUnique({ where: { name: newRole }, select: { name: true } }) : null,
  ]);
  if (!actor) return { success: false, error: "Non authentifié" };
  if (!target) return { success: false, error: "Membre introuvable." };

  const refusal = roleChangeRefusal({
    actorId,
    actorRole: actor.role,
    targetId,
    targetRole: target.role,
    newRole,
    newRoleExists: !!roleConfig,
  });
  if (refusal) return { success: false, error: refusal };
  if (target.role === newRole) return { success: true };

  await prisma.user.update({ where: { id: targetId }, data: { role: newRole } });
  await logModerationAction(actorId, "USER_ROLE_CHANGED", targetId, "USER", `Changement de rôle : ${target.role} → ${newRole}`);
  return { success: true };
}
