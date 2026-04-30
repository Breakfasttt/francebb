"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/roles";

export async function createLeagueSeason(formData: {
  ligueId: string;
  name: string;
  competitionType?: string;
  initialBudget?: number;
  startDate?: string;
  endDate?: string;
  description?: string;
}) {
  const session = await auth();
  const role = session?.user?.role;
  if (!isAdmin(role) && role !== "COMMISSAIRE") {
    throw new Error("Seul un commissaire peut créer une saison.");
  }

  const season = await prisma.leagueSeason.create({
    data: {
      name: formData.name,
      ligueId: formData.ligueId,
      status: "DRAFT",
      competitionType: formData.competitionType || "ROUND_ROBIN",
      initialBudget: formData.initialBudget || 1000000,
      startDate: formData.startDate ? new Date(formData.startDate) : null,
      endDate: formData.endDate ? new Date(formData.endDate) : null,
      description: formData.description || null
    }
  });

  return season.id;
}

export async function changeSeasonStatus(seasonId: string, newStatus: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "COMMISSAIRE") {
    throw new Error("Non autorisé");
  }

  await prisma.leagueSeason.update({
    where: { id: seasonId },
    data: { status: newStatus }
  });
}

// Inscription d'une équipe existante à la saison
export async function registerTeamToSeason(seasonId: string, teamId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");

  // On vérifie que la team appartient bien au user
  const team = await prisma.teamRoster.findUnique({
    where: { id: teamId }
  });

  if (!team || team.userId !== session.user.id) {
    throw new Error("Cette équipe ne vous appartient pas.");
  }

  if (team.seasonId) {
    throw new Error("Cette équipe est déjà engagée dans une saison.");
  }

  await prisma.teamRoster.update({
    where: { id: teamId },
    data: { seasonId }
  });
}

// Soumission d'un rapport de match
export async function submitMatchReport(data: {
  seasonId: string;
  teamAId: string;
  teamBId: string;
  scoreA: number;
  scoreB: number;
  casA: number;
  casB: number;
  notes: string;
  status: string;
  stats: any;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");

  await prisma.matchReport.create({
    data: {
      seasonId: data.seasonId,
      teamAId: data.teamAId,
      teamBId: data.teamBId,
      scoreA: data.scoreA,
      scoreB: data.scoreB,
      casualtiesA: data.casA,
      casualtiesB: data.casB,
      status: data.status,
      stats: JSON.stringify(data.stats)
    }
  });
}

// Validation croisée d'un match
export async function updateMatchStatus(matchId: string, status: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");

  const match = await prisma.matchReport.findUnique({
    where: { id: matchId },
    include: { season: true }
  });

  if (!match) throw new Error("Match introuvable");

  // Vérification des droits : admin ou joueur de l'équipe adverse
  const isAdmin = session.user.role === "ADMIN" || session.user.role === "COMMISSAIRE";
  
  if (!isAdmin) {
    // Si c'est un joueur, on vérifie que l'équipe B (ou A) lui appartient
    const userTeams = await prisma.teamRoster.findMany({
      where: { userId: session.user.id }
    });
    const ownsTeamA = userTeams.some(t => t.id === match.teamAId);
    const ownsTeamB = userTeams.some(t => t.id === match.teamBId);
    
    if (!ownsTeamA && !ownsTeamB) {
      throw new Error("Vous n'êtes pas impliqué dans ce match.");
    }
  }

  await prisma.matchReport.update({
    where: { id: matchId },
    data: { status }
  });
}
