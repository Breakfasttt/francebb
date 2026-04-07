"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isModerator } from "@/lib/roles";
import { revalidatePath } from "next/cache";

/**
 * Types d'actions de modération pour le journal (Audit Log).
 */
export type ModerationAction = 
  | "FORUM_CREATED" | "FORUM_LOCKED" | "FORUM_UNLOCKED" | "FORUM_DELETED"
  | "TOPIC_DELETED" | "TOPIC_PINNED" | "TOPIC_UNPINNED" | "TOPIC_MOVED" | "TOPIC_ARCHIVED" | "TOPIC_UNARCHIVED" | "TOPIC_LOCKED" | "TOPIC_UNLOCKED"
  | "POST_MODERATED" | "POST_UNMODERATED"
  | "USER_ROLE_CHANGED" | "USER_BANNED" | "USER_UNBANNED"
  | "ARTICLE_MODERATED" | "ARTICLE_UNMODERATED" | "ARTICLE_DELETED"
  | "LIGUE_CREATED" | "LIGUE_DELETED"
  | "RESOURCE_APPROVED" | "RESOURCE_REJECTED" | "RESOURCE_UPDATED" | "RESOURCE_DELETED"
  | "REPORT_IGNORED" | "REPORT_RESOLVED";

/**
 * Enregistre une action de modération dans les logs de manière atomique.
 * Utilisable depuis n'importe quelle Server Action.
 */
export async function logModerationAction(
  action: ModerationAction, 
  targetId?: string, 
  targetType?: string, 
  details?: string
) {
  const session = await auth();
  const userId = session?.user?.id;
  
  // Note: On loggue même si l'utilisateur n'est pas "officiellement" modo (ex: suppression topic par auteur)
  if (!userId) return;

  try {
    await prisma.moderationLog.create({
      data: {
        action,
        moderatorId: userId,
        targetId,
        targetType,
        details
      }
    });
  } catch (error) {
    console.error("[LOG_MODERATION] Error:", error);
  }
}

/**
 * Créer un nouveau signalement.
 */
export async function createReportAction(data: {
  reason: string;
  details?: string;
  targetId: string;
  targetType: string;
}) {
  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Non authentifié" };

  try {
    await prisma.moderationReport.create({
      data: {
        reason: data.reason,
        details: data.details,
        targetId: data.targetId,
        targetType: data.targetType,
        reporterId: session.user.id,
      }
    });
    return { success: true };
  } catch (error) {
    console.error("[CREATE_REPORT] Error:", error);
    return { success: false, error: "Erreur lors de la création du signalement." };
  }
}

/**
 * Récupérer les logs avec pagination.
 */
export async function getModerationLogs(page = 1, pageSize = 20) {
  const session = await auth();
  if (!isModerator(session?.user?.role)) return { logs: [], total: 0 };

  // Purge silencieuse automatique (uniquement sur la page 1 pour limiter les appels)
  if (page === 1) {
    cleanupModerationLogs(3).catch(() => {});
  }

  const skip = (page - 1) * pageSize;

  const [logs, total] = await Promise.all([
    prisma.moderationLog.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        moderator: { select: { id: true, name: true, image: true, role: true } }
      },
      take: pageSize,
      skip
    }),
    prisma.moderationLog.count()
  ]);

  return { logs, total };
}

/**
 * Récupérer les signalements groupés par cible pour un type spécifique.
 */
export async function getPendingReportsByType(targetType: string) {
  const session = await auth();
  if (!isModerator(session?.user?.role)) return [];

  const reports = await prisma.moderationReport.findMany({
    where: { 
      targetType,
      status: "PENDING"
    },
    orderBy: { createdAt: "asc" },
    include: {
      reporter: { select: { id: true, name: true, image: true } }
    }
  });

  // Groupement manuel pour afficher "X signalements pour cet item"
  const grouped: Record<string, any> = {};
  for (const report of reports) {
    if (!grouped[report.targetId]) {
      grouped[report.targetId] = {
        targetId: report.targetId,
        targetType: report.targetType,
        reports: [],
        count: 0,
        firstReason: report.reason,
        createdAt: report.createdAt
      };
    }
    grouped[report.targetId].reports.push(report);
    grouped[report.targetId].count++;
  }

  return Object.values(grouped).sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
}

