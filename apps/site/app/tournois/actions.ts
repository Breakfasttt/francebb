/**
 * Actions serveur pour la gestion des tournois.
 * Gère la clôture, l'annulation et son retour en arrière (rétablir, carte 187), la sauvegarde et le parsing de
 * rapports NAF XML.
 */
"use server";

import { prisma } from "@/lib/prisma";
import { getActiveSession } from "@/lib/authGuard";
import { refreshTournament } from "@/lib/pageRefresh";
import { isModerator } from "@/lib/roles";
import type { ActionResult } from "@/lib/actionResult";
import { canManageTournament } from "@/lib/tournamentRights";
import { calculateCdfPoints, cdfRoundsCount, isValidRank, CdfTournamentType } from "@/common/utils/cdf";
import { logModerationAction } from "@/lib/moderationLog";

/**
 * Marque un tournoi comme terminé.
 */
export async function finishTournament(tournamentId: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user) return { success: false, error: "Tu dois être connecté." };

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { 
      commissaires: { select: { id: true } },
      topic: { select: { id: true } }
    }
  });

  if (!tournament) return { success: false, error: "Tournoi introuvable." };

  // Autorisation : Organisateur, Commissaire ou modération (même règle que la page /results et updateTournament)
  // Organisateur, commissaire ou modérateur : règle écrite une seule fois (lib/tournamentRights.ts, carte 201)
  const viewer = { id: session.user.id, isModerator: isModerator(session.user.role) };
  if (!canManageTournament(viewer, tournament)) {
    console.warn(`[finishTournament] Accès refusé pour l'utilisateur ${session.user.id} (Rôle: ${session.user.role}) sur le tournoi ${tournamentId} (Organisateur: ${tournament.organizerId})`);
    return { success: false, error: "Tu dois être connecté." };
  }

  await (prisma.tournament as any).update({
    where: { id: tournamentId },
    data: { isFinished: true }
  });

  refreshTournament({ id: tournamentId, topicId: tournament.topic?.id });
  return { success: true };
}

/**
 * Marque un tournoi comme annulé.
 */
export async function cancelTournament(tournamentId: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user) return { success: false, error: "Tu dois être connecté." };

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { 
      commissaires: { select: { id: true } },
      topic: { select: { id: true } }
    }
  });

  if (!tournament) return { success: false, error: "Tournoi introuvable." };

  // Autorisation : Organisateur, Commissaire ou modération (même règle que la page /results et updateTournament)
  // Organisateur, commissaire ou modérateur : règle écrite une seule fois (lib/tournamentRights.ts, carte 201)
  const viewer = { id: session.user.id, isModerator: isModerator(session.user.role) };
  if (!canManageTournament(viewer, tournament)) {
    console.warn(`[cancelTournament] Accès refusé pour l'utilisateur ${session.user.id} (Rôle: ${session.user.role}) sur le tournoi ${tournamentId} (Organisateur: ${tournament.organizerId})`);
    return { success: false, error: "Tu dois être connecté." };
  }

  await (prisma.tournament as any).update({
    where: { id: tournamentId },
    data: { 
      isCancelled: true,
      isFinished: true // Un tournoi annulé est automatiquement terminé
    }
  });

  refreshTournament({ id: tournamentId, topicId: tournament.topic?.id, affectsRanking: true });
  return { success: true };
}

/**
 * Rétablit un tournoi annulé (carte 187) : organisateur, commissaires ou modération, comme l'annulation. L'annulation
 * marquait aussi le tournoi terminé : il le reste seulement s'il a déjà des résultats. Les résultats d'un tournoi annulé
 * ne comptent pas au classement (`getRanking` écarte les tournois annulés) ; rétabli, il compte de nouveau.
 */
export async function restoreTournament(tournamentId: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user) return { success: false, error: "Tu dois être connecté." };

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: {
      commissaires: { select: { id: true } },
      topic: { select: { id: true } },
      _count: { select: { results: true } }
    }
  });

  if (!tournament) return { success: false, error: "Tournoi introuvable." };

  // Organisateur, commissaire ou modérateur : règle écrite une seule fois (lib/tournamentRights.ts, carte 201)
  const viewer = { id: session.user.id, isModerator: isModerator(session.user.role) };
  if (!canManageTournament(viewer, tournament)) {
    console.warn(`[restoreTournament] Accès refusé pour l'utilisateur ${session.user.id} (Rôle: ${session.user.role}) sur le tournoi ${tournamentId}`);
    return { success: false, error: "Tu dois être connecté." };
  }

  await prisma.tournament.update({
    where: { id: tournamentId },
    data: { isCancelled: false, isFinished: tournament._count.results > 0 }
  });

  refreshTournament({ id: tournamentId, topicId: tournament.topic?.id, affectsRanking: true });
  return { success: true };
}

