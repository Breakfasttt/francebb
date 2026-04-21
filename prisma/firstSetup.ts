import { PrismaLibSql } from "@prisma/adapter-libsql";
import { questions as quizQuestions } from "../app/bbquizz/data/questions";
import { PrismaClient } from "./generated-client";

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
      role: "SUPERADMIN",
      theme: "saison3"
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
    let category = await prisma.category.findUnique({ where: { name: cat.name } });
    if (!category) {
      category = await prisma.category.create({
        data: { name: cat.name, order: cat.order }
      });
    } else {
      await prisma.category.update({
        where: { id: category.id },
        data: { order: cat.order }
      });
    }

    for (const f of cat.forums) {
      let forum = await prisma.forum.findUnique({ where: { name: f.name } });
      if (!forum) {
        forum = await prisma.forum.create({
          data: {
            name: f.name,
            description: f.description,
            categoryId: category.id,
            isTournamentForum: f.isTournamentForum || false
          }
        });
      } else {
        await prisma.forum.update({
          where: { id: forum.id },
          data: {
            description: f.description,
            isTournamentForum: f.isTournamentForum || false,
            categoryId: category.id
          }
        });
      }

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
  const systemResources: any[] = [];

  for (const res of systemResources) {
    await prisma.resource.upsert({
      where: { id: res.id },
      update: { 
        isSystem: true, 
        status: "APPROVED",
        tags: {
          connectOrCreate: {
            where: { name: "officiel" },
            create: { name: "officiel" }
          }
        }
      },
      create: {
        ...res,
        status: "APPROVED",
        isSystem: true,
        authorId: systemUserId,
        tags: {
          connectOrCreate: {
            where: { name: "officiel" },
            create: { name: "officiel" }
          }
        }
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

  // 7. Paramètres du site (Guide du Débutant)
  console.log("--- Configuration des paramètres du site (Guide)...");
  const siteSettings = [
    {
      key: "how_to_play_what_is_bb",
      value: `[size=1.5rem][color=#c21d1d]Le Sport le plus Brutal du Vieux Monde[/color][/size]
[hr]
Blood Bowl est un mélange détonnant de [b]football américain[/b] et de [b]fantasy parodique[/b]. Dans cet univers inspiré de Warhammer, la guerre a été remplacée par un sport sacré où tous les coups sont permis.

[b]Le principe est simple :[/b]
Deux équipes s'affrontent sur un terrain de 26 cases de long. Le but est de porter le ballon dans la zone d'en-but adverse pour marquer un touchdown. 

[list]
[*] [b]Tactique :[/b] Gérez vos placements et vos probabilités. Chaque action (ramasser le ballon, faire une passe, bloquer un adversaire) demande un jet de dés.
[*] [b]Violence :[/b] Écrasez vos adversaires pour libérer le passage. Les blessures (et parfois les morts) font partie intégrante du spectacle !
[*] [b]Races :[/b] Humains, Orcs, Elfes Sylvain, Nains, Skavens... chaque race possède un style de jeu radicalement différent.
[/list]

[i]Préparez vos protège-tibias, car sur le terrain, personne ne vous entendra crier (à part les fans en délire) ![/i]`
    },
    {
      key: "how_to_play_platforms",
      value: `[size=1.5rem][color=#c21d1d]Trois Façons de Fouler le Gazon[/color][/size]
[hr]
Il existe plusieurs manières de pratiquer Blood Bowl, que vous préfériez le contact physique des figurines ou le confort de votre fauteuil de gaming.

[b]1. Le Jeu de Plateau (Tabletop)[/b]
C'est le format original ("Vis-à-vis"). On y joue avec des figurines peintes sur un plateau en carton. C'est ici que bat le cœur de la communauté française. C'est social, stratégique et visuellement magnifique.

[b]2. Fumbbl (L'expérience gratuite)[/b]
[url=https://fumbbl.com]Fumbbl[/url] est une plateforme gratuite et historique fonctionnant sur navigateur. Très axée sur la stratégie pure, elle permet de jouer des ligues compétitives avec des coachs du monde entier sur presque n'importe quel ordinateur.

[b]3. Blood Bowl 3 (Le jeu vidéo)[/b]
Développé par Cyanide, c'est l'adaptation moderne sur PC, PS5 et Xbox. Idéal pour apprendre les règles de la dernière édition (BB2020) avec des graphismes 3D et une gestion automatique des points de règle.

[spoiler=Lequel choisir ?]Tous ! La plupart des coachs commencent par le jeu vidéo pour apprendre les bases, puis rejoignent une ligue locale pour l'ambiance et les tournois de vis-à-vis.[/spoiler]`
    },
    {
      key: "how_to_play_community",
      value: `[size=1.5rem][color=#c21d1d]La Force de la Communauté Française[/color][/size]
[hr]
Vous n'êtes pas seul ! La France possède l'une des communautés les plus actives au monde.

[b]Le Forum France Blood Bowl[/b]
C'est le point de ralliement officiel. Vous y trouverez les annonces de tournois, les discussions tactiques et les petites annonces.

[b]Le Discord FBB[/b]
Pour discuter en temps réel, demander des conseils de peinture ou organiser des matchs en ligne. [url=https://discord.gg/V8D8XbZ]Cliquez ici pour rejoindre[/url].

[b]Trouver une Ligue Locale[/b]
Rien ne vaut de jouer régulièrement dans un club. Que vous soyez à Paris (Lutece Cup), Nantes (BN), Lyon (LBB) ou partout ailleurs, il y a probablement une ligue près de chez vous.
[list]
[*] [b]Lutece Cup :[/b] La plus grosse ligue de Paris.
[*] [b]La BN :[/b] Des coachs passionnés dans l'Ouest.
[*] [b]L'Azur Bowl :[/b] Pour jouer sous le soleil du Sud.
[/list]
Consultez notre [url=/carte]Carte des Ligues[/url] pour trouver votre futur club !`
    },
    {
      key: "how_to_play_tournaments",
      value: `[size=1.5rem][color=#c21d1d]L'Adrénaline des Tournois[/color][/size]
[hr]
Participer à un tournoi est l'expérience ultime. Presque chaque week-end, une ville de France accueille un événement.

[b]Comment ça se passe ?[/b]
Un tournoi dure généralement 2 jours (5 ou 6 matchs). Vous venez avec votre équipe, rencontrez différents adversaires et partagez des repas (souvent de la bière et des burgers) entre passionnés.

[b]Comment s'inscrire ?[/b]
[list=1]
[*] Consultez le calendrier sur [url=https://www.teamfrancebb.fr/tournois/]le calendrier fédéral[/url] ou la section Tournois du forum.
[*] Manifestez votre intérêt sur le sujet dédié.
[*] Réglez votre inscription (souvent entre 15€ et 30€).
[*] Préparez votre "Roster" (feuille d'équipe) selon le règlement spécifique du tournoi.
[/list]

[accordion=Le sac du tournoyeur]N'oubliez pas vos dés, vos figurines, votre réglette, mais surtout votre bonne humeur ! Les tournois sont avant tout des moments de convivialité.[/accordion]`
    },
    {
      key: "how_to_play_naf_cdf_rtc",
      value: `[size=1.5rem][color=#c21d1d]Les Structures et la Compétition[/color][/size]
[hr]
Pour ceux qui aiment le classement et le prestige, Blood Bowl est très structuré en France.

[b]La NAF (Association Internationale)[/b]
C'est l'organisme mondial. Adhérer à la NAF (env. 10€) vous donne un numéro unique et un classement Elo mondial. Chaque année, vous recevez également des dés de blocage exclusifs.

[b]Les RTC (Regroupement Territorial de Clubs)[/b]
La France est divisée en 5 zones géographiques (Nord-Est, Nord-Ouest, Île-de-France, Sud-Est et Sud-Ouest). Chaque zone est gérée par un coordinateur (le [b]RTC[/b]) qui fait le lien entre la NAF et les clubs locaux, valide les tournois et anime sa région.

[b]Le Championnat de France (CdF)[/b]
C'est le grand rassemblement annuel de la communauté. Contrairement aux tournois classiques individuels, le CdF se joue généralement par [b]équipes de clubs[/b]. C'est l'événement le plus attendu pour l'esprit de corps et la compétition nationale.

[b]Le Système de Points CdF :[/b] Pour le classement individuel annuel, vous devez performer dans plusieurs zones différentes pour espérer décrocher le titre, ce qui encourage les coachs à voyager partout en France !`
    },
    {
      key: "how_to_play_challenges",
      value: `[size=1.5rem][color=#c21d1d]Les Challenges Régionaux[/color][/size]
[hr]
En plus du circuit national, de nombreuses régions organisent leurs propres trophées pour récompenser la régularité locale.

[list]
[*] [b]Challenge du Grand Ouest (CGO) :[/b] Regroupe les tournois de Bretagne, Normandie et Pays de la Loire.
[*] [b]Trophée du Grand Est (TGE) :[/b] Pour les coachs de l'Est de la France.
[*] [b]Sud-Est et Sud-Ouest :[/b] Des circuits dynamiques pour les coachs du littoral.
[/list]

Ces challenges permettent d'avoir des objectifs à taille humaine et de créer des rivalités amicales entre clubs voisins. Chaque challenge possède son propre classement et ses récompenses en fin de saison.`
    }
  ];

  for (const setting of siteSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {}, // On ne l'écrase pas s'il existe déjà
      create: setting
    });
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
