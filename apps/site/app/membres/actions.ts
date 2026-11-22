"use server";

import { getActiveSession } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { canBanMember, canDeleteMember, isAdmin, isModerator } from "@/lib/roles";
import { changeMemberRole } from "@/lib/memberRole";
import { revalidatePath } from "next/cache";
import { logModerationAction } from "@/lib/moderationLog";
import { anonymizeAndDeleteUser } from "@/lib/accountDeletion";
import { closePendingReports } from "@/lib/moderationReports";
import type { ActionResult } from "@/lib/actionResult";

/** Change le rôle d'un membre depuis la liste des membres. Règles et journal : lib/memberRole.ts (carte 221). */
export async function updateUserRole(userId: string, newRole: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user) return { success: false, error: "Non authentifié" };

  const result = await changeMemberRole(session.user.id, userId, newRole);
  if (result.success) revalidatePath("/membres");
  return result;
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

  // Règle commune avec l'écran (lib/roles.ts) : rang inférieur, jamais soi-même ni un compte technique (carte 221)
  if (!canBanMember(me.role, target.role, userId === session.user.id, userId)) {
    return { success: false, error: `Tu ne peux pas ${isBanned ? "bannir" : "débannir"} ce membre.` };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { 
      isBanned,
      banReason: isBanned ? reason || "Non spécifié" : null
    }
  });

  await logModerationAction(
    session.user.id,
    isBanned ? "USER_BANNED" : "USER_UNBANNED",
    userId,
    "USER",
    isBanned ? (reason || "Bannissement de l'utilisateur") : "Débannissement de l'utilisateur"
  );
  // La modération a agi sur ce coach : ses signalements en attente se ferment (carte 221).
  if (isBanned) await closePendingReports("USER", [userId], session.user.id);

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

  if (!me || !isAdmin(me.role)) {
    return { success: false, error: "Seuls les admins peuvent supprimer un compte." };
  }

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true }
  });

  if (!target) return { success: false, error: "Utilisateur cible non trouvé" };

  // Admin ou plus, sur un rang strictement inférieur ; jamais son propre compte (carte 221).
  if (!canDeleteMember(me.role, target.role, userId === session.user.id, userId)) {
    return { success: false, error: "Tu ne peux pas supprimer ce membre (hiérarchie insuffisante)" };
  }

  // Comme la suppression de compte par le membre (deleteAccount) : ses sujets, messages, articles et résultats
  // sont rattachés au compte fantôme « Coach Inconnu » au lieu d'être effacés (lib/accountDeletion.ts).
  const ok = await anonymizeAndDeleteUser(userId, false);
  if (!ok) return { success: false, error: "Erreur lors de la suppression du membre" };

  await logModerationAction(session.user.id, "USER_DELETED", userId, "USER", "Suppression du membre (contenus rattachés au compte fantôme)");

  revalidatePath("/membres");
  return { success: true };
}

