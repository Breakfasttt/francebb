import { PrismaClient } from "./generated-client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const config = { url: "file:./dev.db" };
const adapter = new PrismaLibSql(config);
const prisma = new PrismaClient({ adapter });

async function main() {
  const userId = "user_test_breakyt";

  console.log("Cleaning all existing data...");
  await prisma.postReaction.deleteMany();
  await prisma.mention.deleteMany();
  await prisma.topicView.deleteMany();
  await prisma.privateMessage.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.post.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.forum.deleteMany();
  await prisma.category.deleteMany();
  await prisma.tournament.deleteMany();
  await prisma.user.deleteMany();
  await prisma.roleConfig.deleteMany();

  console.log("Seeding base roles...");
  const baseRoles = [
    { name: "SUPERADMIN", label: "Super Admin", power: 100, color: "#c21d1d" },
    { name: "ADMIN", label: "Administrateur", power: 90, color: "#e11d48" },
    { name: "MODERATOR", label: "Modérateur", power: 70, color: "#f59e0b" },
    { name: "RTC", label: "RTC", power: 50, color: "#8b5cf6" },
    { name: "CHEF_LIGUE", label: "Chef de ligue", power: 40, color: "#10b981" },
    { name: "COACH", label: "Coach", power: 10, color: "#64748b" },
  ];

  for (const br of baseRoles) {
    await prisma.roleConfig.create({
      data: { ...br, isBaseRole: true }
    });
  }

  console.log("Upserting test user...");
  await prisma.user.create({
    data: {
      id: userId,
      name: "Breakyt",
      email: "breakyt@bbfrance.fr",
      image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Breakyt",
      role: "ADMIN"
    }
  });

  console.log("Creating role test users...");
  const rolesToSeed = ["MODERATOR", "RTC", "CHEF_LIGUE"];
  for (const role of rolesToSeed) {
    await prisma.user.create({
      data: {
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

  console.log("Seeding forum hierarchy...");



  const forumData = [
    {
      name: "Les tribunes",
      order: 1,
      forums: [
        { name: "Bienvenue à toi le noob !", description: "Présentations et accueil des nouveaux coachs." },
        { 
          name: "Les petites discussions à la buvette", 
          description: "Actualités, rumeurs et discussions générales.",
          subForums: [
             { name: "Blood Bowl Magazine", description: "Le fanzine de la communauté." }
          ]
        },
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
        { 
          name: "Les tournois", 
          description: "Annonces, résultats et débriefings de tournois.",
          subForums: [
            { name: "Archives tournois", description: "Souvenirs des éditions passées." },
            { name: "Salle des Trophées", description: "Palmarès et récompenses." }
          ]
        },
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
        { 
          name: "Le Stade De France", 
          description: "Tout sur l'Équipe de France et les Eurobowls.",
          subForums: [
            { name: "EdF 2026 - Candidatures du sélectionneur", description: "Postulez pour mener les Bleus." },
            { name: "EdF 2026 - Candidatures des joueurs", description: "Rejoignez le squad tricolore." }
          ]
        },
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
        { 
          name: "Rosters en tournoi et en ligue", 
          description: "Optimisation d'équipe et choix de compétences.",
          subForums: [
            { name: "Rosters en tournoi", description: "Compos optimisées pour la gagne." },
            { name: "Rosters en ligue", description: "Gestion de l'évolution sur le long terme." }
          ]
        },
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
          isTournamentForum: f.name === "Les tournois"
        }
      });

      // Ajout des sous-forums si présents
      if ((f as any).subForums) {
        for (const sf of (f as any).subForums) {
          await prisma.forum.create({
            data: {
              name: sf.name,
              description: sf.description || null,
              parentForumId: forum.id
            }
          });
        }
      }

      // Add a welcome topic for each forum
      await prisma.topic.create({
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

  console.log("Seeding ReferenceData (Regions & Depts)...");
  
  const coachRegions = [
    { key: "R1-IDF", label: "R1 - Île-de-France", order: 1 },
    { key: "R2-NO", label: "R2 - Nord-Ouest", order: 2 },
    { key: "R3-NE", label: "R3 - Nord-Est", order: 3 },
    { key: "R4-SE", label: "R4 - Sud-Est", order: 4 },
    { key: "R5-SO", label: "R5 - Sud-Ouest", order: 5 },
  ];

  const franceRegions = [
    { key: "Auvergne-Rhône-Alpes", label: "Auvergne-Rhône-Alpes", order: 1 },
    { key: "Bourgogne-Franche-Comté", label: "Bourgogne-Franche-Comté", order: 2 },
    { key: "Bretagne", label: "Bretagne", order: 3 },
    { key: "Centre-Val de Loire", label: "Centre-Val de Loire", order: 4 },
    { key: "Corse", label: "Corse", order: 5 },
    { key: "Grand Est", label: "Grand Est", order: 6 },
    { key: "Hauts-de-France", label: "Hauts-de-France", order: 7 },
    { key: "Île-de-France", label: "Île-de-France", order: 8 },
    { key: "Normandie", label: "Normandie", order: 9 },
    { key: "Nouvelle-Aquitaine", label: "Nouvelle-Aquitaine", order: 10 },
    { key: "Occitanie", label: "Occitanie", order: 11 },
    { key: "Pays de la Loire", label: "Pays de la Loire", order: 12 },
    { key: "Provence-Alpes-Côte d'Azur", label: "Provence-Alpes-Côte d'Azur", order: 13 },
  ];

  const depts = [
    { key: "01", label: "01 - Ain", order: 1 }, { key: "02", label: "02 - Aisne", order: 2 },
    { key: "03", label: "03 - Allier", order: 3 }, { key: "04", label: "04 - Alpes-de-Haute-Provence", order: 4 },
    { key: "05", label: "05 - Hautes-Alpes", order: 5 }, { key: "06", label: "06 - Alpes-Maritimes", order: 6 },
    { key: "07", label: "07 - Ardèche", order: 7 }, { key: "08", label: "08 - Ardennes", order: 8 },
    { key: "09", label: "09 - Ariège", order: 9 }, { key: "10", label: "10 - Aube", order: 10 },
    { key: "11", label: "11 - Aude", order: 11 }, { key: "12", label: "12 - Aveyron", order: 12 },
    { key: "13", label: "13 - Bouches-du-Rhône", order: 13 }, { key: "14", label: "14 - Calvados", order: 14 },
    { key: "15", label: "15 - Cantal", order: 15 }, { key: "16", label: "16 - Charente", order: 16 },
    { key: "17", label: "17 - Charente-Maritime", order: 17 }, { key: "18", label: "18 - Cher", order: 18 },
    { key: "19", label: "19 - Corrèze", order: 19 }, { key: "2A", label: "2A - Corse-du-Sud", order: 20 },
    { key: "2B", label: "2B - Haute-Corse", order: 21 }, { key: "21", label: "21 - Côte-d'Or", order: 22 },
    { key: "22", label: "22 - Côtes-d'Armor", order: 23 }, { key: "23", label: "23 - Creuse", order: 24 },
    { key: "24", label: "24 - Dordogne", order: 25 }, { key: "25", label: "25 - Doubs", order: 26 },
    { key: "26", label: "26 - Drôme", order: 27 }, { key: "27", label: "27 - Eure", order: 28 },
    { key: "28", label: "28 - Eure-et-Loir", order: 29 }, { key: "29", label: "29 - Finistère", order: 30 },
    { key: "30", label: "30 - Gard", order: 31 }, { key: "31", label: "31 - Haute-Garonne", order: 32 },
    { key: "32", label: "32 - Gers", order: 33 }, { key: "33", label: "33 - Gironde", order: 34 },
    { key: "34", label: "34 - Hérault", order: 35 }, { key: "35", label: "35 - Ille-et-Vilaine", order: 36 },
    { key: "36", label: "36 - Indre", order: 37 }, { key: "37", label: "37 - Indre-et-Loire", order: 38 },
    { key: "38", label: "38 - Isère", order: 39 }, { key: "39", label: "39 - Jura", order: 40 },
    { key: "40", label: "40 - Landes", order: 41 }, { key: "41", label: "41 - Loir-et-Cher", order: 42 },
    { key: "42", label: "42 - Loire", order: 43 }, { key: "43", label: "43 - Haute-Loire", order: 44 },
    { key: "44", label: "44 - Loire-Atlantique", order: 45 }, { key: "45", label: "45 - Loiret", order: 46 },
    { key: "46", label: "46 - Lot", order: 47 }, { key: "47", label: "47 - Lot-et-Garonne", order: 48 },
    { key: "48", label: "48 - Lozère", order: 49 }, { key: "49", label: "49 - Maine-et-Loire", order: 50 },
    { key: "50", label: "50 - Manche", order: 51 }, { key: "51", label: "51 - Marne", order: 52 },
    { key: "52", label: "52 - Haute-Marne", order: 53 }, { key: "53", label: "53 - Mayenne", order: 54 },
    { key: "54", label: "54 - Meurthe-et-Moselle", order: 55 }, { key: "55", label: "55 - Meuse", order: 56 },
    { key: "56", label: "56 - Morbihan", order: 57 }, { key: "57", label: "57 - Moselle", order: 58 },
    { key: "58", label: "58 - Nièvre", order: 59 }, { key: "59", label: "59 - Nord", order: 60 },
    { key: "60", label: "60 - Oise", order: 61 }, { key: "61", label: "61 - Orne", order: 62 },
    { key: "62", label: "62 - Pas-de-Calais", order: 63 }, { key: "63", label: "63 - Puy-de-Dôme", order: 64 },
    { key: "64", label: "64 - Pyrénées-Atlantiques", order: 65 }, { key: "65", label: "65 - Hautes-Pyrénées", order: 66 },
    { key: "66", label: "66 - Pyrénées-Orientales", order: 67 }, { key: "67", label: "67 - Bas-Rhin", order: 68 },
    { key: "68", label: "68 - Haut-Rhin", order: 69 }, { key: "69", label: "69 - Rhône", order: 70 },
    { key: "70", label: "70 - Haute-Saône", order: 71 }, { key: "71", label: "71 - Saône-et-Loire", order: 72 },
    { key: "72", label: "72 - Sarthe", order: 73 }, { key: "73", label: "73 - Savoie", order: 74 },
    { key: "74", label: "74 - Haute-Savoie", order: 75 }, { key: "75", label: "75 - Paris", order: 76 },
    { key: "76", label: "76 - Seine-Maritime", order: 77 }, { key: "77", label: "77 - Seine-et-Marne", order: 78 },
    { key: "78", label: "78 - Yvelines", order: 79 }, { key: "79", label: "79 - Deux-Sèvres", order: 80 },
    { key: "80", label: "80 - Somme", order: 81 }, { key: "81", label: "81 - Tarn", order: 82 },
    { key: "82", label: "82 - Tarn-et-Garonne", order: 83 }, { key: "83", label: "83 - Var", order: 84 },
    { key: "84", label: "84 - Vaucluse", order: 85 }, { key: "85", label: "85 - Vendée", order: 86 },
    { key: "86", label: "86 - Vienne", order: 87 }, { key: "87", label: "87 - Haute-Vienne", order: 88 },
    { key: "88", label: "88 - Vosges", order: 89 }, { key: "89", label: "89 - Yonne", order: 90 },
    { key: "90", label: "90 - Territoire de Belfort", order: 91 }, { key: "91", label: "91 - Essonne", order: 92 },
    { key: "92", label: "92 - Hauts-de-Seine", order: 93 }, { key: "93", label: "93 - Seine-Saint-Denis", order: 94 },
    { key: "94", label: "94 - Val-de-Marne", order: 95 }, { key: "95", label: "95 - Val-d'Oise", order: 96 },
    { key: "971", label: "971 - Guadeloupe", order: 97 }, { key: "972", label: "972 - Martinique", order: 98 },
    { key: "973", label: "973 - Guyane", order: 99 }, { key: "974", label: "974 - La Réunion", order: 100 },
    { key: "976", label: "976 - Mayotte", order: 101 },
  ];

  const allRefData = [
    { group: "COACH_REGION", data: coachRegions },
    { group: "REGION_FRANCE", data: franceRegions },
    { group: "DEPARTEMENT_FRANCE", data: depts },
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
