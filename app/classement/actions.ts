"use server";

import { prisma } from "@/lib/prisma";

export type RankingFilter = 
  | string // CDF_2026, CDF_2025, ROLLING, ROSTER, HOF
  | "ROLLING" 
  | "ROSTER" 
  | "HOF";

/**
 * Récupère les années disponibles pour le classement CDF (basé sur la date de fin des tournois).
 */
export async function getRankingYears() {
  const tournaments = await prisma.tournament.findMany({
    where: {
      isCDF: true,
      isFinished: true,
      results: { some: {} }
    },
    select: { endDate: true, date: true }
  });

  const years = tournaments.map((t: any) => new Date(t.endDate || t.date).getFullYear());
  const yearSet = new Set<number>(years);
  return Array.from(yearSet).sort((a, b) => b - a);
}

/**
 * Récupère le classement CDF selon les filtres.
 */
export async function getRanking(filter: RankingFilter, showTeams: boolean = false) {
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
    // CDF 202X
    const year = parseInt(filter.split("_")[1]);
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
        ...(showTeams 
          ? { typeCDF: { in: ["EQUIPE_PARTIELLE", "EQUIPE_TOTALE"] } }
          : { NOT: { typeCDF: { in: ["EQUIPE_PARTIELLE", "EQUIPE_TOTALE"] } } }
        )
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

  console.log(`[getRanking] Filter: ${filter}, showTeams: ${showTeams}, Results found: ${results.length}`);
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

export async function getHallOfFame(showTeams: boolean = false) {
  const years = await getRankingYears();
  const hof = [];

  for (const year of years) {
    // Pour chaque année, on calcule le classement standard top 3
    const ranking = await getRanking(`CDF_${year}`, showTeams);
    if (ranking.length > 0) {
      hof.push({
        year,
        // On prend les 3 meilleurs
        podium: ranking.slice(0, 3).map((r, i) => ({
          rank: i + 1,
          name: r.name,
          totalPoints: r.totalPoints,
          // On essaie de trouver le roster le plus joué par ce coach cette année là
          // Pour l'instant on simplifie (on pourrait approfondir en récupérant les rosters)
        }))
      });
    }
  }

  return hof;
}
