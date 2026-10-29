"use server";

import { getActiveSession } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { canEditTargetRole, ROLE_POWER, UserRole, isModerator } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import { logModerationAction } from "@/lib/moderationLog";
import { anonymizeAndDeleteUser } from "@/lib/accountDeletion";

export async function updateUserRole(userId: string, newRole: UserRole) {
  const session = await getActiveSession();
  if (!session?.user) throw new Error("Non authentifié");

  const me = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!me) throw new Error("Utilisateur non trouvé");

  const target = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!target) throw new Error("Cible non trouvée");

  if (!canEditTargetRole(me.role as UserRole, target.role as UserRole)) {
    throw new Error("Permissions insuffisantes pour modifier cet utilisateur");
  }

  if (ROLE_POWER[newRole] >= ROLE_POWER[me.role as UserRole] && me.role !== "SUPERADMIN") {
    throw new Error("Vous ne pouvez pas attribuer un rôle supérieur ou égal au vôtre");
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
export async function toggleBanUser(userId: string, isBanned: boolean, reason?: string) {
  const session = await getActiveSession();
  if (!session?.user) throw new Error("Non authentifié");

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (!me || !isModerator(me.role)) {
    throw new Error("Permissions insuffisantes pour cette action");
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });

  if (!target) throw new Error("Utilisateur cible non trouvé");

  if (!canEditTargetRole(me.role as UserRole, target.role as UserRole) && me.role !== "SUPERADMIN") {
    throw new Error(`Vous ne pouvez pas ${isBanned ? "bannir" : "débannir"} ce membre (hiérarchie insuffisante)`);
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

export async function deleteUser(userId: string) {
  const session = await getActiveSession();
  if (!session?.user) throw new Error("Non authentifié");

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  });

  if (!me || !isModerator(me.role)) {
    throw new Error("Permissions insuffisantes pour supprimer un utilisateur");
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });

  if (!target) throw new Error("Utilisateur cible non trouvé");

  if (!canEditTargetRole(me.role as UserRole, target.role as UserRole) && me.role !== "SUPERADMIN") {
    throw new Error("Vous ne pouvez pas supprimer ce membre (hiérarchie insuffisante)");
  }

  // Comme la suppression de compte par le membre (deleteAccount) : ses sujets, messages, articles et résultats
  // sont rattachés au compte fantôme « Coach Inconnu » au lieu d'être effacés (lib/accountDeletion.ts).
  const ok = await anonymizeAndDeleteUser(userId, false);
  if (!ok) throw new Error("Erreur lors de la suppression du membre");

  await logModerationAction("USER_DELETED", userId, "USER", "Suppression du membre (contenus rattachés au compte fantôme)");

  revalidatePath("/membres");
  return { success: true };
}

