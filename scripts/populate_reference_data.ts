import { PrismaClient } from "../prisma/generated-client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const config = { url: "file:./dev.db" };
const adapter = new PrismaLibSql(config);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Populating reference data...");

  const platforms = [
    { key: "Tabletop", label: "Tabletop", order: 1 },
    { key: "Fumbbl", label: "Fumbbl", order: 2 },
    { key: "VideoGame", label: "Jeu vidéo", order: 3 },
    { key: "Other", label: "Autre", order: 4 },
  ];

  const gameEditions = [
    { key: "BB2025", label: "BB2025", order: 1 },
    { key: "BB2020", label: "BB2020", order: 2 },
    { key: "BB7", label: "BB7", order: 3 },
    { key: "DungeonBowl", label: "Dungeon Bowl", order: 4 },
    { key: "Other", label: "Autre", order: 5 },
  ];

  const tournamentFormats = [
    { key: "Evolutif", label: "Évolutif", order: 1 },
    { key: "Resurrection", label: "Résurrection", order: 2 },
    { key: "Other", label: "Autre", order: 3 },
  ];

  const tournamentTypes = [
    { key: "LIGUE", label: "Ligue", order: 1 },
    { key: "SWISS", label: "Tournoi - ronde suisse", order: 2 },
    { key: "ROBIN", label: "Tournoi - toute ronde", order: 3 },
    { key: "BRACKET", label: "Tournoi - Bracket", order: 4 },
    { key: "DBRACKET", label: "Tournoi - Double Bracket", order: 5 },
    { key: "OTHER", label: "Autre", order: 6 },
  ];

  const allRefData = [
    { group: "PLATFORM", data: platforms },
    { group: "GAME_EDITION", data: gameEditions },
    { group: "TOURNAMENT_FORMAT", data: tournamentFormats },
    { group: "TOURNAMENT_TYPE", data: tournamentTypes },
  ];

  for (const group of allRefData) {
    for (const item of group.data) {
      await prisma.referenceData.upsert({
        where: { group_key: { group: group.group, key: item.key } },
        update: { label: item.label, order: item.order, isActive: true },
        create: {
          group: group.group,
          key: item.key,
          label: item.label,
          order: item.order,
          isActive: true
        }
      });
    }
  }

  console.log("Reference data populated successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
