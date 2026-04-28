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
  let userCount = 0, ligueCount = 0, articleCount = 0, topicCount = 0, postCount = 0, totalViews = 0, onlineCount = 0;

  try {
    const results = await Promise.allSettled([
      prisma.user.count(),
      prisma.ligue.count(),
      prisma.article.count(),
      prisma.topic.count(),
      prisma.post.count(),
      prisma.topic.aggregate({ _sum: { views: true } }),
      prisma.session.count({ where: { expires: { gte: new Date() } } })
    ]);

    if (results[0].status === "fulfilled") userCount = results[0].value;
    if (results[1].status === "fulfilled") ligueCount = results[1].value;
    if (results[2].status === "fulfilled") articleCount = results[2].value;
    if (results[3].status === "fulfilled") topicCount = results[3].value;
    if (results[4].status === "fulfilled") postCount = results[4].value;
    if (results[5].status === "fulfilled") {
      const agg = results[5].value as any;
      totalViews = agg?._sum?.views || 0;
    }
    if (results[6].status === "fulfilled") onlineCount = results[6].value;
  } catch (e) {
    console.error("Erreur globale stats publiques:", e);
  }

  const stats = {
    public: {
      users: userCount,
      ligues: ligueCount,
      articles: articleCount,
      topics: topicCount,
      posts: postCount,
      totalViews: totalViews,
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
    
    let pendingReports = 0;
    let pendingResources = 0;
    let monthlyMails = 0;

    try {
      const adminResults = await Promise.allSettled([
        prisma.moderationReport.count({ where: { status: "PENDING" } }),
        prisma.resource.count({ where: { status: "PENDING" } }),
        prisma.mailLog.count({
          where: {
            sentAt: { gte: firstDayOfMonth }
          }
        })
      ]);

      if (adminResults[0].status === "fulfilled") pendingReports = adminResults[0].value;
      if (adminResults[1].status === "fulfilled") pendingResources = adminResults[1].value;
      if (adminResults[2].status === "fulfilled") monthlyMails = adminResults[2].value;
    } catch (e) {
      console.error("Erreur stats admin (BDD):", e);
    }

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
