/**
 * Page de statistiques globales de BBFrance.
 * Affiche des compteurs pour les utilisateurs, ligues, articles, etc.
 * Section Admin avec données techniques (emails, BDD, quotas).
 */
"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin as checkIsAdmin } from "@/lib/roles";
import fs from "fs";
import path from "path";

export async function getDashboardStats() {
  const session = await auth();
  const userRole = session?.user?.role;
  const isAdmin = checkIsAdmin(userRole);

  // 1. Statistiques Publiques
  const [
    userCount,
    ligueCount,
    articleCount,
    topicCount,
    postCount,
    totalViewsResult,
    onlineCount
  ] = await Promise.all([
    prisma.user.count(),
    prisma.ligue.count(),
    prisma.article.count(),
    prisma.topic.count(),
    prisma.post.count(),
    prisma.topic.aggregate({
      _sum: { views: true }
    }),
    prisma.session.count({
      where: {
        expires: { gte: new Date() }
      }
    })
  ]);

  const stats = {
    public: {
      users: userCount,
      ligues: ligueCount,
      articles: articleCount,
      topics: topicCount,
      posts: postCount,
      totalViews: totalViewsResult._sum.views || 0,
      onlineUsers: onlineCount
    },
    admin: null as any
  };

  // 2. Statistiques Administrateur
  if (isAdmin) {
    let dbSize = "Inconnu";
    try {
      const dbPath = path.join(process.cwd(), "dev.db");
      if (fs.existsSync(dbPath)) {
        const stats = fs.statSync(dbPath);
        const sizeInMb = stats.size / (1024 * 1024);
        dbSize = `${sizeInMb.toFixed(2)} Mo`;
      }
    } catch (e) {
      console.error("Erreur lecture taille BDD:", e);
    }

    // Statistiques emails (Log BDD)
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const [pendingReports, pendingResources, monthlyMails] = await Promise.all([
      prisma.moderationReport.count({ where: { status: "PENDING" } }),
      prisma.resource.count({ where: { status: "PENDING" } }),
      prisma.mailLog.count({
        where: {
          sentAt: { gte: firstDayOfMonth }
        }
      })
    ]);

    // Note: Le quota dépend du plan Resend (Free = 3000/mois ou 100/jour selon l'époque, ici on assume 3000)
    const RESEND_QUOTA = 3000;

    stats.admin = {
      dbSize,
      pendingReports,
      pendingResources,
      monthlyMails,
      mailsRemaining: Math.max(0, RESEND_QUOTA - monthlyMails),
      storageQuota: "500 Mo",
      storageUsage: dbSize
    };
  }

  return stats;
}
