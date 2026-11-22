/**
 * Actions serveur pour la modération de FranceBB.
 * Gère les signalements (reports), le journal d'audit (ModerationLog),
 * le bannissement des utilisateurs et le nettoyage des logs.
 */
"use server";

import { getActiveSession } from "@/lib/authGuard";
import { rateLimitRefusal } from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";
import { isAdmin, isModerator } from "@/lib/roles";
import { revalidatePath } from "next/cache";
import { LOG_RETENTION_MONTHS, logModerationAction } from "@/lib/moderationLog";
import { toggleBanUser } from "@/app/membres/actions";
import { stripBBCode } from "@/lib/bbcode";
import { forumPostHrefFor } from "@/lib/forumPostLink";
import { getForumAccess } from "@/lib/forumAccess";
import { canSeeReportTarget, closeReports } from "@/lib/moderationReports";
import { reportInputRefusal, type ReportTargetType } from "@/lib/reportRules";
import { formatRoleChangeDetails, isLogGroup, LOG_GROUP_ACTIONS } from "@/lib/moderationLogFormat";
import { getRoleLabelMap } from "@/lib/roleLabels";

/**
 * Créer un nouveau signalement (bouton « Signaler » d'un message, d'un sujet, d'un membre, d'un article, d'une ligue).
 * Carte 221 : le type, la raison et les précisions sont vérifiés, le membre doit voir ce qu'il signale, et un même
 * membre ne peut pas signaler deux fois le même contenu tant que le premier signalement est en attente.
 */
