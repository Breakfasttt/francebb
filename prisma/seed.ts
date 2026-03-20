import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const config = { url: "file:./dev.db" };
const adapter = new PrismaLibSql(config);
const prisma = new PrismaClient({ adapter });

async function main() {
  const userId = "user_test_breakyt";

  console.log("Upserting test user...");
  await prisma.user.upsert({
    where: { id: userId },
    update: { role: "ADMIN" },
    create: {
      id: userId,
      name: "Breakyt",
      email: "breakyt@bbfrance.fr",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Breakyt",
      role: "ADMIN"
    }
  });

  console.log("Creating role test users...");
  const rolesToSeed = ["ORGA", "MODERATOR", "RC_NAF"];
  for (const role of rolesToSeed) {
    await prisma.user.upsert({
      where: { email: `${role.toLowerCase()}@bbfrance.fr` },
      update: { role },
      create: {
        name: `Test ${role}`,
        email: `${role.toLowerCase()}@bbfrance.fr`,
        role
      }
    });
  }

  console.log("Cleaning old tournaments...");
  await prisma.tournament.deleteMany();

  console.log("Seeding rich tournament data...");

  const tournaments = [
    {
      name: "L'Aquitaine Bowl II",
      date: new Date("2026-05-15"),
      location: "Bordeaux",
      ville: "Bordeaux",
      departement: "33",
      region: "Nouvelle-Aquitaine",
      description: "Le plus grand tournoi du Sud-Ouest revient !",
      gameEdition: "BB20",
      maxParticipants: 48,
      currentParticipants: 32,
      days: "2",
      price: 25.0,
      structure: "Resurrection",
      lodgingAtVenue: false,
      ruleset: "Eurobowl",
      mealsIncluded: true,
      fridayArrival: true,
    },
    {
      name: "Paris Open Cup",
      date: new Date("2026-06-10"),
      location: "Paris",
      ville: "Paris",
      departement: "75",
      region: "Ile-de-France",
      description: "Venez affronter l'élite parisienne.",
      gameEdition: "BB3/WBB",
      maxParticipants: 32,
      currentParticipants: 12,
      days: "1",
      price: 15.0,
      structure: "Resurrection",
      lodgingAtVenue: false,
      ruleset: "NAF",
      mealsIncluded: false,
      fridayArrival: false,
    },
    {
      name: "La Ligue du Vieux Monde",
      date: new Date("2026-04-01"),
      location: "Lyon",
      ville: "Lyon",
      departement: "69",
      region: "Auvergne-Rhone-Alpes",
      description: "Une saison complète pour faire évoluer votre équipe.",
      gameEdition: "BB20",
      maxParticipants: 16,
      currentParticipants: 8,
      days: "Saison Rythme",
      price: 10.0,
      structure: "Evolutif",
      lodgingAtVenue: false,
      ruleset: "Custom",
      mealsIncluded: false,
      fridayArrival: false,
    },
    {
      name: "Bretagne Smash",
      date: new Date("2026-07-20"),
      location: "Rennes",
      ville: "Rennes",
      departement: "35",
      region: "Bretagne",
      description: "De la bière, du cidre et du Blood Bowl.",
      gameEdition: "BB7",
      maxParticipants: 24,
      currentParticipants: 24,
      days: "2",
      price: 20.0,
      structure: "Resurrection",
      lodgingAtVenue: true,
      ruleset: "NAF",
      mealsIncluded: true,
      fridayArrival: true,
    },
    {
      name: "Le Grand Chelem Toulousain",
      date: new Date("2026-08-05"),
      location: "Toulouse",
      ville: "Toulouse",
      departement: "31",
      region: "Occitanie",
      description: "Un tournoi sur 3 jours pour les vrais passionnés.",
      gameEdition: "BB25",
      maxParticipants: 64,
      currentParticipants: 45,
      days: "3j+",
      price: 40.0,
      structure: "Resurrection",
      lodgingAtVenue: true,
      ruleset: "Eurobowl",
      mealsIncluded: true,
      fridayArrival: true,
    },
    {
      name: "Dungeon Bowl Masters",
      date: new Date("2027-03-30"),
      location: "Hauts-de-Seine, Ile-de-France",
      ville: "Nanterre",
      departement: "92",
      region: "Ile-de-France",
      description: "Explorez les donjons dans cette variante déjantée.",
      maxParticipants: 24,
      currentParticipants: 12,
      preRegistered: 2,
      days: "1",
      totalMatches: 3,
      price: 15.0,
      structure: "Resurrection",
      lodgingAtVenue: false,
      ruleset: "Dungeon Bowl",
      mealsIncluded: false,
      fridayArrival: false,
      gameEdition: "DB"
    }
  ];

  for (const t of tournaments) {
    await prisma.tournament.create({
      data: {
        ...t,
        organizerId: userId,
      }
    });
  }

  console.log("Cleaning old forum data...");
  await prisma.post.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.forum.deleteMany();
  await prisma.category.deleteMany();

  console.log("Seeding forum hierarchy...");

  const forumData = [
    {
      name: "Les tribunes",
      order: 1,
      forums: [
        { name: "Bienvenue à toi le noob !", description: "Présentations et accueil des nouveaux coachs." },
        { name: "Les petites discussions à la buvette", description: "Actualités, rumeurs et discussions générales." },
        { name: "Le salon des figurinistes", description: "Peinture, sculpture et modélisme." },
        { name: "La brocante", description: "Achats, ventes et échanges." },
        { name: "La bibliothèque", description: "Fluff, histoires et récits épiques." },
        { name: "L'épique TV", description: "Vidéos, streams et podcasts Blood Bowl." },
      ]
    },
    {
      name: "Le terrain",
      order: 2,
      forums: [
        { name: "Les tournois", description: "Annonces, résultats et débriefings de tournois." },
        { name: "Les challenges régionaux", description: "Classements et infos sur les compétitions régionales." },
        { name: "Le championnat de France", description: "Tout sur l'événement majeur annuel." },
        { name: "La NAF / La NAF World Cup", description: "Actualités internationales et Coupe du Monde." },
        { name: "Les ligues", description: "Annuaires et vie des ligues locales." },
      ]
    },
    {
      name: "Sombre Fontaine",
      order: 3,
      forums: [
        { name: "Le Stade De France", description: "Tout sur l'Équipe de France et les Eurobowls." },
      ]
    },
    {
      name: "BloodBowl en ligne",
      order: 4,
      forums: [
        { name: "FUMBBL", description: "Discussions autour de la plateforme historique." },
        { name: "Blood Bowl 3", description: "Le jeu vidéo de Cyanide/Nacon." },
      ]
    },
    {
      name: "Les vestiaires",
      order: 5,
      forums: [
        { name: "Rosters en tournoi et en ligue", description: "Optimisation d'équipe et choix de compétences." },
        { name: "Tableau noir", description: "Tactiques approfondies et schémas de jeu." },
        { name: "Précisions sur les règles", description: "Questions d'arbitrage et interprétations." },
      ]
    },
    {
      name: "Le local technique",
      order: 6,
      forums: [
        { name: "La salle de surveillance du site", description: "Retours techniques et fonctionnement du portail." },
        { name: "La cabane à outils", description: "Logiciels, feuilles d'équipe et aide à la gestion." },
      ]
    }
  ];

  for (const cat of forumData) {
    const category = await prisma.category.create({
      data: {
        name: cat.name,
        order: cat.order,
      }
    });

    for (const f of cat.forums) {
      const forum = await prisma.forum.create({
        data: {
          name: f.name,
          description: f.description,
          categoryId: category.id,
        }
      });

      // Add a welcome topic for each forum
      const topic = await prisma.topic.create({
        data: {
          title: `Bienvenue dans ${f.name}`,
          forumId: forum.id,
          authorId: userId,
          posts: {
            create: {
              content: `Ceci est le début de la section **${f.name}**. N'hésitez pas à lancer une discussion !`,
              authorId: userId,
            }
          }
        }
      });
    }
  }

  console.log("Seed finished successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