/**
 * Sauvegarde les résultats d'un tournoi (classement et matchs/rondes).
 */
export async function saveTournamentResults(tournamentId: string, data: { results: any[], rounds: any[] }): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user) return { success: false, error: "Non authentifié" };

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { commissaires: { select: { id: true } }, topic: { select: { id: true } } }
  });

  if (!tournament) return { success: false, error: "Tournoi non trouvé" };

  // Organisateur, commissaire ou modérateur : règle écrite une seule fois (lib/tournamentRights.ts, carte 201)
  const viewer = { id: session.user.id, isModerator: isModerator(session.user.role) };
  if (!canManageTournament(viewer, tournament)) {
    console.warn(`[saveTournamentResults] Accès refusé pour l'utilisateur ${session.user.id} (Rôle: ${session.user.role}) sur le tournoi ${tournamentId} (Organisateur: ${tournament.organizerId})`);
    return { success: false, error: "Non autorisé" };
  }

  // Points CDF recalculés ici avec la formule officielle (common/utils/cdf.ts), sans faire confiance
  // aux points envoyés par le navigateur. Mêmes paramètres que l'éditeur de résultats.
  const cdfType = (tournament.typeCDF || "INDIVIDUEL") as CdfTournamentType;
  const cdfRounds = cdfRoundsCount(tournament.totalMatches, data.rounds.length, tournament.days);
  const cdfParticipants = data.results.length;

  // Tournoi CDF : chaque coach doit avoir un rang (carte 162). Un rang vide donnait auparavant les points du vainqueur.
  if (tournament.isCDF) {
    const withoutRank = data.results.find((res) => !isValidRank(res.rank));
    if (withoutRank) {
      return { success: false, error: `Le rang de ${withoutRank.coachName || "un coach"} est vide ou invalide : chaque coach d'un tournoi CDF doit avoir un rang (1, 2, 3…).` };
    }
  }

  try {
    // Utilisation d'une transaction pour tout mettre à jour proprement
    await prisma.$transaction(async (tx) => {
      // 1. Supprimer les anciens résultats/rondes/matchs
      await tx.tournamentResult.deleteMany({ where: { tournamentId } });
      await tx.tournamentRound.deleteMany({ where: { tournamentId } });

      // 2. Créer les nouveaux résultats (une requête pour tous)
      await tx.tournamentResult.createMany({
        data: data.results.map((res) => ({
            tournamentId,
            coachName: res.coachName,
            nafNumber: res.nafNumber ? String(res.nafNumber) : null,
            userId: res.userId || null,
            roster: res.roster || null,
            wins: Number(res.wins) || 0,
            draws: Number(res.draws) || 0,
            losses: Number(res.losses) || 0,
            casualties: Number(res.casualties) || 0,
            points: tournament.isCDF
              ? calculateCdfPoints(cdfType, cdfRounds, cdfParticipants, Number(res.rank))
              : Number(res.points) || 0,
            rank: res.rank ? Number(res.rank) : null,
            autoCalculate: res.autoCalculate ?? true
        }))
      });

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

        // Une requête par ronde pour tous ses matchs
        await tx.tournamentMatch.createMany({
          data: sortedMatches.map((m) => ({
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
          }))
        });
      }

      // 4. Marquer le tournoi comme terminé. Des résultats modifiés doivent être revalidés par la modération avant de
      // compter de nouveau au classement CDF (carte 162) : la validation précédente est retirée.
      await tx.tournament.update({
        where: { id: tournamentId },
        data: { isFinished: true, cdfValidatedAt: null, cdfValidatedById: null }
      });
    });

    refreshTournament({ id: tournamentId, topicId: tournament.topic?.id, affectsRanking: true });

    return { success: true };
  } catch (error: any) {
    console.error("Erreur saveTournamentResults:", error);
    return { success: false, error: error.message || "Erreur interne" };
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

/**
 * Marque un tournoi comme non terminé (ré-ouvre le tournoi).
 */
export async function unfinishTournament(tournamentId: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user) return { success: false, error: "Tu dois être connecté." };

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { 
      commissaires: { select: { id: true } },
      topic: { select: { id: true } }
    }
  });

  if (!tournament) return { success: false, error: "Tournoi introuvable." };

  // Autorisation : Organisateur, Commissaire ou modération (même règle que la page /results et updateTournament)
  // Organisateur, commissaire ou modérateur : règle écrite une seule fois (lib/tournamentRights.ts, carte 201)
  const viewer = { id: session.user.id, isModerator: isModerator(session.user.role) };
  if (!canManageTournament(viewer, tournament)) {
    console.warn(`[unfinishTournament] Accès refusé pour l'utilisateur ${session.user.id} (Rôle: ${session.user.role}) sur le tournoi ${tournamentId}`);
    return { success: false, error: "Tu dois être connecté." };
  }

  await (prisma.tournament as any).update({
    where: { id: tournamentId },
    data: { isFinished: false }
  });

  refreshTournament({ id: tournamentId, topicId: tournament.topic?.id });
  return { success: true };
}

