import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated-client";

import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

/**
 * Données fictives du profil de base « exemple » (carte 219), lancé par `pnpm dev` à la racine.
 *
 * Remplit une base locale avec assez de contenu pour parcourir tout le site : membres de chaque rôle, forum, articles,
 * ressources, ligues, tournois, messages privés et notifications. Toutes les données sont inventées (adresses en
 * `@exemple.test`). Demande les données de base de `prisma/firstSetup.ts` (rôles, forums), lancé avant.
 *
 * Idempotent : chaque ligne a un identifiant fixe préfixé `exemple-` et passe par `upsert`. Relancer le script ne
 * crée aucun doublon et ne touche à aucune autre ligne.
 *
 * Usage, depuis apps/site : npx tsx prisma/seedScript/exampleData.ts (base visée : DATABASE_URL)
 */

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

const DAY = 24 * 60 * 60 * 1000;
const daysAgo = (days: number) => new Date(Date.now() - days * DAY);
const daysAhead = (days: number) => new Date(Date.now() + days * DAY);

const MEMBERS = [
  { id: "exemple-superadmin", name: "Grand Manitou", role: "SUPERADMIN", theme: "saison3", region: "R1-IDF", equipe: "Humains" },
  { id: "exemple-admin", name: "Admin Orque", role: "ADMIN", theme: "vestiaire", region: "R4-SE", equipe: "Orques Noirs" },
  { id: "exemple-modo", name: "Modo Nain", role: "MODERATOR", theme: "naf", region: "R3-NE", equipe: "Nains" },
  { id: "exemple-rtc", name: "Arbitre Sud-Ouest", role: "RTC", theme: "nehekhara", region: "R5-SO", equipe: "Khemri" },
  { id: "exemple-chef-ligue", name: "Chef de la Ligue Pictave", role: "CHEF_LIGUE", theme: "elfes-noirs", region: "R5-SO", equipe: "Elfes Noirs" },
  { id: "exemple-coach-1", name: "Gobelin Furtif", role: "COACH", theme: "vestiaire", region: "R2-NO", equipe: "Gobelins" },
  { id: "exemple-coach-2", name: "Skaven Pressé", role: "COACH", theme: "saison3", region: "R1-IDF", equipe: "Skavens" },
  { id: "exemple-coach-3", name: "Halfling Gourmand", role: "COACH", theme: "naf", region: "R4-SE", equipe: "Halflings" },
  { id: "exemple-coach-4", name: "Lézard Patient", role: "COACH", theme: "nehekhara", region: "R3-NE", equipe: "Hommes-Lézards" },
  { id: "exemple-nouveau", name: "Tout Nouveau", role: "COACH", theme: "vestiaire", region: null, equipe: null, onboarding: false },
] as const;

async function seedMembers() {
  for (const [index, member] of MEMBERS.entries()) {
    const data = {
      name: member.name,
      email: `${member.id}@exemple.test`,
      role: member.role,
      theme: member.theme,
      region: member.region,
      equipe: member.equipe,
      nafNumber: member.region ? String(20000 + index * 137) : null,
      signature: member.region ? `[i]${member.name}, coach ${member.equipe}[/i]` : null,
      hasFinishedOnboarding: !("onboarding" in member),
    };
    await prisma.user.upsert({ where: { id: member.id }, update: data, create: { id: member.id, ...data } });
  }

  const banned = {
    name: "Tricheur Banni",
    email: "exemple-banni@exemple.test",
    isBanned: true,
    banReason: "Dés pipés lors d'un tournoi (exemple)",
    hasFinishedOnboarding: true,
  };
  await prisma.user.upsert({ where: { id: "exemple-banni" }, update: banned, create: { id: "exemple-banni", ...banned } });
}

