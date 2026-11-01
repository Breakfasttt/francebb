/**
 * Actions serveur pour la modération de BBFrance.
 * Gère les signalements (reports), le journal d'audit (ModerationLog),
 * le bannissement des utilisateurs et le nettoyage des logs.
 */
"use server";

import { getActiveSession } from "@/lib/authGuard";
import { prisma } from "@/lib/prisma";
import { isModerator } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import { logModerationAction } from "@/lib/moderationLog";
import { toggleBanUser } from "@/app/membres/actions";

/**
 * Créer un nouveau signalement.
 */
export async function createReportAction(data: {
  reason: string;
  details?: string;
  targetId: string;
  targetType: string;
}) {
  const session = await getActiveSession();
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
  const session = await getActiveSession();
  if (!isModerator(session?.user?.role)) return { logs: [], total: 0 };

  // Purge silencieuse automatique (uniquement sur la page 1 pour limiter les appels)
  if (page === 1) {
    cleanupModerationLogs(3).catch(() => {});
  }

  const skip = (page - 1) * pageSize;

  const [logs, total] = await Promise.all([
    prisma.moderationLog.findMany({
      // L'identifiant départage les lignes créées à la même date, pour que l'ordre reste identique d'une page à l'autre
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
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
 * Récupérer les signalements groupés par cible pour un type spécifique avec pagination.
 */
export async function getPendingReportsByType(targetType: string, page = 1, pageSize = 10) {
  const session = await getActiveSession();
  if (!isModerator(session?.user?.role)) return { groups: [], total: 0 };

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

  const allGroups = Object.values(grouped).sort((a: any, b: any) => b.createdAt.getTime() - a.createdAt.getTime());
  const total = allGroups.length;
  const groups = allGroups.slice((page - 1) * pageSize, page * pageSize);

  return { groups, total };
}

/**
 * Résoudre un groupe de signalements (même cible).
 */
export async function resolveReportsAction(targetId: string, targetType: string, action: "RESOLVE" | "IGNORE", comment?: string) {
  const session = await getActiveSession();
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
  const session = await getActiveSession();
  if (session?.user?.role !== "SUPERADMIN" && session?.user?.role !== "ADMIN") {
    return { success: false, error: "Non autorisé" };
  }

  const dateLimit = new Date();
  // Recule de `months` mois (setMonth gère le passage d'une année à l'autre)
  dateLimit.setMonth(dateLimit.getMonth() - months);

  try {
    const deleted = await prisma.moderationLog.deleteMany({
      where: {
        createdAt: {
          lt: dateLimit
        }
      }
    });
    
    // Le nettoyage n'est inscrit au journal que s'il a réellement supprimé des entrées : la purge est lancée à chaque
    // ouverture de la première page du journal, et une ligne « 0 entrées supprimées » l'encombrerait (carte 144).
    if (deleted.count > 0) {
      await logModerationAction(
        "REPORT_RESOLVED", // On utilise une action existante ou on en crée une, ici RESOLVED car c'est une maintenance
        undefined,
        "SYSTEM",
        `Nettoyage automatique des logs supérieurs à ${months} mois (${deleted.count} entrées supprimées)`
      );
    }

    revalidatePath("/moderation");
    return { success: true, count: deleted.count };
  } catch (error) {
    console.error("[CLEANUP_LOGS] Error:", error);
    return { success: false, error: "Erreur serveur" };
  }
}

/**
 * Récupère la liste des utilisateurs bannis avec les détails du ban et pagination.
 *
 * La date du bannissement n'est pas une colonne du membre : elle vient de la ligne « USER_BANNED » du journal de
 * modération. On charge donc tous les bannis (ils sont peu nombreux) et leurs lignes de bannissement en deux requêtes
 * fixes (au lieu d'une requête par banni), puis on trie par date du bannissement, la plus récente d'abord, et par
 * identifiant à date égale, avant de découper la page. Cet ordre stable garantit qu'un banni apparaît sur une seule
 * page (carte 144).
 */
export async function getBannedUsers(page = 1, pageSize = 10) {
  const session = await getActiveSession();
  if (!isModerator(session?.user?.role)) return { users: [], total: 0 };

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

  // Lignes de bannissement de ces membres, les plus récentes d'abord : la première rencontrée par membre est la bonne
  const banLogs = bannedUsers.length === 0 ? [] : await prisma.moderationLog.findMany({
    where: {
      action: "USER_BANNED",
      targetId: { in: bannedUsers.map((user) => user.id) }
    },
    orderBy: { createdAt: "desc" },
    select: { targetId: true, createdAt: true, moderator: { select: { name: true } } }
  });
  const lastBanLog = new Map<string, (typeof banLogs)[number]>();
  for (const log of banLogs) {
    if (log.targetId && !lastBanLog.has(log.targetId)) lastBanLog.set(log.targetId, log);
  }

  const usersWithLogs = bannedUsers
    .map((user) => {
      const log = lastBanLog.get(user.id);
      return {
        ...user,
        bannedBy: log?.moderator?.name || "Système",
        bannedAt: log?.createdAt || new Date(0)
      };
    })
    .sort((a, b) => b.bannedAt.getTime() - a.bannedAt.getTime() || a.id.localeCompare(b.id));

  const skip = (page - 1) * pageSize;
  return {
    users: usersWithLogs.slice(skip, skip + pageSize),
    total: usersWithLogs.length
  };
}

/**
 * Débannir un utilisateur depuis l'onglet « Coachs bannis ».
 * Passe par toggleBanUser (app/membres/actions.ts), la seule action de bannissement : elle vérifie que le
 * modérateur a un rang strictement supérieur à celui du membre (sauf Super Admin) et trace le débannissement
 * au journal. Elle renvoie déjà { success, error } ; on ajoute seulement le rafraîchissement de /moderation.
 */
export async function unbanUserAction(userId: string) {
  try {
    const res = await toggleBanUser(userId, false);
    if (!res.success) return res;
    revalidatePath("/moderation");
    return { success: true };
  } catch (error) {
    console.error("[UNBAN_USER] Error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Erreur serveur" };
  }
}
/**
 * Récupère le résumé des compteurs pour le dashboard de modération.
 */
export async function getModerationSummaryCounts() {
  const session = await getActiveSession();
  if (!isModerator(session?.user?.role)) return null;

  try {
    const [
      posts,
      topics,
      users,
      articles,
      ligues,
      resources
    ] = await Promise.all([
      prisma.moderationReport.count({ where: { status: "PENDING", targetType: "POST" } }),
      prisma.moderationReport.count({ where: { status: "PENDING", targetType: "TOPIC" } }),
      prisma.moderationReport.count({ where: { status: "PENDING", targetType: "USER" } }),
      prisma.moderationReport.count({ where: { status: "PENDING", targetType: "ARTICLE" } }),
      prisma.moderationReport.count({ where: { status: "PENDING", targetType: "LIGUE" } }),
      prisma.resource.count({ where: { status: "PENDING" } }),
    ]);

    return {
      reports_post: posts,
      reports_topic: topics,
      reports_user: users,
      reports_article: articles,
      reports_ligue: ligues,
      resources_validation: resources
    };
  } catch (error) {
    console.error("[GET_MOD_COUNTS] Error:", error);
    return null;
  }
}
