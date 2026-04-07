"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

/**
 * Marque un tournoi comme terminé.
 */
export async function finishTournament(tournamentId: string) {
  const session = await auth();
  if (!session?.user) return null;

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { 
      commissaires: { select: { id: true } },
      topic: { select: { id: true } }
    }
  });

  if (!tournament) return null;

  // Autorisation : Organisateur, Commissaire, ADMIN ou SUPERADMIN
  const isOrganizer = tournament.organizerId === session.user.id;
  const isCommissaire = tournament.commissaires.some(c => c.id === session.user.id);
  const isAuthorizedRole = ["ADMIN", "SUPERADMIN"].includes(session.user.role);

  if (!isOrganizer && !isCommissaire && !isAuthorizedRole) {
    console.warn(`[finishTournament] Accès refusé pour l'utilisateur ${session.user.id} (Rôle: ${session.user.role}) sur le tournoi ${tournamentId} (Organisateur: ${tournament.organizerId})`);
    return null;
  }

  await (prisma.tournament as any).update({
    where: { id: tournamentId },
    data: { isFinished: true }
  });

  revalidatePath("/tournaments");
  if (tournament.topic?.id) {
    revalidatePath(`/forum/topic/${tournament.topic.id}`);
  }
  return { success: true };
}

/**
 * Marque un tournoi comme annulé.
 */
export async function cancelTournament(tournamentId: string) {
  const session = await auth();
  if (!session?.user) return null;

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { 
      commissaires: { select: { id: true } },
      topic: { select: { id: true } }
    }
  });

  if (!tournament) return null;

  // Autorisation : Organisateur, Commissaire, ADMIN ou SUPERADMIN
  const isOrganizer = tournament.organizerId === session.user.id;
  const isCommissaire = tournament.commissaires.some(c => c.id === session.user.id);
  const isAuthorizedRole = ["ADMIN", "SUPERADMIN"].includes(session.user.role);

  if (!isOrganizer && !isCommissaire && !isAuthorizedRole) {
    console.warn(`[cancelTournament] Accès refusé pour l'utilisateur ${session.user.id} (Rôle: ${session.user.role}) sur le tournoi ${tournamentId} (Organisateur: ${tournament.organizerId})`);
    return null;
  }

  await (prisma.tournament as any).update({
    where: { id: tournamentId },
    data: { 
      isCancelled: true,
      isFinished: true // Un tournoi annulé est automatiquement terminé
    }
  });

  revalidatePath("/tournaments");
  if (tournament.topic?.id) {
    revalidatePath(`/forum/topic/${tournament.topic.id}`);
  }
  return { success: true };
}

/**
 * Sauvegarde les résultats d'un tournoi (classement et matchs/rondes).
 */
export async function saveTournamentResults(tournamentId: string, data: { results: any[], rounds: any[] }) {
  const session = await auth();
  if (!session?.user) return { error: "Non authentifié" };

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { commissaires: { select: { id: true } } }
  });

  if (!tournament) return { error: "Tournoi non trouvé" };

  const isOrganizer = tournament.organizerId === session.user.id;
  const isCommissaire = tournament.commissaires.some(c => c.id === session.user.id);
  const isAuthorizedRole = ["ADMIN", "SUPERADMIN"].includes(session.user.role);

  if (!isOrganizer && !isCommissaire && !isAuthorizedRole) {
    console.warn(`[saveTournamentResults] Accès refusé pour l'utilisateur ${session.user.id} (Rôle: ${session.user.role}) sur le tournoi ${tournamentId} (Organisateur: ${tournament.organizerId})`);
    return { error: "Non autorisé" };
  }

  try {
    // Utilisation d'une transaction pour tout mettre à jour proprement
    await prisma.$transaction(async (tx) => {
      // 1. Supprimer les anciens résultats/rondes/matchs
      await tx.tournamentResult.deleteMany({ where: { tournamentId } });
      await tx.tournamentRound.deleteMany({ where: { tournamentId } });

      // 2. Créer les nouveaux résultats
      for (const res of data.results) {
        await tx.tournamentResult.create({
          data: {
            tournamentId,
            coachName: res.coachName,
            nafNumber: res.nafNumber ? String(res.nafNumber) : null,
            userId: res.userId || null,
            roster: res.roster || null,
            wins: Number(res.wins) || 0,
            draws: Number(res.draws) || 0,
            losses: Number(res.losses) || 0,
            casualties: Number(res.casualties) || 0,
            points: Number(res.points) || 0,
            rank: res.rank ? Number(res.rank) : null,
            autoCalculate: res.autoCalculate ?? true
          }
        });
      }

      // 3. Créer les rondes et matchs
      for (const rnd of data.rounds) {
        const round = await tx.tournamentRound.create({
          data: {
            tournamentId,
            roundNumber: Number(rnd.roundNumber)
          }
        });

        // Tri par tableNumber, les null/0 à la fin
        const sortedMatches = [...rnd.matches].sort((a: any, b: any) => {
           const tA = Number(a.tableNumber) || 9999;
           const tB = Number(b.tableNumber) || 9999;
           return tA - tB;
        });

        for (const m of sortedMatches) {
          await tx.tournamentMatch.create({
            data: {
              roundId: round.id,
              tableNumber: m.tableNumber ? Number(m.tableNumber) : null,
              coach1Name: m.coach1Name,
              coach1UserId: m.coach1UserId || null,
              coach2Name: m.coach2Name,
              coach2UserId: m.coach2UserId || null,
              coach1TD: Number(m.coach1TD) || 0,
              coach1Casualties: Number(m.coach1Casualties) || 0,
              coach2TD: Number(m.coach2TD) || 0,
              coach2Casualties: Number(m.coach2Casualties) || 0
            }
          });
        }
      }

      // 4. Marquer le tournoi comme terminé
      await tx.tournament.update({
        where: { id: tournamentId },
        data: { isFinished: true }
      });
    });

    revalidatePath(`/forum/tournament/${tournamentId}/results`);
    const t = await prisma.tournament.findUnique({ where: { id: tournamentId }, include: { topic: true } });
    if (t?.topic?.id) revalidatePath(`/forum/topic/${t.topic.id}`);

    return { success: true };
  } catch (error: any) {
    console.error("Erreur saveTournamentResults:", error);
    return { error: error.message || "Erreur interne" };
  }
}