/** Un sujet et ses messages ; les messages sont espacés d'une heure à partir de `startDaysAgo`. */
async function seedTopic(topic: {
  id: string;
  forumName: string;
  title: string;
  startDaysAgo: number;
  isSticky?: boolean;
  tournamentId?: string;
  posts: { author: string; content: string }[];
}) {
  const forum = await prisma.forum.findUnique({ where: { name: topic.forumName } });
  if (!forum) throw new Error(`Forum « ${topic.forumName} » absent : lancer prisma/firstSetup.ts avant ce script.`);

  const start = daysAgo(topic.startDaysAgo);
  const postDate = (index: number) => new Date(start.getTime() + index * 60 * 60 * 1000);
  const lastIndex = topic.posts.length - 1;
  const lastPost = topic.posts[lastIndex];
  const topicData = {
    title: topic.title,
    forumId: forum.id,
    authorId: topic.posts[0].author,
    isSticky: topic.isSticky ?? false,
    tournamentId: topic.tournamentId ?? null,
    createdAt: start,
    views: 12 + topic.posts.length * 7,
    lastPostAt: postDate(lastIndex),
    lastPostId: `${topic.id}-post-${lastIndex}`,
    lastPostAuthorId: lastPost.author,
  };
  await prisma.topic.upsert({ where: { id: topic.id }, update: topicData, create: { id: topic.id, ...topicData } });

  for (const [index, post] of topic.posts.entries()) {
    const id = `${topic.id}-post-${index}`;
    const postData = { content: post.content, topicId: topic.id, authorId: post.author, createdAt: postDate(index) };
    await prisma.post.upsert({ where: { id }, update: postData, create: { id, ...postData } });
  }
}

async function seedForum() {
  await seedTopic({
    id: "exemple-topic-bienvenue",
    forumName: "Bienvenue à toi le noob !",
    title: "Présentez-vous ici !",
    startDaysAgo: 30,
    isSticky: true,
    posts: [
      { author: "exemple-admin", content: "Bienvenue sur BBFrance ! Dites-nous qui vous êtes, votre équipe et votre région." },
      { author: "exemple-coach-1", content: "Salut ! Je joue [b]Gobelins[/b] depuis deux ans, du côté de Rouen." },
      { author: "exemple-coach-3", content: "Halflings ici, pour le plaisir de perdre avec le sourire." },
      { author: "exemple-nouveau", content: "Bonjour, je découvre le jeu. Par quelle équipe commencer ?" },
    ],
  });
  await seedTopic({
    id: "exemple-topic-buvette",
    forumName: "Les petites discussions à la buvette",
    title: "Votre pire série de dés",
    startDaysAgo: 6,
    posts: [
      { author: "exemple-coach-2", content: "Trois doubles crânes d'affilée au premier tour. Qui dit mieux ?" },
      { author: "exemple-coach-4", content: "Un 1 sur un Go For It à deux cases de l'en-but, au dernier tour. :(" },
      { author: "exemple-modo", content: "@Skaven Pressé ça forge le caractère !" },
      { author: "exemple-coach-2", content: "Le caractère, oui. Le classement, non." },
    ],
  });
  await seedTopic({
    id: "exemple-topic-regles",
    forumName: "Précisions sur les règles",
    title: "Blocage sur un joueur à terre ?",
    startDaysAgo: 2,
    posts: [
      { author: "exemple-nouveau", content: "Peut-on bloquer un joueur déjà à terre ?" },
      { author: "exemple-rtc", content: "Non : un blocage vise un joueur debout. Contre un joueur à terre, c'est une agression." },
    ],
  });
  await seedTopic({
    id: "exemple-topic-tableau",
    forumName: "Tableau noir",
    title: "Défendre contre les Skavens",
    startDaysAgo: 1,
    posts: [
      { author: "exemple-coach-4", content: "Comment gérez-vous la vitesse des coureurs d'égout ?" },
      { author: "exemple-chef-ligue", content: "Défense en profondeur, et toujours un joueur en couverture près de l'en-but." },
      { author: "exemple-coach-2", content: "En tant que Skaven, je confirme : la couverture, c'est ce qui m'embête le plus." },
    ],
  });

  // Réactions, mention et abonnements
  const reactions = [
    { postId: "exemple-topic-buvette-post-0", userId: "exemple-coach-4", emoji: "😂" },
    { postId: "exemple-topic-buvette-post-0", userId: "exemple-coach-1", emoji: "😂" },
    { postId: "exemple-topic-regles-post-1", userId: "exemple-nouveau", emoji: "👍" },
  ];
  for (const reaction of reactions) {
    await prisma.postReaction.upsert({
      where: { postId_userId_emoji: reaction },
      update: {},
      create: reaction,
    });
  }
  await prisma.mention.upsert({
    where: { postId_mentionedUserId: { postId: "exemple-topic-buvette-post-2", mentionedUserId: "exemple-coach-2" } },
    update: {},
    create: { postId: "exemple-topic-buvette-post-2", mentionerId: "exemple-modo", mentionedUserId: "exemple-coach-2" },
  });
  for (const follow of [
    { userId: "exemple-nouveau", topicId: "exemple-topic-regles" },
    { userId: "exemple-coach-2", topicId: "exemple-topic-buvette" },
  ]) {
    await prisma.topicFollow.upsert({ where: { userId_topicId: follow }, update: {}, create: follow });
  }
}

