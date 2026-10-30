"use server";

import { getActiveSession } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { canEditTargetRole, ROLE_POWER, UserRole, isModerator } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import { logModerationAction } from "@/lib/moderationLog";
import { anonymizeAndDeleteUser } from "@/lib/accountDeletion";
import type { ActionResult } from "@/lib/actionResult";

export async function updateUserRole(userId: string, newRole: UserRole): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user) return { success: false, error: "Non authentifié" };

  const me = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!me) return { success: false, error: "Utilisateur non trouvé" };

  const target = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!target) return { success: false, error: "Cible non trouvée" };

  if (!canEditTargetRole(me.role as UserRole, target.role as UserRole)) {
    return { success: false, error: "Permissions insuffisantes pour modifier cet utilisateur" };
  }

  if (ROLE_POWER[newRole] >= ROLE_POWER[me.role as UserRole] && me.role !== "SUPERADMIN") {
    return { success: false, error: "Vous ne pouvez pas attribuer un rôle supérieur ou égal au vôtre" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole }
  });

  revalidatePath("/membres");
  return { success: true };
}

/**
 * Bannit ou débannit un membre. Seule version de cette action (liste des membres, fiche /spy, et onglet
 * « Coachs bannis » de /moderation via unbanUserAction) : réservée aux modérateurs, qui ne peuvent agir que sur
 * un rang inférieur au leur (sauf Super Admin), et tracée au journal.
 */
export async function toggleBanUser(userId: string, isBanned: boolean, reason?: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user) return { success: false, error: "Non authentifié" };

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (!me || !isModerator(me.role)) {
    return { success: false, error: "Permissions insuffisantes pour cette action" };
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });

  if (!target) return { success: false, error: "Utilisateur cible non trouvé" };

  if (!canEditTargetRole(me.role as UserRole, target.role as UserRole) && me.role !== "SUPERADMIN") {
    return { success: false, error: `Vous ne pouvez pas ${isBanned ? "bannir" : "débannir"} ce membre (hiérarchie insuffisante)` };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { 
      isBanned,
      banReason: isBanned ? reason || "Non spécifié" : null
    }
  });

  await logModerationAction(
    isBanned ? "USER_BANNED" : "USER_UNBANNED",
    userId,
    "USER",
    isBanned ? (reason || "Bannissement de l'utilisateur") : "Débannissement de l'utilisateur"
  );

  revalidatePath("/membres");
  revalidatePath(`/spy/${userId}`);
  return { success: true };
}

export async function deleteUser(userId: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user) return { success: false, error: "Non authentifié" };

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (!me || !isModerator(me.role)) {
    return { success: false, error: "Permissions insuffisantes pour supprimer un utilisateur" };
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });

  if (!target) return { success: false, error: "Utilisateur cible non trouvé" };

  if (!canEditTargetRole(me.role as UserRole, target.role as UserRole) && me.role !== "SUPERADMIN") {
    return { success: false, error: "Vous ne pouvez pas supprimer ce membre (hiérarchie insuffisante)" };
  }

  // Comme la suppression de compte par le membre (deleteAccount) : ses sujets, messages, articles et résultats
  // sont rattachés au compte fantôme « Coach Inconnu » au lieu d'être effacés (lib/accountDeletion.ts).
  const ok = await anonymizeAndDeleteUser(userId, false);
  if (!ok) return { success: false, error: "Erreur lors de la suppression du membre" };

  await logModerationAction("USER_DELETED", userId, "USER", "Suppression du membre (contenus rattachés au compte fantôme)");

  revalidatePath("/membres");
  return { success: true };
}

