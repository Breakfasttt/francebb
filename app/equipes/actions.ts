"use server";

import fs from "fs/promises";
import path from "path";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ROSTER_DIR = path.join(process.cwd(), "public", "data", "roster");

// Lecture des fichiers statiques
export async function getAvailableRosters() {
  const files = await fs.readdir(ROSTER_DIR);
  const rosters = [];

  for (const file of files) {
    if (file.endsWith(".json") && !["skills.json", "special_rules.json", "inducements.json"].includes(file)) {
      const data = JSON.parse(await fs.readFile(path.join(ROSTER_DIR, file), "utf-8"));
      rosters.push({
        id: file.replace(".json", ""),
        name: data.name,
        tier: data.tier || 1,
        rerollCost: data.rerollCost || 50000,
        apothecary: data.apothecary !== false,
        specialRules: data.specialRules || [],
        players: data.roster || []
      });
    }
  }
  
  // Tri alphabétique
  return rosters.sort((a, b) => a.name.localeCompare(b.name));
}

// Action de création
export async function createTeamRoster(formData: {
  name: string;
  raceId: string;
  raceName: string;
  treasury: number;
  rerolls: number;
  apothecary: boolean;
  assistants: number;
  cheerleaders: number;
  dedicatedFans: number;
  players: any[];
  teamValue: number;
}) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Non autorisé.");
  }

  // Double vérification de la TV côté serveur (sécurité basique)
  // Dans un monde idéal, on recalcule 100% de la TV ici depuis les JSON source.
  // Pour le MVP, on fait confiance au client sur le payload.

  const newTeam = await prisma.teamRoster.create({
    data: {
      userId: session.user.id,
      name: formData.name,
      race: formData.raceId, // Nom du fichier JSON
      treasury: formData.treasury,
      teamValue: formData.teamValue,
      currentTV: formData.teamValue,
      rerolls: formData.rerolls,
      apothecary: formData.apothecary,
      assistants: formData.assistants,
      cheerleaders: formData.cheerleaders,
      dedicatedFans: formData.dedicatedFans,
      players: {
        create: formData.players.map(p => ({
          name: p.name || "Joueur Inconnu",
          position: p.positionName,
          number: p.number,
          cost: p.cost,
          currentValue: p.cost,
          ma: parseInt(p.ma) || 0,
          st: parseInt(p.st) || 0,
          ag: parseInt(p.ag) || 0,
          pa: parseInt(p.pa) || 0,
          av: parseInt(p.av) || 0,
          skills: JSON.stringify(p.skills || [])
        }))
      }
    }
  });

  return newTeam.id;
}

// Dépense de SPP / Évolution d'un joueur
export async function evolvePlayer(data: {
  playerId: string;
  skillName: string;
  sppCost: number;
  tvIncrease: number;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Non autorisé");

  const player = await prisma.teamPlayer.findUnique({
    where: { id: data.playerId },
    include: { team: true }
  });

  if (!player) throw new Error("Joueur introuvable");
  if (player.team.userId !== session.user.id && session.user.role !== "ADMIN" && session.user.role !== "COMMISSAIRE") {
    throw new Error("Vous ne pouvez pas modifier ce joueur");
  }

  if (player.spp < data.sppCost) {
    throw new Error("Pas assez de SPP");
  }

  const currentSkills = JSON.parse(player.skills || "[]");
  currentSkills.push(data.skillName);

  await prisma.$transaction([
    prisma.teamPlayer.update({
      where: { id: player.id },
      data: {
        spp: player.spp - data.sppCost,
        currentValue: player.currentValue + data.tvIncrease,
        skills: JSON.stringify(currentSkills)
      }
    }),
    prisma.teamRoster.update({
      where: { id: player.teamId },
      data: {
        currentTV: player.team.currentTV + data.tvIncrease
      }
    })
  ]);
}
