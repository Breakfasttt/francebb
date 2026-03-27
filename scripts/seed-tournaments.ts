/**
 * Script de seeding pour créer 20 tournois avec leurs topics forum.
 */
import { PrismaClient } from '../prisma/generated-client';
import { PrismaLibSql } from "@prisma/adapter-libsql";
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const config = {
  url: process.env.DATABASE_URL || "file:./dev.db",
};

const adapter = new PrismaLibSql(config);
const prisma = new PrismaClient({ adapter });

const REGIONS = [
  "Auvergne-Rhone-Alpes", "Bretagne", "Ile-de-France", "Nouvelle-Aquitaine", 
  "Occitanie", "Hauts-de-France", "Grand Est", "Normandie", "Pays de la Loire"
];

const DEPTS_BY_REGION: Record<string, string[]> = {
  "Auvergne-Rhone-Alpes": ["69", "38", "01"],
  "Bretagne": ["35", "56", "29"],
  "Ile-de-France": ["75", "77", "91", "94"],
  "Nouvelle-Aquitaine": ["33", "64", "17"],
  "Occitanie": ["31", "34", "30"],
  "Hauts-de-France": ["59", "62"],
  "Grand Est": ["67", "54", "57"],
  "Normandie": ["76", "14"],
  "Pays de la Loire": ["44", "49"]
};

const TOURNAMENT_NAMES = [
  "Bowl de la Mort", "Gobelin Cup", "Orc Fest", "The Big Bash", "Chaos Cup", 
  "Dwarf Open", "Elven Magic", "Undead Rally", "Nurgle Rot", "Skaven Scurry",
  "Lizard Celebration", "Ogre Brawl", "Halfling Feast", "Tomb Kings Trophy",
  "Norse Raid", "Amazon Jungle", "Vampire Gala", "Wood Elf Glade", "Dark Elf Duel",
  "Chaos Dwarf Forge"
];

async function main() {
  console.log('--- Seeding des tournois ---');

  const tourneyForum = await prisma.forum.findFirst({
    where: { isTournamentForum: true }
  });

  if (!tourneyForum) {
    console.error("Aucun forum de tournois trouvé (isTournamentForum: true).");
    process.exit(1);
  }

  const superadmin = await prisma.user.findFirst({
    where: { role: "SUPERADMIN" }
  }) || await prisma.user.findFirst();

  if (!superadmin) {
    console.error("Aucun utilisateur trouvé.");
    process.exit(1);
  }

  const now = new Date();

  for (let i = 0; i < 20; i++) {
    const region = REGIONS[Math.floor(Math.random() * REGIONS.length)];
    const depts = DEPTS_BY_REGION[region] || ["01"];
    const dept = depts[Math.floor(Math.random() * depts.length)];
    const tournamentName = `${TOURNAMENT_NAMES[i]} ${2026}`;
    
    const date = new Date(now);
    date.setDate(now.getDate() + 10 + Math.floor(Math.random() * 200));

    const tournament = await prisma.tournament.create({
      data: {
        name: tournamentName,
        date: date,
        location: "Salle Polyvalente",
        ville: "Villedieu",
        departement: dept,
        region: region,
        gameEdition: Math.random() > 0.5 ? "BB25" : "BB20",
        ruleset: Math.random() > 0.3 ? "NAF" : "Eurobowl",
        maxParticipants: 16 + Math.floor(Math.random() * 48),
        price: 15 + Math.floor(Math.random() * 15),
        days: Math.random() > 0.3 ? "2" : "1",
        mealsIncluded: Math.random() > 0.5,
        lodgingAtVenue: Math.random() > 0.7,
        fridayArrival: Math.random() > 0.6,
        structure: Math.random() > 0.5 ? "Resurrection" : "Evolutif",
        organizerId: superadmin.id,
      }
    });

    await prisma.topic.create({
      data: {
        title: `[Inscriptions] ${tournamentName}`,
        forumId: tourneyForum.id,
        authorId: superadmin.id,
        tournamentId: tournament.id,
        posts: {
          create: {
            content: `Bienvenue au **${tournamentName}** !\n\nLieu: ${tournament.location}, ${tournament.ville}\nDate: ${tournament.date.toLocaleDateString()}\n\nVenez nombreux !`,
            authorId: superadmin.id
          }
        }
      }
    });

    console.log(`Créé: ${tournamentName}`);
  }

  console.log('--- Terminé ! ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