export async function createReportAction(data: {
  reason: string;
  details?: string;
  targetId: string;
  targetType: string;
}) {
  const session = await getActiveSession();
  if (!session?.user?.id) return { success: false, error: "Non authentifié" };
  const reporterId = session.user.id;

  const refusal = reportInputRefusal({ reporterId, ...data });
  if (refusal) return { success: false, error: refusal };
  // Limite d'actions par minute (carte 224)
  const tooFast = await rateLimitRefusal(reporterId, session.user.role, "REPORT");
  if (tooFast) return { success: false, error: tooFast };
  const targetType = data.targetType as ReportTargetType;

  const { roles } = await getForumAccess();
  if (!(await canSeeReportTarget({ reporterId, targetType, targetId: data.targetId, roles }))) {
    return { success: false, error: "Contenu introuvable." };
  }

  const alreadyPending = await prisma.moderationReport.findFirst({
    where: { reporterId, targetId: data.targetId, targetType, status: "PENDING" },
    select: { id: true },
  });
  if (alreadyPending) return { success: false, error: "Tu as déjà signalé ce contenu : la modération va le regarder." };

  try {
    await prisma.moderationReport.create({
      data: {
        reason: data.reason.trim(),
        details: data.details?.trim() || null,
        targetId: data.targetId,
        targetType,
        reporterId,
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
/**
 * Une page du journal (20 lignes), du plus récent au plus ancien. Carte 221 : `group` filtre par type d'action
 * (Membres, Forum, Contenus, Administration) ; chaque ligne reçoit `targetName` (titre du sujet, pseudo du membre…)
 * quand l'élément visé existe encore, et ses détails sont mis en forme pour l'affichage (libellés des rôles).
 */
export async function getModerationLogs(page = 1, pageSize = 20, group?: string) {
  const session = await getActiveSession();
  if (!isModerator(session?.user?.role)) return { logs: [], total: 0 };

  // Purge silencieuse automatique (uniquement sur la page 1 pour limiter les appels)
  if (page === 1) {
    cleanupModerationLogs().catch(() => {});
  }

  const safePage = Math.max(1, Math.floor(Number(page)) || 1);
  const take = Math.min(50, Math.max(1, Math.floor(Number(pageSize)) || 20));
  const where = isLogGroup(group) ? { action: { in: LOG_GROUP_ACTIONS[group] } } : {};

  const logs = await prisma.moderationLog.findMany({
    where,
    // L'identifiant départage les lignes créées à la même date, pour que l'ordre reste identique d'une page à l'autre
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    include: {
      moderator: { select: { id: true, name: true, image: true, role: true } }
    },
    take,
    skip: (safePage - 1) * take
  });
  const total = await prisma.moderationLog.count({ where });

  const names = await loadLogTargetNames(logs);
  const roleLabels = logs.some((log) => log.action === "USER_ROLE_CHANGED") ? await getRoleLabelMap() : undefined;
  return {
    logs: logs.map((log) => ({
      ...log,
      details: log.details && log.action === "USER_ROLE_CHANGED" ? formatRoleChangeDetails(log.details, roleLabels) : log.details,
      targetName: (log.targetId && names.get(`${log.targetType}:${log.targetId}`)) || null,
    })),
    total,
  };
}

/** Noms des éléments visés par une page du journal, une requête par type (clé « TYPE:identifiant »). */
async function loadLogTargetNames(logs: { targetId: string | null; targetType: string | null }[]) {
  const ids = (type: string) => [...new Set(logs.filter((l) => l.targetType === type && l.targetId).map((l) => l.targetId as string))];
  const names = new Map<string, string>();
  const put = (type: string, rows: { id: string; label: string | null | undefined }[]) => {
    for (const row of rows) if (row.label) names.set(`${type}:${row.id}`, row.label);
  };
  // Requêtes l'une après l'autre : la base locale de développement ne sert qu'une requête à la fois
  const topicIds = ids("TOPIC");
  if (topicIds.length) put("TOPIC", (await prisma.topic.findMany({ where: { id: { in: topicIds } }, select: { id: true, title: true } })).map((t) => ({ id: t.id, label: t.title })));
  const postIds = ids("POST");
  if (postIds.length) {
    const posts = await prisma.post.findMany({ where: { id: { in: postIds } }, select: { id: true, topic: { select: { title: true } } } });
    put("POST", posts.map((p) => ({ id: p.id, label: p.topic?.title })));
  }
  const userIds = ids("USER");
  if (userIds.length) put("USER", (await prisma.user.findMany({ where: { id: { in: userIds } }, select: { id: true, name: true } })).map((u) => ({ id: u.id, label: u.name })));
  const forumIds = ids("FORUM");
  if (forumIds.length) put("FORUM", (await prisma.forum.findMany({ where: { id: { in: forumIds } }, select: { id: true, name: true } })).map((f) => ({ id: f.id, label: f.name })));
  const articleIds = ids("ARTICLE");
  if (articleIds.length) put("ARTICLE", (await prisma.article.findMany({ where: { id: { in: articleIds } }, select: { id: true, title: true } })).map((a) => ({ id: a.id, label: a.title })));
  const ligueIds = ids("LIGUE");
  if (ligueIds.length) put("LIGUE", (await prisma.ligue.findMany({ where: { id: { in: ligueIds } }, select: { id: true, name: true } })).map((l) => ({ id: l.id, label: l.name })));
  const tournamentIds = ids("TOURNAMENT");
  if (tournamentIds.length) put("TOURNAMENT", (await prisma.tournament.findMany({ where: { id: { in: tournamentIds } }, select: { id: true, name: true } })).map((t) => ({ id: t.id, label: t.name })));
  const resourceIds = ids("RESOURCE");
  if (resourceIds.length) put("RESOURCE", (await prisma.resource.findMany({ where: { id: { in: resourceIds } }, select: { id: true, title: true } })).map((r) => ({ id: r.id, label: r.title })));
  return names;
}

/** Longueur de l'extrait du contenu signalé, en caractères. */
const EXCERPT_LENGTH = 200;

/**
 * Contenu visé par un signalement, tel que l'écran de modération l'affiche (carte 168).
 * - `title` : titre du sujet, de l'article ou de la ligue, ou pseudo du coach signalé ;
 * - `excerpt` : début du texte, sans BBCode (le code de mise en forme du forum), 200 caractères au plus ;
 * - `authorName` : auteur du message, du sujet ou de l'article, créateur de la ligue ;
 * - `url` : adresse où voir le contenu (pour un message, la bonne page du sujet, avec l'ancre du message) ;
 * - `gone` : le contenu n'existe plus ou a été supprimé ; le signalement n'a plus qu'à être fermé ;
 * - `hidden` : le contenu est déjà masqué par la modération (message ou article), ou le coach est banni.
 */
export interface ReportTarget {
  title: string | null;
  excerpt: string | null;
  authorName: string | null;
  url: string | null;
  gone: boolean;
  hidden: boolean;
}

/** Contenu introuvable : effacé depuis le signalement. */
const GONE_TARGET: ReportTarget = { title: null, excerpt: null, authorName: null, url: null, gone: true, hidden: false };

/** Texte brut d'un contenu BBCode, coupé à la longueur de l'extrait. */
function excerptOf(content: string | null | undefined): string | null {
  if (!content) return null;
  const plain = stripBBCode(content).replace(/\s+/g, " ").trim();
  if (!plain) return null;
  return plain.length > EXCERPT_LENGTH ? `${plain.slice(0, EXCERPT_LENGTH).trimEnd()}…` : plain;
}

/**
 * Charge les contenus visés par les signalements d'une page de la liste (au plus 10), selon leur type.
 * Un contenu introuvable est renvoyé comme `gone` : il a été effacé depuis le signalement.
 */
async function loadReportTargets(targetType: string, ids: string[], viewerId: string): Promise<Map<string, ReportTarget>> {
  const targets = new Map<string, ReportTarget>();
  if (ids.length === 0) return targets;

  if (targetType === "POST") {
    const posts = await prisma.post.findMany({
      where: { id: { in: ids } },
      select: {
        id: true, content: true, createdAt: true, topicId: true, isDeleted: true, isModerated: true,
        author: { select: { name: true } },
        topic: { select: { title: true, isDeleted: true } },
      },
    });
    // Adresse de chaque message sur la bonne page de son sujet (lib/forumPostLink.ts, carte 169), une requête après
    // l'autre : la base locale de développement refuse les requêtes simultanées
    for (const post of posts) {
      targets.set(post.id, {
        title: post.topic.title,
        excerpt: excerptOf(post.content),
        authorName: post.author.name,
        url: await forumPostHrefFor(post.topicId, post),
        gone: post.isDeleted || post.topic.isDeleted,
        hidden: post.isModerated,
      });
    }
  } else if (targetType === "TOPIC") {
    const topics = await prisma.topic.findMany({
      where: { id: { in: ids } },
      select: {
        id: true, title: true, isDeleted: true,
        author: { select: { name: true } },
        // Premier message du sujet, pour l'extrait
        posts: { orderBy: [{ createdAt: "asc" }, { id: "asc" }], take: 1, select: { content: true } },
      },
    });
    for (const topic of topics) {
      targets.set(topic.id, {
        title: topic.title,
        excerpt: excerptOf(topic.posts[0]?.content),
        authorName: topic.author.name,
        url: `/forum/topic/${topic.id}`,
        gone: topic.isDeleted,
        hidden: false,
      });
    }
  } else if (targetType === "USER") {
    const users = await prisma.user.findMany({ where: { id: { in: ids } }, select: { id: true, name: true, isBanned: true } });
    for (const user of users) {
      targets.set(user.id, { title: user.name, excerpt: null, authorName: null, url: `/spy/${user.id}`, gone: false, hidden: user.isBanned });
    }
  } else if (targetType === "ARTICLE") {
    const articles = await prisma.article.findMany({
      where: { id: { in: ids } },
      select: { id: true, title: true, content: true, isModerated: true, author: { select: { name: true } } },
    });
    for (const article of articles) {
      targets.set(article.id, {
        title: article.title,
        excerpt: excerptOf(article.content),
        authorName: article.author.name,
        url: `/articles/${article.id}`,
        gone: false,
        hidden: article.isModerated,
      });
    }
  } else if (targetType === "CONVERSATION") {
    // Carte 223 : la modération ne lit jamais une conversation privée. La fiche ne montre que ses participants ; pour
    // lire les messages, un participant doit inviter un modérateur dans la conversation.
    const conversations = await prisma.conversation.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, participants: { select: { userId: true, deletedAt: true, user: { select: { name: true } } } } },
    });
    for (const conversation of conversations) {
      const names = conversation.participants.map((participant) => participant.user.name).filter(Boolean);
      // Lien seulement pour un modérateur qu'un participant a invité dans la conversation
      const invited = conversation.participants.some((participant) => participant.userId === viewerId && !participant.deletedAt);
      targets.set(conversation.id, {
        title: conversation.name ? `« ${conversation.name} »` : null,
        excerpt: null,
        authorName: names.join(", ") || null,
        url: invited ? `/messagerie?id=${conversation.id}` : null,
        gone: false,
        hidden: false,
      });
    }
  } else if (targetType === "LIGUE") {
    const ligues = await prisma.ligue.findMany({
      where: { id: { in: ids } },
      select: { id: true, name: true, description: true, creator: { select: { name: true } } },
    });
    for (const ligue of ligues) {
      targets.set(ligue.id, {
        title: ligue.name,
        excerpt: excerptOf(ligue.description),
        authorName: ligue.creator.name,
        url: `/ligue/${ligue.id}`,
        gone: false,
        hidden: false,
      });
    }
  }

  for (const id of ids) if (!targets.has(id)) targets.set(id, GONE_TARGET);
  return targets;
}

/**
 * Récupérer les signalements groupés par cible pour un type spécifique avec pagination.
 * Chaque groupe porte aussi le contenu visé (`target`, carte 168) : titre, extrait, auteur, adresse, et s'il a été
 * supprimé ou masqué entre-temps.
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
  const grouped: Record<string, {
    targetId: string;
    targetType: string;
    reports: typeof reports;
    count: number;
    firstReason: string;
    createdAt: Date;
  }> = {};
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

  const allGroups = Object.values(grouped).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const total = allGroups.length;
  const pageGroups = allGroups.slice((page - 1) * pageSize, page * pageSize);
  const targets = await loadReportTargets(targetType, pageGroups.map((group) => group.targetId), session!.user.id);
  const groups = pageGroups.map((group) => ({ ...group, target: targets.get(group.targetId) ?? GONE_TARGET }));

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

    // Les membres qui avaient signalé sont prévenus (carte 223)
    await closeReports({ targetId, targetType }, status, session.user.id);

    await logModerationAction(
      session.user.id,
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
 * Supprime les entrées du journal plus vieilles que LOG_RETENTION_MONTHS mois. Réservé aux admins.
 * Carte 221 : la durée est fixée par le serveur. Elle venait de l'appelant, et `cleanupModerationLogs(0)` effaçait
 * tout le journal, y compris la trace de ce que l'admin venait de faire.
 */
export async function cleanupModerationLogs() {
  const session = await getActiveSession();
  if (!session?.user || !isAdmin(session.user.role)) {
    return { success: false, error: "Non autorisé" };
  }

  const months = LOG_RETENTION_MONTHS;
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
        session.user.id,
        "LOGS_PURGED",
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
      bannedUntil: true,
      role: true
    }
  });

  // Lignes de bannissement de ces membres, les plus récentes d'abord : la première rencontrée par membre est la bonne
  const banLogs = bannedUsers.length === 0 ? [] : await prisma.moderationLog.findMany({
    where: {
      // Bannissement définitif ou temporaire (carte 222)
      action: { in: ["USER_BANNED", "USER_TEMP_BANNED"] },
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
      resources,
      conversations
    ] = await Promise.all([
      prisma.moderationReport.count({ where: { status: "PENDING", targetType: "POST" } }),
      prisma.moderationReport.count({ where: { status: "PENDING", targetType: "TOPIC" } }),
      prisma.moderationReport.count({ where: { status: "PENDING", targetType: "USER" } }),
      prisma.moderationReport.count({ where: { status: "PENDING", targetType: "ARTICLE" } }),
      prisma.moderationReport.count({ where: { status: "PENDING", targetType: "LIGUE" } }),
      prisma.resource.count({ where: { status: "PENDING" } }),
      prisma.moderationReport.count({ where: { status: "PENDING", targetType: "CONVERSATION" } }),
    ]);

    return {
      reports_post: posts,
      reports_topic: topics,
      reports_user: users,
      reports_article: articles,
      reports_ligue: ligues,
      reports_conversation: conversations,
      resources_validation: resources
    };
  } catch (error) {
    console.error("[GET_MOD_COUNTS] Error:", error);
    return null;
  }
}