async function seedArticlesAndResources() {
  const tags = ["Stratégie", "Peinture", "Compte-rendu"];
  for (const name of tags) {
    await prisma.articleTag.upsert({ where: { name }, update: {}, create: { name } });
  }
  const articles = [
    {
      id: "exemple-article-debuter",
      title: "Bien débuter à Blood Bowl",
      content: "[b]Choisir sa première équipe[/b]\n\nLes Humains et les Orques pardonnent les erreurs. Commencez par eux.",
      authorId: "exemple-admin",
      tag: "Stratégie",
      createdAt: daysAgo(20),
    },
    {
      id: "exemple-article-peinture",
      title: "Peindre une équipe naine en un week-end",
      content: "Sous-couche noire, brossage métal, deux couleurs d'équipe : le résultat est déjà très lisible sur la table.",
      authorId: "exemple-coach-3",
      tag: "Peinture",
      createdAt: daysAgo(9),
    },
    {
      id: "exemple-article-cr",
      title: "Compte-rendu : Coupe de la Buvette",
      content: "Seize coachs, trois rondes, une finale serrée gagnée par les Skavens sur un dernier tour mémorable.",
      authorId: "exemple-chef-ligue",
      tag: "Compte-rendu",
      createdAt: daysAgo(3),
    },
  ];
  for (const { tag, ...article } of articles) {
    const tagLink = { connect: { name: tag } };
    await prisma.article.upsert({
      where: { id: article.id },
      update: { ...article, tags: tagLink },
      create: { ...article, views: 40, tags: tagLink },
    });
  }
  await prisma.articleReaction.upsert({
    where: { articleId_userId_emoji: { articleId: "exemple-article-debuter", userId: "exemple-nouveau", emoji: "👍" } },
    update: {},
    create: { articleId: "exemple-article-debuter", userId: "exemple-nouveau", emoji: "👍" },
  });

  await prisma.resourceTag.upsert({ where: { name: "Outils" }, update: {}, create: { name: "Outils" } });
  const resources = [
    { id: "exemple-ressource-1", title: "Calculateur de probabilités (exemple)", status: "APPROVED" },
    { id: "exemple-ressource-2", title: "Feuille de match imprimable (exemple)", status: "PENDING" },
  ];
  for (const resource of resources) {
    const data = {
      ...resource,
      description: "Ressource fictive du profil exemple.",
      link: "https://example.com",
      authorId: "exemple-coach-1",
      tags: { connect: { name: "Outils" } },
    };
    await prisma.resource.upsert({ where: { id: resource.id }, update: data, create: data });
  }
}

