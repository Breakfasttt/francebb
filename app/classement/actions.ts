/**
 * Actions serveur pour le classement du Championnat de France (CDF).
 * Gère le calcul des points, les filtres (Rolling, Roster) et l'archivage annuel.
 */
"use server";
 
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { isModerator } from "@/lib/roles";
import { logModerationAction } from "@/app/moderation/actions";

export type RankingFilter = 
  | string // CDF_2026, CDF_2025, ROLLING, ROSTER, HOF
  | "ROLLING" 
  | "ROSTER" 
  | "HOF";

/**
 * Récupère les années disponibles pour le classement CDF, en incluant les archives.
 */
export async function getRankingYears() {
  const [tournaments, archives] = await Promise.all([
    prisma.tournament.findMany({
      where: {
        isCDF: true,
        isFinished: true,
        results: { some: {} }
      },
      select: { endDate: true, date: true }
    }),
    prisma.rankingArchive.findMany({
      select: { year: true }
    })
  ]);

  const years = tournaments.map((t: any) => new Date(t.endDate || t.date).getFullYear());
  const archivedYearsList = archives.map(a => a.year);
  const yearSet = new Set<number>([...years, ...archivedYearsList]);
  
  return Array.from(yearSet)
    .sort((a, b) => b - a)
    .map(y => ({
      year: y,
      isArchived: archivedYearsList.includes(y)
    }));
}

/**
 * Récupère le classement CDF selon les filtres.
 */
export async function getRanking(filter: RankingFilter) {
  const now = new Date();
  let startDate: Date;
  let endDate: Date = now;
  let useTopX = 4;
  let groupByRoster = false;

  // Définition de la période
  if (filter === "ROLLING") {
    startDate = new Date();
    startDate.setFullYear(now.getFullYear() - 1);
  } else if (filter === "ROSTER") {
    startDate = new Date(now.getFullYear(), 0, 1);
    endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
    useTopX = 2;
    groupByRoster = true;
  } else if (filter === "HOF") {
    // Hall of Fame: On renverra une structure différente ou on gérera par année
    startDate = new Date(2000, 0, 1);
  } else {
    // CDF 202X - Vérifier si une archive existe
    const year = parseInt(filter.split("_")[1]);
    const archive = await prisma.rankingArchive.findUnique({
      where: { year }
    });
    
    if (archive) {
      console.log(`[getRanking] Loading from archive for year ${year}`);
      return JSON.parse(archive.data);
    }

    startDate = new Date(year, 0, 1);
    endDate = new Date(year, 11, 31, 23, 59, 59);
  }

  // Si on est en mode équipe, la logique change
  // Note: Actuellement le projet ne suit pas explicitement les points globaux d'une "Entité Équipe" 
  // sur plusieurs tournois via une table dédiée, mais on peut agréger par Nom de Team si on veut.
  // Pour l'instant, on va se concentrer sur le classement individuel (Coachs).

  const results = await prisma.tournamentResult.findMany({
    where: {
      tournament: {
        isCDF: true,
        isFinished: true,
        OR: [
          { endDate: { 
              gte: startDate, 
              ...(filter !== "ROLLING" ? { lte: endDate } : {}) 
          } },
          { AND: [
              { endDate: null }, 
              { date: { 
                  gte: startDate, 
                  ...(filter !== "ROLLING" ? { lte: endDate } : {}) 
              } }
          ] }
        ],
      },
      points: { gt: 0 }
    },
    include: {
      user: true,
      tournament: {
        include: {
          topic: { select: { id: true } },
          _count: { select: { results: true } }
        }
      }
    }
  });

  console.log(`[getRanking] Filter: ${filter}, Results found: ${results.length}`);
  if (results.length > 0) {
    console.log(`[getRanking] First tournament type: ${results[0].tournament.typeCDF}`);
  }

  if (groupByRoster) {
    return calculateRosterRanking(results);
  }

  return calculateStandardRanking(results, useTopX);
}

function calculateStandardRanking(results: any[], topX: number) {
  const coachMap = new Map<string, any>();

  results.forEach(res => {
    // Clé d'identification : NAF # prioritaire, sinon Coach Name
    const coachKey = res.nafNumber ? `NAF-${res.nafNumber}` : `NAME-${res.coachName}`;
    
    if (!coachMap.has(coachKey)) {
      coachMap.set(coachKey, {
        id: coachKey,
        nafNumber: res.nafNumber,
        name: res.user?.name || res.coachName,
        userId: res.userId,
        results: [],
        totalPoints: 0
      });
    }

    const current = coachMap.get(coachKey);
    // Si on trouve un userId ou un nom plus récent/complet, on met à jour l'info d'affichage
    if (res.userId && !current.userId) {
      current.userId = res.userId;
      current.name = res.user?.name || res.coachName;
    }

    current.results.push({
      points: res.points,
      tournamentName: res.tournament.name,
      date: res.tournament.endDate || res.tournament.date,
      topicId: res.tournament.topic?.id,
      rank: res.rank,
      totalParticipants: res.tournament._count?.results || 1
    });
  });

  const finalRanking = Array.from(coachMap.values()).map(coach => {
    const sortedResults = coach.results.sort((a: any, b: any) => b.points - a.points);
    const topResults = sortedResults.slice(0, topX);
    const totalPoints = topResults.reduce((sum: number, r: any) => sum + r.points, 0);

    return {
      id: coach.id,
      nafNumber: coach.nafNumber,
      name: coach.name,
      userId: coach.userId,
      totalPoints: parseFloat(totalPoints.toFixed(4)),
      bestResults: topResults,
      count: coach.results.length
    };
  });

  return finalRanking.sort((a, b) => b.totalPoints - a.totalPoints);
}