/**
 * Résoudre un groupe de signalements (même cible).
 */
export async function resolveReportsAction(targetId: string, targetType: string, action: "RESOLVE" | "IGNORE", comment?: string) {
  const session = await auth();
  if (!isModerator(session?.user?.role)) return { success: false, error: "Non autorisé" };

  try {
    if (!session?.user?.id) return { success: false, error: "Non authentifié" };
    const status = action === "RESOLVE" ? "RESOLVED" : "IGNORED";

    await prisma.moderationReport.updateMany({
      where: { 
        targetId, 
        targetType,
        status: "PENDING"
      },
      data: {
        status,
        resolvedById: session.user.id,
        resolvedAt: new Date()
      }
    });

    await logModerationAction(
      action === "RESOLVE" ? "REPORT_RESOLVED" : "REPORT_IGNORED",
      targetId,
      targetType,
      comment || (action === "RESOLVE" ? "Signalements traités" : "Signalements ignorés")
    );

    revalidatePath("/moderation");
    return { success: true };
  } catch (error) {
    console.error("[RESOLVE_REPORTS] Error:", error);
    return { success: false, error: "Erreur serveur." };
  }
}

/**
 * Supprime les logs plus vieux que X mois.
 * Uniquement pour SUPERADMIN et ADMIN.
 */
export async function cleanupModerationLogs(months = 3) {
  const session = await auth();
  if (session?.user?.role !== "SUPERADMIN" && session?.user?.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" };
  }

  const dateLimit = new Date();
  dateLimit.setMonth(dateLimit.setMonth(dateLimit.getMonth()) - months);

  try {
    const deleted = await prisma.moderationLog.deleteMany({
      where: {
        createdAt: {
          lt: dateLimit
        }
      }
    });
    
    // On loggue aussi l'action de nettoyage
    await logModerationAction(
      "REPORT_RESOLVED", // On utilise une action existante ou on en crée une, ici RESOLVED car c'est une maintenance
      undefined,
      "SYSTEM",
      `Nettoyage automatique des logs supérieurs à ${months} mois (${deleted.count} entrées supprimées)`
    );

    revalidatePath("/moderation");
    return { success: true, count: deleted.count };
  } catch (error) {
    console.error("[CLEANUP_LOGS] Error:", error);
    return { success: false, error: "Erreur serveur" };
  }
}

/**
 * Récupère la liste des utilisateurs bannis avec les détails du ban.
 */
export async function getBannedUsers() {
  const session = await auth();
  if (!isModerator(session?.user?.role)) return [];

  // On récupère les users bannis
  const bannedUsers = await prisma.user.findMany({
    where: { isBanned: true },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      banReason: true,
      role: true
    }
  });

  // Pour chaque user, on cherche le log de ban le plus récent
  const usersWithLogs = await Promise.all(bannedUsers.map(async (user) => {
    const lastBanLog = await prisma.moderationLog.findFirst({
      where: {
        action: "USER_BANNED",
        targetId: user.id
      },
      orderBy: { createdAt: "desc" },
      include: {
        moderator: { select: { name: true } }
      }
    });

    return {
      ...user,
      bannedBy: lastBanLog?.moderator?.name || "Système",
      bannedAt: lastBanLog?.createdAt || new Date(0)
    };
  }));

  return usersWithLogs.sort((a, b) => b.bannedAt.getTime() - a.bannedAt.getTime());
}

/**
 * Débannir un utilisateur.
 */
export async function unbanUserAction(userId: string) {
  const session = await auth();
  if (!isModerator(session?.user?.role)) return { success: false, error: "Non autorisé" };

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { 
        isBanned: false,
        banReason: null
      }
    });

    await logModerationAction(
      "USER_UNBANNED",
      userId,
      "USER",
      "Débannissement via le dashboard de modération"
    );

    revalidatePath("/moderation");
    return { success: true };
  } catch (error) {
    console.error("[UNBAN_USER] Error:", error);
    return { success: false, error: "Erreur serveur" };
  }
}
