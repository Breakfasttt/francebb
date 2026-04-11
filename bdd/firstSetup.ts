import { PrismaClient } from "../prisma/generated-client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { questions as quizQuestions } from "../app/bbquizz/data/questions";

/**
 * Script de configuration initiale (First Setup) de la base de données BBFrance.
 * Ce script est idempotent : il peut être exécuté plusieurs fois sans écraser les données existantes.
 * 
 * REGLES ABSOLUES :
 * - NE JAMAIS SUPPRIMER ce fichier.
 * - NE JAMAIS MODIFIER les données existantes sans accord explicite de l'utilisateur.
 * - NE JAMAIS RESET la base de données via ce script.
 */

const config = { url: "file:./dev.db" };
const adapter = new PrismaLibSql(config);
const prisma = new PrismaClient({ adapter });

async function firstSetup() {
  console.log("🚀 Lancement du setup initial de la base de données...");

  // 1. Rôles de base
  console.log("--- Configuration des rôles...");
  const baseRoles = [
    { name: "SUPERADMIN", label: "Super Admin", power: 100, color: "#c21d1d" },
    { name: "ADMIN", label: "Administrateur", power: 90, color: "#e11d48" },
    { name: "MODERATOR", label: "Modérateur", power: 70, color: "#f59e0b" },
    { name: "RTC", label: "RTC", power: 50, color: "#8b5cf6" },
    { name: "CHEF_LIGUE", label: "Chef de ligue", power: 40, color: "#10b981" },
    { name: "COACH", label: "Coach", power: 10, color: "#64748b" },
  ];

  for (const br of baseRoles) {
    await prisma.roleConfig.upsert({
      where: { name: br.name },
      update: { label: br.label, power: br.power, color: br.color },
      create: { ...br, isBaseRole: true }
    });
  }

  // 2. Utilisateurs système
  console.log("--- Création des utilisateurs système...");
  const systemUserId = "system";
  await prisma.user.upsert({
    where: { id: systemUserId },
    update: {},
    create: {
      id: systemUserId,
      name: "Système",
      email: "system@bbfrance.fr",
      role: "SUPERADMIN"
    }
  });

  // 3. Données de référence (Régions, Depts, Plateformes, Éditions)
  console.log("--- Configuration des données de référence...");
  
  const refDataGroups = [
    {
      group: "COACH_REGION",
      data: [
        { key: "R1-IDF", label: "R1 - Île-de-France", order: 1 },
        { key: "R2-NO", label: "R2 - Nord-Ouest", order: 2 },
        { key: "R3-NE", label: "R3 - Nord-Est", order: 3 },
        { key: "R4-SE", label: "R4 - Sud-Est", order: 4 },
        { key: "R5-SO", label: "R5 - Sud-Ouest", order: 5 },
      ]
    },
    {
      group: "REGION_FRANCE",
      data: [
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
      ]
    },
    {
      group: "GAME_EDITION",
      data: [
        { key: "BB25", label: "Blood Bowl 2025", order: 1 },
        { key: "BB20", label: "Blood Bowl 2020", order: 2 },
        { key: "BB3", label: "Blood Bowl 3", order: 3 },
        { key: "BB7", label: "Blood Bowl 7's", order: 4 },
        { key: "GutterBowl", label: "Gutter Bowl", order: 5 },
        { key: "Classic", label: "Classic / LRB6", order: 6 },
        { key: "DungeonBowl", label: "Dungeon Bowl", order: 7 },
      ]
    },
    {
      group: "PLATFORM",
      data: [
        { key: "Tabletop", label: "Tabletop (Plateau)", order: 1 },
        { key: "Fumbbl", label: "Fumbbl", order: 2 },
        { key: "VideoGame", label: "Jeu Vidéo (BB3/BB2)", order: 3 },
        { key: "Other", label: "Autre", order: 4 },
      ]
    },
    {
      group: "TOURNAMENT_TYPE",
      data: [
        { key: "LIGUE", label: "Ligue", order: 1 },
        { key: "SWISS", label: "Tournoi - ronde suisse", order: 2 },
        { key: "ROBIN", label: "Tournoi - toute ronde", order: 3 },
        { key: "BRACKET", label: "Tournoi - Bracket", order: 4 },
        { key: "DBRACKET", label: "Tournoi - Double Bracket", order: 5 },
        { key: "OTHER", label: "Autre", order: 6 },
      ]
    },
    {
      group: "TOURNAMENT_FORMAT",
      data: [
         { key: "Evolutif", label: "Évolutif", order: 1 },
         { key: "Resurrection", label: "Résurrection", order: 2 },
         { key: "Other", label: "Autre", order: 3 },
      ]
    }
  ];

  for (const group of refDataGroups) {
    for (const item of group.data) {
      await prisma.referenceData.upsert({
        where: { group_key: { group: group.group, key: item.key } },
        update: { label: item.label, order: item.order },
        create: { group: group.group, key: item.key, label: item.label, order: item.order, isActive: true }
      });
    }
  }

  // 4. Structure de base du Forum
  console.log("--- Configuration de la structure du forum...");
  const forumData = [
    {
      name: "Les tribunes",
      order: 1,
      forums: [
        { name: "Bienvenue à toi le noob !", description: "Présentations et accueil des nouveaux coachs." },
        { name: "Les petites discussions à la buvette", description: "Actualités, rumeurs et discussions générales." },
        { name: "Le salon des figurinistes", description: "Peinture, sculpture et modélisme." },
        { name: "La brocante", description: "Achats, ventes et échanges." },
      ]
    },
    {
      name: "Le terrain",
      order: 2,
      forums: [
        { name: "Les tournois", description: "Annonces, résultats et débriefings de tournois.", isTournamentForum: true },
        { name: "Les challenges régionaux", description: "Classements et infos sur les compétitions régionales." },
        { name: "Le championnat de France", description: "Tout sur l'événement majeur annuel." },
        { name: "Les ligues", description: "Annuaires et vie des ligues locales." },
      ]
    },
    {
      name: "Les vestiaires",
      order: 3,
      forums: [
        { name: "Rosters en tournoi et en ligue", description: "Optimisation d'équipe et choix de compétences." },
        { name: "Tableau noir", description: "Tactiques approfondies et schémas de jeu." },
        { name: "Précisions sur les règles", description: "Questions d'arbitrage et interprétations." },
      ]
    }
  ];

  for (const cat of forumData) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: { order: cat.order },
      create: { name: cat.name, order: cat.order }
    });

    for (const f of cat.forums) {
      const forum = await prisma.forum.upsert({
        where: { name: f.name },
        update: { description: f.description, isTournamentForum: f.isTournamentForum || false },
        create: { 
          name: f.name, 
          description: f.description, 
          categoryId: category.id,
          isTournamentForum: f.isTournamentForum || false
        }
      });

      // Topic d'accueil si vide
      const topicCount = await prisma.topic.count({ where: { forumId: forum.id } });
      if (topicCount === 0) {
        await prisma.topic.create({
          data: {
            title: `Bienvenue dans ${f.name}`,
            forumId: forum.id,
            authorId: systemUserId,
            posts: {
              create: {
                content: `Ceci est le début de la section **${f.name}**. N'hésitez pas à lancer une discussion !`,
                authorId: systemUserId,
              }
            }
          }
        });
      }
    }
  }

  // 5. Ressources Système
  console.log("--- Configuration des ressources système...");
  const systemResources = [
    {
      id: "bbpusher",
      title: "BB Pusher",
      description: "Plateau tactique interactif pour Blood Bowl.",
      link: "/bbpusher",
      imageUrl: "/images/bbpusher-preview.jpg"
    },
    {
      id: "bbquizz",
      title: "Quizz Blood Bowl",
      description: "Testez vos connaissances sur Blood Bowl !",
      link: "/bbquizz",
      imageUrl: "/images/quiz-preview.jpg"
    }
  ];

  for (const res of systemResources) {
    await prisma.resource.upsert({
      where: { id: res.id },
      update: { isSystem: true, status: "APPROVED" },
      create: {
        id: res.id,
        ...res,
        status: "APPROVED",
        isSystem: true,
        authorId: systemUserId
      }
    });
  }

  // 6. Questions du Quiz
  console.log("--- Configuration des questions du quiz...");
  const currentQuestionsCount = await prisma.quizQuestion.count();
  if (currentQuestionsCount === 0) {
    for (const q of quizQuestions) {
      await prisma.quizQuestion.create({
        data: {
          category: q.category,
          question: q.question,
          options: JSON.stringify(q.options),
          correctIndex: q.correctIndex,
          explanation: q.explanation || null
        }
      });
    }
  }

  console.log("✅ Setup initial terminé avec succès !");
}

firstSetup()
  .catch((e) => {
    console.error("❌ Erreur lors du setup initial:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