/**
 * Parse un rapport NAF XML de manière basique
 */
export async function parseNafReport(xmlContent: string) {
  try {
    const results: any[] = [];
    const games: any[] = [];

    // 1. Extraire les coachs
    const coachMatches = xmlContent.matchAll(/<coach>([\s\S]*?)<\/coach>/g);
    for (const match of coachMatches) {
      const content = match[1];
      const name = content.match(/<name>(.*?)<\/name>/)?.[1];
      const team = content.match(/<team>(.*?)<\/team>/)?.[1];
      const number = content.match(/<number>(.*?)<\/number>/)?.[1];
      
      if (name) {
        results.push({
          coachName: name,
          roster: team || null,
          nafNumber: number || null,
          wins: 0, draws: 0, losses: 0, casualties: 0, points: 0,
          userId: null,
          autoCalculate: true
        });
      }
    }

    // 2. Extraire les matchs
    const gameMatches = xmlContent.matchAll(/<game>([\s\S]*?)<\/game>/g);
    for (const match of gameMatches) {
      const content = match[1];
      const timeMatch = content.match(/<timeStamp>(.*?)<\/timeStamp>/);
      const players = [...content.matchAll(/<playerRecord>([\s\S]*?)<\/playerRecord>/g)];
      
      if (players.length === 2) {
        const p1 = players[0][1];
        const p2 = players[1][1];

        const matchData = {
          timeStamp: timeMatch ? timeMatch[1] : "Round Unknown",
          coach1Name: p1.match(/<name>(.*?)<\/name>/)?.[1],
          coach1TD: parseInt(p1.match(/<touchDowns>(.*?)<\/touchDowns>/)?.[1] || "0"),
          coach1Casualties: parseInt(p1.match(/<badlyHurt>(.*?)<\/badlyHurt>/)?.[1] || "0"),
          coach2Name: p2.match(/<name>(.*?)<\/name>/)?.[1],
          coach2TD: parseInt(p2.match(/<touchDowns>(.*?)<\/touchDowns>/)?.[1] || "0"),
          coach2Casualties: parseInt(p2.match(/<badlyHurt>(.*?)<\/badlyHurt>/)?.[1] || "0"),
        };
        games.push(matchData);
      }
    }

    // 3. Grouper par TimeStamp pour créer des rondes
    const timeStamps = [...new Set(games.map(g => g.timeStamp))].sort();
    const rounds = timeStamps.map((ts, idx) => ({
      roundNumber: idx + 1,
      matches: games.filter(g => g.timeStamp === ts).map((g, mIdx) => ({
        ...g,
        tableNumber: mIdx + 1
      }))
    }));

    // 4. Calculer le classement d'après les matchs
    results.forEach(res => {
       const coachGames = games.filter(g => g.coach1Name === res.coachName || g.coach2Name === res.coachName);
       coachGames.forEach(g => {
          const isCoach1 = g.coach1Name === res.coachName;
          const myTD = isCoach1 ? g.coach1TD : g.coach2TD;
          const oppTD = isCoach1 ? g.coach2TD : g.coach1TD;
          const myCAS = isCoach1 ? g.coach1Casualties : g.coach2Casualties;

          if (myTD > oppTD) res.wins++;
          else if (myTD === oppTD) res.draws++;
          else res.losses++;
          res.casualties += myCAS;
       });
    });

    return { results, rounds };
  } catch (error) {
    console.error("Erreur parsing NAF:", error);
    return null;
  }
}