function calculateRosterRanking(results: any[]) {
  const coachRosterMap = new Map<string, any>(); 

  results.forEach(res => {
    if (!res.roster) return;
    const coachKey = res.nafNumber ? `NAF-${res.nafNumber}` : `NAME-${res.coachName}`;
    const key = `${coachKey}-${res.roster}`;

    if (!coachRosterMap.has(key)) {
      coachRosterMap.set(key, {
        coachKey,
        name: res.user?.name || res.coachName,
        userId: res.userId,
        nafNumber: res.nafNumber,
        roster: res.roster,
        results: [],
        totalPoints: 0
      });
    }
    coachRosterMap.get(key).results.push({
      points: res.points,
      tournamentName: res.tournament.name,
      date: res.tournament.endDate || res.tournament.date,
      topicId: res.tournament.topic?.id,
      rank: res.rank,
      totalParticipants: res.tournament._count?.results || 1
    });
  });

  // Calcul des totaux par coach-roster
  const intermediate = Array.from(coachRosterMap.values()).map(entry => {
    const sorted = entry.results.sort((a: any, b: any) => b.points - a.points);
    const top2 = sorted.slice(0, 2);
    const total = top2.reduce((s: number, p: any) => s + p.points, 0);

    return {
      coachKey: entry.coachKey,
      name: entry.name,
      userId: entry.userId,
      nafNumber: entry.nafNumber,
      roster: entry.roster,
      totalPoints: parseFloat(total.toFixed(4)),
      count: entry.results.length,
      bestResults: top2
    };
  });

  // FILTRE : Ne garder que le meilleur coach pour chaque roster
  const bestByRoster = new Map<string, any>();
  intermediate.forEach(entry => {
    const existing = bestByRoster.get(entry.roster);
    if (!existing || entry.totalPoints > existing.totalPoints) {
      bestByRoster.set(entry.roster, entry);
    }
  });

  return Array.from(bestByRoster.values()).sort((a, b) => b.totalPoints - a.totalPoints);
}

export async function getHallOfFame() {
  const yearData = await getRankingYears();
  const hof = [];

  for (const entry of yearData) {
    // Pour chaque année, on calcule le classement standard top 3
    const ranking = await getRanking(`CDF_${entry.year}`);
    if (ranking.length > 0) {
      hof.push({
        year: entry.year,
        isArchived: entry.isArchived,
        // On prend les 3 meilleurs
        podium: ranking.slice(0, 3).map((r: any, i: number) => ({
          rank: i + 1,
          name: r.name,
          totalPoints: r.totalPoints,
        }))
      });
    }
  }

  return hof;
}

/**
 * MODÉRATION : Archivage du classement d'une année.
 */
export async function archiveYear(year: number) {
  const session = await auth();
  if (!session?.user?.id || !isModerator(session.user.role)) return { error: "Non autorisé" };

  try {
    // Calculer le classement actuel pour l'instantané
    const rankingData = await getRanking(`CDF_${year}`);
    
    const archive = await prisma.rankingArchive.create({
      data: {
        year,
        name: `Championnat de France ${year}`,
        data: JSON.stringify(rankingData),
        archivedById: session.user.id
      }
    });

    await logModerationAction(
      "ARCHIVE_RANKING",
      archive.id,
      "RankingArchive",
      `Archivage du Championnat de France ${year}`
    );

    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Erreur lors de l'archivage" };
  }
}

/**
 * MODÉRATION / ADMIN : Suppression d'une archive.
 */
export async function deleteArchive(year: number) {
  const session = await auth();
  // Suppression réservée aux admins+
  if (!session?.user?.id || !isAdmin(session.user.role)) return { error: "Non autorisé (Admin requis)" };

  try {
    const archive = await prisma.rankingArchive.findUnique({ where: { year } });
    if (!archive) return { error: "Archive non trouvée" };

    await prisma.rankingArchive.delete({ where: { year } });

    await logModerationAction(
      "DELETE_ARCHIVE",
      archive.id,
      "RankingArchive",
      `Suppression de l'archive du classement ${year}`
    );

    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Erreur lors de la suppression" };
  }
}

