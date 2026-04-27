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


export async function fetchLegacyRanking(year: number) {
  const session = await auth();
  if (!session?.user?.id || !isModerator(session.user.role)) return { error: "Non autorisé" };

  try {
    const url = `https://www.teamfrancebb.fr/classement/?year=${year}`;
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) return { error: "Impossible de contacter l'ancien site." };

    const html = await response.text();

    // 1. Tenter le parsing Drupal (Pre-2016)
    let result = parseDrupalRanking(html, year);
    
    // 2. Si vide ou erreur, tenter le parsing Custom (Post-2016)
    if (!result || result.rankingData.length === 0) {
      result = parseCustomRanking(html, year);
    }

    if (!result || result.rankingData.length === 0) {
      return { error: `Aucune donnée trouvée pour l'année ${year} (Structure non reconnue).` };
    }

    return { 
      success: true, 
      data: result
    };
  } catch (e) {
    console.error("[fetchLegacyRanking] Error:", e);
    return { error: "Erreur lors de la récupération des données." };
  }
}

/**
 * PARSER 1 : Drupal (views-table) - Format 2012
 */
function parseDrupalRanking(html: string, year: number) {
  const tableParts = html.split(/<table[^>]*class="[^"]*views-table[^"]*"[^>]*>/i);
  if (tableParts.length < 2) return null;
  
  const content = tableParts[1].split(/<\/table>/i)[0];
  const tbodyMatch = content.match(/<tbody[^>]*>([\s\S]*?)<\/tbody>/i);
  const rowsContent = tbodyMatch ? tbodyMatch[1] : content;
  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  const rows = [...rowsContent.matchAll(rowRegex)];

  const coachMap = new Map<string, any>();
  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i][1].match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
    if (!cells || cells.length < 4) continue;

    const clean = (str: string) => {
      // Nettoyage agressif des entités HTML
      let s = str.replace(/<[^>]*>/g, '').trim();
      s = s.replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
      return s;
    };

    const coachName = clean(cells[2]);
    const totalPointsLegacy = parseFloat(clean(cells[1]).replace(',', '.'));
    const nafNumber = clean(cells[3]);
    const comments = clean(cells[4] || "");

    if (!coachName || isNaN(totalPointsLegacy)) continue;

    const tourneyRegex = /([^(]+)\s*\(([\d.,]+)\)/g;
    const foundTourneys = [...comments.matchAll(tourneyRegex)].map(m => ({
      name: m[1].trim(),
      points: parseFloat(m[2].replace(',', '.')),
      rank: 0
    }));

    const topResults = foundTourneys.sort((a, b) => b.points - a.points).slice(0, 4);
    const totalPoints = topResults.length > 0 ? topResults.reduce((sum, t) => sum + t.points, 0) : totalPointsLegacy;

    coachMap.set(coachName, {
      id: `legacy-${coachName}-${year}`,
      name: coachName,
      nafNumber: (nafNumber && nafNumber !== '-' && nafNumber !== 'null') ? nafNumber : null,
      totalPoints: parseFloat(totalPoints.toFixed(4)),
      bestResults: topResults,
      count: foundTourneys.length || 1
    });
  }

  return { year, name: `CdF ${year} (Import Drupal)`, rankingData: Array.from(coachMap.values()) };
}

/**
 * PARSER 2 : Custom (coachlist) - Format 2016+
 */