async function seedLigues() {
  const ligues = [
    {
      id: "exemple-ligue-pictave",
      name: "Ligue Pictave de Blood Bowl",
      acronym: "LPBB",
      region: "Nouvelle-Aquitaine",
      departement: "86",
      ville: "Poitiers",
      lat: 46.58,
      lng: 0.34,
      creatorId: "exemple-chef-ligue",
      members: ["exemple-chef-ligue", "exemple-rtc", "exemple-coach-3"],
    },
    {
      id: "exemple-ligue-lutece",
      name: "Lutèce Bowl",
      acronym: "LB",
      region: "Île-de-France",
      departement: "75",
      ville: "Paris",
      lat: 48.86,
      lng: 2.35,
      creatorId: "exemple-superadmin",
      members: ["exemple-superadmin", "exemple-coach-2"],
    },
  ];
  for (const { members, ...ligue } of ligues) {
    const links = {
      members: { set: members.map((id) => ({ id })) },
      commissaires: { set: [{ id: ligue.creatorId }] },
    };
    const description = "Ligue fictive du profil exemple.";
    await prisma.ligue.upsert({
      where: { id: ligue.id },
      update: { ...ligue, description, ...links },
      create: {
        ...ligue,
        description,
        members: { connect: members.map((id) => ({ id })) },
        commissaires: { connect: [{ id: ligue.creatorId }] },
      },
    });
  }
}

async function seedTournaments() {
  const upcoming = {
    name: "Tournoi du Printemps (exemple)",
    date: daysAhead(25),
    location: "Salle des fêtes",
    ville: "Poitiers",
    departement: "86",
    region: "Nouvelle-Aquitaine",
    regionNAF: "R5-SO",
    description: "Tournoi fictif à venir, ouvert aux inscriptions.",
    maxParticipants: 24,
    totalMatches: 5,
    days: "2",
    price: 20,
    isNAF: true,
    isCDF: true,
    organizerId: "exemple-chef-ligue",
    ligueId: "exemple-ligue-pictave",
    lat: 46.58,
    lng: 0.34,
    commissaires: { set: [{ id: "exemple-rtc" }] },
  };
  const { commissaires: upcomingCommissaires, ...upcomingFields } = upcoming;
  await prisma.tournament.upsert({
    where: { id: "exemple-tournoi-a-venir" },
    update: upcoming,
    create: { id: "exemple-tournoi-a-venir", ...upcomingFields, commissaires: { connect: upcomingCommissaires.set } },
  });
  const registrations = [
    { userId: "exemple-coach-1", status: "REGISTERED", paymentStatus: "PAID" },
    { userId: "exemple-coach-3", status: "REGISTERED", paymentStatus: "NOT_PAID" },
    { userId: "exemple-coach-4", status: "PRE_REGISTERED", paymentStatus: "NOT_PAID" },
  ] as const;
  for (const registration of registrations) {
    const key = { tournamentId: "exemple-tournoi-a-venir", userId: registration.userId };
    await prisma.tournamentRegistration.upsert({
      where: { tournamentId_userId: key },
      update: registration,
      create: { ...key, ...registration },
    });
  }
  await prisma.tournament.update({
    where: { id: "exemple-tournoi-a-venir" },
    data: { currentParticipants: 2, preRegistered: 1 },
  });

  const finished = {
    name: "Coupe de la Buvette (exemple)",
    date: daysAgo(10),
    location: "Bar associatif",
    ville: "Paris",
    departement: "75",
    region: "Île-de-France",
    regionNAF: "R1-IDF",
    description: "Tournoi fictif terminé, avec résultats.",
    maxParticipants: 16,
    totalMatches: 3,
    isCDF: true,
    isFinished: true,
    cdfValidatedAt: daysAgo(8),
    cdfValidatedById: "exemple-modo",
    organizerId: "exemple-superadmin",
    ligueId: "exemple-ligue-lutece",
    lat: 48.86,
    lng: 2.35,
  };
  await prisma.tournament.upsert({
    where: { id: "exemple-tournoi-termine" },
    update: finished,
    create: { id: "exemple-tournoi-termine", ...finished },
  });
  const results = [
    { coachName: "Skaven Pressé", userId: "exemple-coach-2", roster: "Skavens", wins: 3, draws: 0, losses: 0, points: 15, rank: 1 },
    { coachName: "Gobelin Furtif", userId: "exemple-coach-1", roster: "Gobelins", wins: 2, draws: 0, losses: 1, points: 10, rank: 2 },
    { coachName: "Lézard Patient", userId: "exemple-coach-4", roster: "Hommes-Lézards", wins: 1, draws: 1, losses: 1, points: 7, rank: 3 },
    { coachName: "Coach Invité", userId: null, roster: "Humains", wins: 0, draws: 1, losses: 2, points: 2, rank: 4 },
  ];
  for (const result of results) {
    const key = { tournamentId: "exemple-tournoi-termine", coachName: result.coachName };
    await prisma.tournamentResult.upsert({
      where: { tournamentId_coachName: key },
      update: result,
      create: { ...key, ...result },
    });
  }

  // Sujet du forum lié au tournoi à venir
  await seedTopic({
    id: "exemple-topic-tournoi",
    forumName: "Les tournois",
    title: "Tournoi du Printemps (exemple)",
    startDaysAgo: 4,
    tournamentId: "exemple-tournoi-a-venir",
    posts: [
      { author: "exemple-chef-ligue", content: "Inscriptions ouvertes ! Cinq rondes sur deux jours, repas compris." },
      { author: "exemple-coach-1", content: "Inscrit avec mes Gobelins, préparez vos tronçonneuses." },
    ],
  });
}