/**
 * MODÉRATION : Mise à jour ou création manuelle d'une archive.
 */
export async function saveArchive(year: number, name: string, rankingData: any[]) {
  const session = await auth();
  if (!session?.user?.id || !isModerator(session.user.role)) return { error: "Non autorisé" };

  try {
    const archive = await prisma.rankingArchive.upsert({
      where: { year },
      create: {
        year,
        name,
        data: JSON.stringify(rankingData),
        archivedById: session.user.id
      },
      update: {
        name,
        data: JSON.stringify(rankingData)
      }
    });

    await logModerationAction(
      archive.createdAt === archive.updatedAt ? "CREATE_ARCHIVE_MANUAL" : "UPDATE_ARCHIVE",
      archive.id,
      "RankingArchive",
      `Mise à jour manuelle de l'archive ${year} (${name})`
    );

    return { success: true };
  } catch (e) {
    console.error(e);
    return { error: "Erreur lors de la sauvegarde" };
  }
}


/**
 * SCRAPING : Récupère les données de classement de l'ancien site.
 */
export async function fetchLegacyRanking(year: number) {
  const session = await auth();
  if (!session?.user?.id || !isModerator(session.user.role)) return { error: "Non autorisé" };

  try {
    const url = `https://www.teamfrancebb.fr/classement/?year=${year}`;
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return { error: "Impossible de contacter l'ancien site." };

    const html = await response.text();

    // Drupal Views Table : views-table
    const tableRegex = /<table[^>]*class="[^"]*views-table[^"]*"[^>]*>([\s\S]*?)<\/table>/i;
    const tableMatch = html.match(tableRegex);

    if (!tableMatch) return { error: `Aucune donnée trouvée pour l'année ${year} sur l'ancien site (Table introuvable).` };

    const rowsContent = tableMatch[1];
    // On cherche les tr dans le tbody
    const tbodyRegex = /<tbody[^>]*>([\s\S]*?)<\/tbody>/i;
    const tbodyMatch = rowsContent.match(tbodyRegex);
    const targetContent = tbodyMatch ? tbodyMatch[1] : rowsContent;

    const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    const rows = [...targetContent.matchAll(rowRegex)];

    if (rows.length === 0) return { error: `Le tableau de l'année ${year} est vide.` };

    const rankingData: any[] = [];
    const coachMap = new Map<string, any>();

    // Puisqu'on a ciblé le tbody, la première ligne (i=0) est déjà un coach.
    for (let i = 0; i < rows.length; i++) {
      const cells = rows[i][1].match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
      if (!cells || cells.length < 4) continue;

      // Nettoyage HTML basique
      const clean = (str: string) => str.replace(/<[^>]*>/g, '').trim();

      const rank = parseInt(clean(cells[0]));
      const totalPointsLegacy = parseFloat(clean(cells[1]).replace(',', '.'));
      const coachName = clean(cells[2]);
      const nafNumber = clean(cells[3]);
      const comments = clean(cells[4] || "");

      if (!coachName) continue;

      // Extraction des tournois via regex : Nom (Points)
      // Exemple : NABOT VII (98)* Coupe Téflon II (91.7091)*
      const tourneyRegex = /([^(]+)\s*\(([\d.,]+)\)/g;
      const foundTourneys = [...comments.matchAll(tourneyRegex)].map(m => ({
        name: m[1].trim(),
        points: parseFloat(m[2].replace(',', '.')),
        rank: 0 // Info non dispo dans ce format
      }));

      // Garder top 4 si plus de 4 tournois (demande utilisateur)
      const topResults = foundTourneys
        .sort((a, b) => b.points - a.points)
        .slice(0, 4);

      // Calcul du total basé sur le top 4 (plus précis pour le nouveau site)
      const totalPoints = topResults.reduce((sum, t) => sum + t.points, 0);

      coachMap.set(coachName, {
        id: `legacy-${coachName}-${year}`,
        name: coachName,
        nafNumber: nafNumber !== '-' && nafNumber !== '' ? nafNumber : null,
        totalPoints: parseFloat((totalPoints || totalPointsLegacy).toFixed(4)),
        bestResults: topResults,
        count: foundTourneys.length
      });
    }

    const finalRanking = Array.from(coachMap.values())
      .sort((a, b) => b.totalPoints - a.totalPoints);

    if (finalRanking.length === 0) return { error: "Aucun coach extrait." };

    return { 
      success: true, 
      data: {
        year,
        name: `Championnat de France ${year} (Import Historique)`,
        rankingData: finalRanking
      }
    };
  } catch (e) {
    console.error("[fetchLegacyRanking] Error:", e);
    return { error: "Erreur lors de la récupération des données." };
  }
}

// Helper pour vérifier le grade admin (à adapter selon vos rôles)
function isAdmin(role: string) {
  return role === "ADMIN" || role === "SUPERADMIN";
}