function parseCustomRanking(html: string, year: number) {
  const tableMatch = html.match(/<table[^>]*class=["'][^"']*(?:coachlist|ranking)[^"']*["'][^>]*>([\s\S]*)<\/table>/i);
  if (!tableMatch) return null;
  
  const tableContent = tableMatch[1];
  // On récupère toutes les lignes <tr>. 
  // ATTENTION : On ne peut pas utiliser une regex simple car il y a des tables imbriquées dans les cellules.
  // On va splitter par </tr> et reconstruire les lignes proprement.
  const rawRows = tableContent.split(/<\/tr>/gi);
  
  const coachMap = new Map<string, any>();
  for (let i = 0; i < rawRows.length; i++) {
    const rowHtml = rawRows[i];
    // On vérifie que c'est bien une ligne de coach (doit avoir les colonnes Points et Nom au début)
    const cells = rowHtml.match(/<td[^>]*>([\s\S]*?)<\/td>/gi);
    if (!cells || cells.length < 4) continue;

    const clean = (str: string) => {
      let s = str.replace(/<[^>]*>/g, '').trim();
      s = s.replace(/&nbsp;/g, ' ').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
      // Nettoyage spécial pour les chiffres collés aux noms (cas du trophée en image)
      return s.trim();
    };

    const totalPointsLegacy = parseFloat(clean(cells[1]).replace(',', '.'));
    const coachName = clean(cells[2]);
    const nafNumber = clean(cells[3] || "");
    const comments = clean(cells[4] || "");

    if (!coachName || isNaN(totalPointsLegacy)) continue;

    // Format 2016-2024+ : Les détails peuvent être des spans ou un tableau imbriqué
    const detailContent = cells[4] || "";
    let foundTourneys: any[] = [];

    // Tentative 1 : Tableau imbriqué (Format 2024)
    if (detailContent.includes('<table')) {
      // Dans le format 2024, les points sont dans une cellule et le nom dans une autre (souvent sur plusieurs lignes)
      // On va extraire TOUTES les cellules qui ont cdf_active ou cdf_inactive
      const cellRegex = /<td[^>]*class=["'](cdf_(?:active|inactive))["'][^>]*>([\s\S]*?)<\/td>/gi;
      const allCells = [...detailContent.matchAll(cellRegex)];
      
      for (let j = 0; j < allCells.length; j++) {
        const content = allCells[j][2];
        const val = parseFloat(content.replace(',', '.'));
        
        // Si c'est un nombre, c'est probablement les points. Le nom est dans la cellule SUIVANTE.
        if (!isNaN(val) && val > 0 && allCells[j+1]) {
          const rawName = allCells[j+1][2];
          let name = rawName.replace(/<img[^>]*>/gi, '')
                        .replace(/<span[^>]*>[\s\S]*?<\/span>/gi, '')
                        .replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, '')
                        .replace(/<[^>]*>/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim();
          
          if (name.length > 2) {
            foundTourneys.push({ name, points: val, rank: 0 });
            j++; // On saute la cellule du nom qu'on vient de traiter
          }
        }
      }
    }

    // Tentative 2 : Spans simples (Format 2018-2022)
    if (foundTourneys.length === 0) {
      const spanRegex = /<span[^>]*class=["']cdf_(?:active|inactive)["'][^>]*>([\d.,]+)\s+([^<]+)<\/span>/gi;
      foundTourneys = [...detailContent.matchAll(spanRegex)].map(m => ({
        name: clean(m[2]),
        points: parseFloat(m[1].replace(',', '.')),
        rank: 0
      }));
    }

    // Tentative 3 : Fallback Texte (Format 2016-2017)
    if (foundTourneys.length === 0) {
      const cleanComments = comments.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ');
      const textRegex = /([\d]{1,3}[\.,][\d]{4})\s*([^0-9\n\r<][^0-9\n\r<]*)/g;
      foundTourneys = [...cleanComments.matchAll(textRegex)].map(m => {
        let name = m[2].trim();
        const nextPointsIndex = name.search(/[\d]{1,3}[\.,][\d]{4}/);
        if (nextPointsIndex !== -1) name = name.substring(0, nextPointsIndex).trim();
        return {
          name: name,
          points: parseFloat(m[1].replace(',', '.')),
          rank: 0
        };
      }).filter(t => t.name.length > 2);
    }

    const topResults = foundTourneys.sort((a, b) => b.points - a.points).slice(0, 4);
    const totalPoints = topResults.length > 0 ? topResults.reduce((sum, t) => sum + t.points, 0) : totalPointsLegacy;

    coachMap.set(coachName, {
      id: `legacy-${coachName}-${year}`,
      name: coachName,
      nafNumber: (nafNumber && nafNumber !== '-' && nafNumber !== 'null') ? nafNumber : null,
      totalPoints: parseFloat(totalPoints.toFixed(4)),
      bestResults: topResults,
      count: foundTourneys.length || 1
    });
  }

  return { year, name: `CdF ${year} (Import Custom)`, rankingData: Array.from(coachMap.values()) };
}

// Helper pour vérifier le grade admin (à adapter selon vos rôles)
function isAdmin(role: string) {
  return role === "ADMIN" || role === "SUPERADMIN";
}
