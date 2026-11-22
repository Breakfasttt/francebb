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
import { banDurationLabel, banEndDate, formatBanEnd, parseBanDuration } from "@/lib/banDuration";
import { NOTIFICATION_TYPE } from "@/lib/notifications";

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
 * `durationDays` (carte 222) : 1, 7 ou 30 jours pour un bannissement temporaire, levé à la première visite du membre
 * après la date de fin (callback jwt d'auth.ts) ; absent ou `null` pour un bannissement définitif.
 */
export async function toggleBanUser(userId: string, isBanned: boolean, reason?: string, durationDays?: number | null): Promise<ActionResult> {
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

  const days = isBanned ? parseBanDuration(durationDays) : null;
  if (days === undefined) return { success: false, error: "Choisis une durée : 1, 7 ou 30 jours, ou définitif." };
  const bannedUntil = banEndDate(days, new Date());

  await prisma.user.update({
    where: { id: userId },
    data: {
      isBanned,
      banReason: isBanned ? reason || "Non spécifié" : null,
      bannedUntil: isBanned ? bannedUntil : null,
    }
  });

  const banDetails = reason || "Bannissement de l'utilisateur";
  await logModerationAction(
    session.user.id,
    !isBanned ? "USER_UNBANNED" : bannedUntil ? "USER_TEMP_BANNED" : "USER_BANNED",
    userId,
    "USER",
    !isBanned
      ? "Débannissement de l'utilisateur"
      : bannedUntil
        ? `${banDurationLabel(days)}, jusqu'au ${formatBanEnd(bannedUntil)} : ${banDetails}`
        : banDetails
  );
  // La modération a agi sur ce coach : ses signalements en attente se ferment (carte 221).
  if (isBanned) await closePendingReports("USER", [userId], session.user.id);

  revalidatePath("/membres");
  revalidatePath(`/spy/${userId}`);
  return { success: true };
}

/** Longueur maximale du motif d'un avertissement. */
const WARNING_REASON_MAX = 1000;

/**
 * Avertit un membre (carte 222) : un premier pas avant le bannissement. Mêmes règles que le bannissement
 * (`canBanMember`). Le membre reçoit une notification sans le nom du modérateur et lit le motif sur son profil ;
 * l'avertissement est tracé au journal de modération.
 */
export async function warnUser(userId: string, reason: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user) return { success: false, error: "Non authentifié" };
  const text = typeof reason === "string" ? reason.trim() : "";
  if (!text) return { success: false, error: "Écris le motif de l'avertissement." };
  if (text.length > WARNING_REASON_MAX) return { success: false, error: `Le motif dépasse ${WARNING_REASON_MAX} caractères.` };
  if (typeof userId !== "string") return { success: false, error: "Utilisateur cible non trouvé" };

  const [me, target] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { role: true } }),
  ]);
  if (!me || !isModerator(me.role)) return { success: false, error: "Permissions insuffisantes pour cette action" };
  if (!target) return { success: false, error: "Utilisateur cible non trouvé" };
  if (!canBanMember(me.role, target.role, userId === session.user.id, userId)) {
    return { success: false, error: "Tu ne peux pas avertir ce membre." };
  }

  await prisma.$transaction([
    prisma.userWarning.create({ data: { userId, moderatorId: session.user.id, reason: text } }),
    prisma.notification.create({ data: { userId, type: NOTIFICATION_TYPE.USER_WARNED } }),
  ]);
  await logModerationAction(session.user.id, "USER_WARNED", userId, "USER", text);

  revalidatePath(`/spy/${userId}`);
  return { success: true };
}

export interface MemberWarning {
  id: string;
  reason: string;
  createdAt: Date;
  /** Pseudo du modérateur, donné seulement à la modération. */
  moderatorName: string | null;
}

/**
 * Avertissements d'un membre, du plus récent au plus ancien (carte 222). Le membre lui-même les voit sans le nom du
 * modérateur ; la modération les voit tous, avec ce nom. Les autres membres ne reçoivent rien.
 */
export async function getMemberWarnings(userId: string): Promise<MemberWarning[]> {
  const session = await getActiveSession();
  if (!session?.user?.id || typeof userId !== "string") return [];
  const isSelf = session.user.id === userId;
  const isModo = isModerator(session.user.role);
  if (!isSelf && !isModo) return [];

  const warnings = await prisma.userWarning.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, reason: true, createdAt: true, moderator: { select: { name: true } } },
  });
  return warnings.map((warning) => ({
    id: warning.id,
    reason: warning.reason,
    createdAt: warning.createdAt,
    moderatorName: isModo ? (warning.moderator?.name ?? "Ancien modérateur") : null,
  }));
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