/**
 * Supprime tous les résultats et matchs d'un tournoi.
 */
export async function clearTournamentResults(tournamentId: string): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user) return { success: false, error: "Non authentifié" };

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    include: { 
      commissaires: { select: { id: true } },
      topic: { select: { id: true } }
    }
  });

  if (!tournament) return { success: false, error: "Tournoi non trouvé" };

  // Organisateur, commissaire ou modérateur : règle écrite une seule fois (lib/tournamentRights.ts, carte 201)
  const viewer = { id: session.user.id, isModerator: isModerator(session.user.role) };
  if (!canManageTournament(viewer, tournament)) {
    return { success: false, error: "Non autorisé" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Supprimer les résultats, rondes (matchs supprimés en cascade par onDelete: Cascade)
      await tx.tournamentResult.deleteMany({ where: { tournamentId } });
      await tx.tournamentRound.deleteMany({ where: { tournamentId } });

      // 2. Remettre le tournoi comme non terminé (optionnel mais logique après vidage), sans validation CDF (carte 162)
      await tx.tournament.update({
        where: { id: tournamentId },
        data: { isFinished: false, cdfValidatedAt: null, cdfValidatedById: null }
      });
    });

    refreshTournament({ id: tournamentId, topicId: tournament.topic?.id, affectsRanking: true });

    return { success: true };
  } catch (error: any) {
    console.error("Erreur clearTournamentResults:", error);
    return { success: false, error: error.message || "Erreur interne" };
  }
}

/**
 * Valide (validate = true) ou retire la validation (validate = false) des résultats d'un tournoi du Championnat de France
 * (carte 162). Réservé aux modérateurs et aux administrateurs : leur rôle est relu en base à chaque lecture de la
 * session (auth.ts). Seuls les résultats validés comptent au classement national (app/classement/actions.ts).
 * L'action est notée au journal de modération.
 */
export async function setCdfValidation(tournamentId: string, validate: boolean): Promise<ActionResult> {
  const session = await getActiveSession();
  if (!session?.user?.id) return { success: false, error: "Tu dois être connecté." };
  if (!isModerator(session.user.role)) {
    return { success: false, error: "Seuls les modérateurs et les administrateurs peuvent valider les résultats d'un tournoi CDF." };
  }

  const tournament = await prisma.tournament.findUnique({
    where: { id: tournamentId },
    select: { id: true, name: true, isCDF: true, isFinished: true, isCancelled: true, topic: { select: { id: true } }, _count: { select: { results: true } } }
  });
  if (!tournament) return { success: false, error: "Tournoi introuvable." };
  if (!tournament.isCDF) return { success: false, error: "Ce tournoi ne compte pas pour le Championnat de France." };
  if (validate) {
    if (tournament.isCancelled) return { success: false, error: "Ce tournoi est annulé : ses résultats ne peuvent pas compter au classement." };
    if (!tournament.isFinished || tournament._count.results === 0) {
      return { success: false, error: "Les résultats de ce tournoi n'ont pas encore été publiés." };
    }
  }

  await prisma.tournament.update({
    where: { id: tournamentId },
    data: validate
      ? { cdfValidatedAt: new Date(), cdfValidatedById: session.user.id }
      : { cdfValidatedAt: null, cdfValidatedById: null }
  });

  await logModerationAction(
    session.user.id,
    validate ? "TOURNAMENT_CDF_VALIDATED" : "TOURNAMENT_CDF_UNVALIDATED",
    tournament.topic?.id,
    tournament.topic ? "TOPIC" : undefined,
    `Tournoi « ${tournament.name} »`
  );

  refreshTournament({ id: tournamentId, topicId: tournament.topic?.id, affectsRanking: true });
  return { success: true };
}