async function seedMessagesAndNotifications() {
  const conversationId = "exemple-conversation";
  const conversation = {
    user1Id: "exemple-coach-1",
    user2Id: "exemple-coach-2",
    createdAt: daysAgo(2),
  };
  await prisma.conversation.upsert({
    where: { id: conversationId },
    update: conversation,
    create: { id: conversationId, ...conversation },
  });
  for (const userId of ["exemple-coach-1", "exemple-coach-2"]) {
    await prisma.conversationParticipant.upsert({
      where: { userId_conversationId: { userId, conversationId } },
      update: {},
      create: { userId, conversationId, joinedAt: daysAgo(2) },
    });
  }
  const messages = [
    { id: "exemple-mp-1", authorId: "exemple-coach-1", content: "On fait une partie amicale ce week-end ?" },
    { id: "exemple-mp-2", authorId: "exemple-coach-2", content: "Avec plaisir, samedi après-midi ?" },
  ];
  for (const [index, message] of messages.entries()) {
    const data = { ...message, conversationId, createdAt: new Date(daysAgo(2).getTime() + index * 60 * 60 * 1000) };
    await prisma.privateMessage.upsert({ where: { id: message.id }, update: data, create: data });
  }

  const notifications = [
    {
      id: "exemple-notif-mention",
      userId: "exemple-coach-2",
      type: "MENTION",
      topicId: "exemple-topic-buvette",
      postId: "exemple-topic-buvette-post-2",
      actorId: "exemple-modo",
    },
    {
      id: "exemple-notif-reponse",
      userId: "exemple-nouveau",
      type: "FOLLOWED_REPLY",
      topicId: "exemple-topic-regles",
      postId: "exemple-topic-regles-post-1",
      actorId: "exemple-rtc",
    },
    {
      id: "exemple-notif-mp",
      userId: "exemple-coach-1",
      type: "PRIVATE_MESSAGE",
      conversationId,
      actorId: "exemple-coach-2",
    },
  ];
  for (const notification of notifications) {
    await prisma.notification.upsert({ where: { id: notification.id }, update: notification, create: notification });
  }

  await prisma.moderationReport.upsert({
    where: { id: "exemple-signalement" },
    update: {},
    create: {
      id: "exemple-signalement",
      reason: "SPAM",
      details: "Signalement fictif du profil exemple.",
      reporterId: "exemple-coach-4",
      targetId: "exemple-topic-buvette-post-3",
      targetType: "POST",
    },
  });
}

async function main() {
  console.log("Données fictives du profil exemple...");
  await seedMembers();
  await seedForum();
  await seedArticlesAndResources();
  await seedLigues();
  await seedTournaments();
  await seedMessagesAndNotifications();
  console.log("Données fictives prêtes.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
