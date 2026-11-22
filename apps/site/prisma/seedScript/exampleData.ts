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
  { id: "exemple-admin", name: "Admin Orque", role: "ADMIN", theme: "saison3", region: "R4-SE", equipe: "Orques Noirs" },
  { id: "exemple-modo", name: "Modo Nain", role: "MODERATOR", theme: "naf", region: "R3-NE", equipe: "Nains" },
  { id: "exemple-rtc", name: "Arbitre Sud-Ouest", role: "RTC", theme: "nehekhara", region: "R5-SO", equipe: "Khemri" },
  { id: "exemple-chef-ligue", name: "Chef de la Ligue Pictave", role: "CHEF_LIGUE", theme: "elfes-noirs", region: "R5-SO", equipe: "Elfes Noirs" },
  { id: "exemple-coach-1", name: "Gobelin Furtif", role: "COACH", theme: "saison3", region: "R2-NO", equipe: "Gobelins" },
  { id: "exemple-coach-2", name: "Skaven Pressé", role: "COACH", theme: "saison3", region: "R1-IDF", equipe: "Skavens" },
  { id: "exemple-coach-3", name: "Halfling Gourmand", role: "COACH", theme: "naf", region: "R4-SE", equipe: "Halflings" },
  { id: "exemple-coach-4", name: "Lézard Patient", role: "COACH", theme: "nehekhara", region: "R3-NE", equipe: "Hommes-Lézards" },
  { id: "exemple-nouveau", name: "Tout Nouveau", role: "COACH", theme: "saison3", region: null, equipe: null, onboarding: false },
  // Carte 221 : de quoi tester les droits entre égaux et les rôles personnalisés.
  { id: "exemple-admin-2", name: "Admin Elfe", role: "ADMIN", theme: "elfes-noirs", region: "R2-NO", equipe: "Haut-Elfes" },
  { id: "exemple-modo-2", name: "Modo Amazone", role: "MODERATOR", theme: "saison3", region: "R4-SE", equipe: "Amazones" },
  { id: "exemple-coach-role-perso", name: "Arbitre Maison", role: "ARBITRE", theme: "naf", region: "R1-IDF", equipe: "Bretonniens" },
] as const;

/** Rôle personnalisé (créé par l'administration en vrai) : il compte comme un coach pour les droits. */
async function seedCustomRole() {
  await prisma.roleConfig.upsert({
    where: { name: "ARBITRE" },
    update: { label: "Arbitre", power: 20, color: "#0ea5e9" },
    create: { name: "ARBITRE", label: "Arbitre", power: 20, color: "#0ea5e9", isBaseRole: false },
  });
}

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

  // Banni après s'être inscrit à un tournoi et avoir écrit en messagerie : le bannissement ne supprime rien.
  const bannedRegistered = {
    name: "Fraudeur Inscrit",
    email: "exemple-banni-inscrit@exemple.test",
    isBanned: true,
    banReason: "Faux résultats envoyés (exemple)",
    hasFinishedOnboarding: true,
    region: "R5-SO",
    equipe: "Chaos",
  };
  await prisma.user.upsert({
    where: { id: "exemple-banni-inscrit" },
    update: bannedRegistered,
    create: { id: "exemple-banni-inscrit", ...bannedRegistered },
  });
}

/** Un sujet et ses messages ; les messages sont espacés d'une heure à partir de `startDaysAgo`. */
async function seedTopic(topic: {
  id: string;
  forumName: string;
  title: string;
  startDaysAgo: number;
  isSticky?: boolean;
  isLocked?: boolean;
  isArchived?: boolean;
  /** Sujet supprimé par la modération : caché à tous sauf aux modérateurs. */
  deleted?: { by: string; reason: string };
  tournamentId?: string;
  posts: {
    author: string;
    content: string;
    /** Message masqué par la modération. */
    moderated?: { by: string; reason: string };
    /** Message supprimé (par son auteur si `by` est l'auteur, sinon par la modération). */
    deleted?: { by: string; reason?: string };
  }[];
}) {
  const forum = await prisma.forum.findUnique({ where: { name: topic.forumName } });
  if (!forum) throw new Error(`Forum « ${topic.forumName} » absent : lancer prisma/firstSetup.ts avant ce script.`);

  const start = daysAgo(topic.startDaysAgo);
  const postDate = (index: number) => new Date(start.getTime() + index * 60 * 60 * 1000);
  // Le dernier message visible fait foi (un message supprimé ne compte pas).
  const lastIndex = topic.posts.findLastIndex((post) => !post.deleted);
  const lastPost = topic.posts[lastIndex];
  const topicData = {
    title: topic.title,
    forumId: forum.id,
    authorId: topic.posts[0].author,
    isSticky: topic.isSticky ?? false,
    isLocked: topic.isLocked ?? false,
    isArchived: topic.isArchived ?? false,
    isDeleted: !!topic.deleted,
    deletedAt: topic.deleted ? daysAgo(1) : null,
    deletedById: topic.deleted?.by ?? null,
    deletionReason: topic.deleted?.reason ?? null,
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
    const postData = {
      content: post.content,
      topicId: topic.id,
      authorId: post.author,
      createdAt: postDate(index),
      // Sans cette date, Prisma met la date du remplissage et chaque message s'affiche « modifié le … »
      updatedAt: postDate(index),
      isModerated: !!post.moderated,
      moderatedBy: post.moderated?.by ?? null,
      moderationReason: post.moderated?.reason ?? null,
      isDeleted: !!post.deleted,
      deletedAt: post.deleted ? postDate(index + 1) : null,
      deletedById: post.deleted?.by ?? null,
      deletionReason: post.deleted?.reason ?? null,
    };
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
      { author: "exemple-admin", content: "Bienvenue sur FranceBB ! Dites-nous qui vous êtes, votre équipe et votre région." },
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

// ---------------------------------------------------------------------------------------------------------------
// Carte 221 : un cas de chaque sorte, pour vérifier chaque fonctionnalité avec chaque rôle.
// La liste des cas et le compte à utiliser pour chacun sont dans docs/features/INTERACTIONS.md.
// ---------------------------------------------------------------------------------------------------------------

/** Forums réservés, verrouillé et sous-forum : rangés dans une catégorie à part pour ne pas toucher la structure de base. */
async function seedForumStructureCases() {
  const category = await prisma.category.upsert({
    where: { name: "Les coulisses (exemple)" },
    update: { order: 9 },
    create: { name: "Les coulisses (exemple)", order: 9, description: "Forums de test : accès réservés et verrouillés." },
  });
  const forums = [
    { name: "Salle des modérateurs (exemple)", description: "Visible des modérateurs et au-dessus.", allowedRoles: "MODERATOR", order: 1 },
    { name: "Bureau des admins (exemple)", description: "Visible des admins et au-dessus.", allowedRoles: "ADMIN", order: 2 },
    { name: "Vieilles annonces (exemple)", description: "Forum verrouillé : personne n'y écrit, sauf la modération.", isLocked: true, order: 3 },
  ];
  for (const forum of forums) {
    const data = { ...forum, categoryId: category.id, parentForumId: null };
    await prisma.forum.upsert({ where: { name: forum.name }, update: data, create: data });
  }
  const parent = await prisma.forum.findUnique({ where: { name: "Les ligues" } });
  if (!parent) throw new Error("Forum « Les ligues » absent : lancer prisma/firstSetup.ts avant ce script.");
  const subForum = { name: "Vie de la Ligue Pictave (exemple)", description: "Sous-forum de « Les ligues ».", parentForumId: parent.id, categoryId: null };
  await prisma.forum.upsert({ where: { name: subForum.name }, update: subForum, create: subForum });
}

/** Toutes les balises de lib/bbcode.ts, pour vérifier l'affichage et l'éditeur. */
const BBCODE_SHOWCASE = [
  "[b]Gras[/b], [i]italique[/i], [u]souligné[/u], [s]barré[/s], H[sub]2[/sub]O, 2[sup]e[/sup] tour.",
  "[color=#c21d1d]Rouge[/color], [color=green]vert[/color], [size=18]grand[/size], [size=10]petit[/size].",
  "[center]Centré[/center][right]À droite[/right][justify]Texte justifié qui prend toute la largeur de la colonne pour voir l'effet sur un paragraphe un peu long.[/justify]",
  "[hr]",
  "[list][*]Liste à puces[*]Deuxième point[/list]",
  "[list=1][*]Liste numérotée[*]Deuxième étape[/list]",
  "[table][tr][th]Équipe[/th][th]Victoires[/th][/tr][tr][td]Skavens[/td][td]3[/td][/tr][tr][td]Gobelins[/td][td]2[/td][/tr][/table]",
  "[url]https://example.com[/url] et [url=https://example.com]lien avec texte[/url].",
  "[img]/images/logo2.png[/img]",
  "[gallery=2]/images/logo2.png,/images/resource-placeholder.png[/gallery]",
  "[youtube]dQw4w9WgXcQ[/youtube]",
  "[twitch]https://www.twitch.tv/twitch[/twitch]",
  "[code]const touchdown = true;[/code]",
  "[quote]Citation sans auteur.[/quote]",
  "[quote=exemple-rtc|exemple-topic-regles-post-1|Arbitre Sud-Ouest]Non : un blocage vise un joueur debout.[/quote]",
  "[spoiler]Le Skaven gagne à la fin.[/spoiler] [spoiler=Résultat de la finale]15 à 3.[/spoiler]",
  "[accordion=Règles du tournoi]Cinq rondes, 1 100 000 po, compétences de départ.[/accordion]",
  "[mention=exemple-coach-2]Skaven Pressé[/mention], regarde ce sujet : [topic=exemple-topic-regles]Blocage sur un joueur à terre ?[/topic]",
  "[bbscheme]exemple-schema[/bbscheme]",
  "Smileys : :) ;) :D :p :(",
].join("\n\n");

async function seedForumCases() {
  // Sujet verrouillé et épinglé, écrit par un admin
  await seedTopic({
    id: "exemple-topic-reglement",
    forumName: "Bienvenue à toi le noob !",
    title: "Règlement du forum (verrouillé)",
    startDaysAgo: 60,
    isSticky: true,
    isLocked: true,
    posts: [{ author: "exemple-admin", content: "[b]Respect, bonne humeur et dés propres.[/b] Ce sujet est verrouillé : on ne peut pas y répondre." }],
  });
  // Vitrine BBCode
  await seedTopic({
    id: "exemple-topic-bbcode",
    forumName: "Les petites discussions à la buvette",
    title: "Vitrine BBCode : toutes les balises",
    startDaysAgo: 5,
    posts: [
      { author: "exemple-modo", content: BBCODE_SHOWCASE },
      { author: "exemple-coach-1", content: "[quote=exemple-modo|exemple-topic-bbcode-post-0|Modo Nain]Smileys : :) ;) :D[/quote]\nMerci pour la démonstration !" },
    ],
  });
  // Sujet archivé
  await seedTopic({
    id: "exemple-topic-archive",
    forumName: "Les challenges régionaux",
    title: "Challenge du Nord-Ouest 2024 (archivé)",
    startDaysAgo: 400,
    isArchived: true,
    posts: [
      { author: "exemple-coach-1", content: "Classement final du challenge 2024." },
      { author: "exemple-coach-2", content: "Bravo à tous, rendez-vous l'an prochain." },
    ],
  });
  // Sujet supprimé par la modération (visible des modérateurs seulement, restaurable)
  await seedTopic({
    id: "exemple-topic-supprime",
    forumName: "Les petites discussions à la buvette",
    title: "Achetez mes dés truqués !",
    startDaysAgo: 3,
    deleted: { by: "exemple-modo", reason: "Publicité (exemple)" },
    posts: [{ author: "exemple-banni", content: "Dés à 100 % de réussite, contactez-moi en message privé." }],
  });
  // Deux sujets en double, à fusionner
  for (const [index, author] of ["exemple-coach-3", "exemple-coach-4"].entries()) {
    await seedTopic({
      id: `exemple-topic-fusion-${index + 1}`,
      forumName: "Les ligues",
      title: "Cherche une ligue vers Lyon",
      startDaysAgo: 8 - index,
      posts: [
        { author, content: "Quelqu'un connaît une ligue active du côté de Lyon ?" },
        { author: "exemple-chef-ligue", content: "Regarde la carte des ligues, il y en a deux à Villeurbanne." },
      ],
    });
  }
  // Long sujet (plus de 20 messages : deux pages), à scinder
  const longPosts = Array.from({ length: 26 }, (_, index) => ({
    author: ["exemple-coach-1", "exemple-coach-2", "exemple-coach-3", "exemple-coach-4"][index % 4],
    content: index === 0
      ? "Quel roster pour débuter en tournoi ? Donnez vos listes."
      : index === 14
        ? "[b]Hors sujet[/b] : quelqu'un a des nouvelles du championnat de France ? (à scinder dans un autre sujet)"
        : `Réponse n° ${index} : je partirais sur deux bloqueurs et une relance.`,
  }));
  await seedTopic({ id: "exemple-topic-long", forumName: "Rosters en tournoi et en ligue", title: "Quel roster pour débuter en tournoi ?", startDaysAgo: 12, posts: longPosts });
  // Message masqué et message supprimé, chacun cité ensuite
  await seedTopic({
    id: "exemple-topic-moderation",
    forumName: "Tableau noir",
    title: "Débat : faut-il toujours bliter en premier ?",
    startDaysAgo: 4,
    posts: [
      { author: "exemple-coach-2", content: "Je blitze toujours en premier, ça libère le terrain." },
      { author: "exemple-coach-role-perso", content: "Tu joues comme un pied.", moderated: { by: "exemple-modo", reason: "Propos insultants (exemple)" } },
      { author: "exemple-coach-3", content: "Message retiré par son auteur.", deleted: { by: "exemple-coach-3" } },
      { author: "exemple-banni-inscrit", content: "Lien vers un site douteux.", deleted: { by: "exemple-modo-2", reason: "Lien malveillant (exemple)" } },
      {
        author: "exemple-coach-4",
        content: "[quote=exemple-coach-role-perso|exemple-topic-moderation-post-1|Arbitre Maison]Tu joues comme un pied.[/quote]\nRestons courtois.\n\n[quote=exemple-banni-inscrit|exemple-topic-moderation-post-3|Fraudeur Inscrit]Lien vers un site douteux.[/quote]",
      },
    ],
  });
  // Forums réservés, verrouillé, sous-forum
  await seedTopic({
    id: "exemple-topic-modos",
    forumName: "Salle des modérateurs (exemple)",
    title: "Point sur les signalements de la semaine",
    startDaysAgo: 2,
    posts: [
      { author: "exemple-modo", content: "Trois signalements en attente, je prends ceux du forum." },
      { author: "exemple-modo-2", content: "Je m'occupe des articles et des ligues." },
    ],
  });
  await seedTopic({
    id: "exemple-topic-admins",
    forumName: "Bureau des admins (exemple)",
    title: "Préparer la saison prochaine",
    startDaysAgo: 2,
    posts: [
      { author: "exemple-admin", content: "Il faut mettre à jour les données de référence (éditions, régions)." },
      { author: "exemple-admin-2", content: "Je m'en charge cette semaine." },
    ],
  });
  await seedTopic({
    id: "exemple-topic-forum-verrouille",
    forumName: "Vieilles annonces (exemple)",
    title: "Ancienne annonce dans un forum verrouillé",
    startDaysAgo: 90,
    posts: [{ author: "exemple-superadmin", content: "Ce forum est verrouillé : seuls les modérateurs y écrivent." }],
  });
  await seedTopic({
    id: "exemple-topic-sous-forum",
    forumName: "Vie de la Ligue Pictave (exemple)",
    title: "Calendrier de la saison",
    startDaysAgo: 7,
    posts: [{ author: "exemple-chef-ligue", content: "Journée 1 le 12, journée 2 le 26." }],
  });

  // Lu / non lu : Gobelin a tout lu du sujet long, Skaven s'est arrêté au message 10.
  const views = [
    { userId: "exemple-coach-1", topicId: "exemple-topic-long", postIndex: 25 },
    { userId: "exemple-coach-2", topicId: "exemple-topic-long", postIndex: 10 },
    { userId: "exemple-coach-1", topicId: "exemple-topic-bienvenue", postIndex: 3 },
  ];
  for (const view of views) {
    const post = await prisma.post.findUnique({ where: { id: `${view.topicId}-post-${view.postIndex}` }, select: { id: true, createdAt: true } });
    if (!post) continue;
    const data = { lastViewedAt: post.createdAt, lastPostId: post.id, lastReadPostAt: post.createdAt };
    await prisma.topicView.upsert({
      where: { userId_topicId: { userId: view.userId, topicId: view.topicId } },
      update: data,
      create: { userId: view.userId, topicId: view.topicId, ...data },
    });
  }
  for (const follow of [
    { userId: "exemple-coach-1", topicId: "exemple-topic-long" },
    { userId: "exemple-coach-2", topicId: "exemple-topic-bbcode" },
  ]) {
    await prisma.topicFollow.upsert({ where: { userId_topicId: follow }, update: {}, create: follow });
  }
  for (const reaction of [
    { postId: "exemple-topic-bbcode-post-0", userId: "exemple-coach-1", emoji: "👍" },
    { postId: "exemple-topic-bbcode-post-0", userId: "exemple-admin", emoji: "❤️" },
  ]) {
    await prisma.postReaction.upsert({ where: { postId_userId_emoji: reaction }, update: {}, create: reaction });
  }
  await prisma.mention.upsert({
    where: { postId_mentionedUserId: { postId: "exemple-topic-bbcode-post-0", mentionedUserId: "exemple-coach-2" } },
    update: {},
    create: { postId: "exemple-topic-bbcode-post-0", mentionerId: "exemple-modo", mentionedUserId: "exemple-coach-2" },
  });
}

async function seedArticleAndResourceCases() {
  const articles = [
    {
      id: "exemple-article-masque",
      title: "Article masqué par la modération",
      content: "Contenu masqué : visible de son auteur et des modérateurs seulement.",
      authorId: "exemple-coach-role-perso",
      isModerated: true,
      moderatedBy: "exemple-modo",
      moderationReason: "Plagiat (exemple)",
      ligueId: null,
      tags: ["Stratégie"],
      createdAt: daysAgo(6),
    },
    {
      id: "exemple-article-ligue",
      title: "La Ligue Pictave recrute",
      content: "Rejoignez-nous le jeudi soir à Poitiers. [b]Débutants bienvenus.[/b]",
      authorId: "exemple-chef-ligue",
      isModerated: false,
      moderatedBy: null,
      moderationReason: null,
      ligueId: "exemple-ligue-pictave",
      tags: ["Compte-rendu", "Stratégie"],
      createdAt: daysAgo(5),
    },
    {
      id: "exemple-article-banni",
      title: "Mes techniques secrètes (auteur banni)",
      content: "Article d'un membre banni depuis : il reste en ligne tant que la modération ne le masque pas.",
      authorId: "exemple-banni-inscrit",
      isModerated: false,
      moderatedBy: null,
      moderationReason: null,
      ligueId: null,
      tags: ["Stratégie"],
      createdAt: daysAgo(15),
    },
  ];
  for (const { tags, ...article } of articles) {
    const tagLinks = { set: tags.map((name) => ({ name })) };
    await prisma.article.upsert({
      where: { id: article.id },
      update: { ...article, tags: tagLinks },
      create: { ...article, views: 5, tags: { connect: tags.map((name) => ({ name })) } },
    });
  }
  const systemTool = {
    id: "exemple-ressource-systeme",
    title: "Outil système (exemple)",
    description: "Outil du site : seuls les admins le modifient.",
    link: "/forum",
    status: "APPROVED",
    isSystem: true,
    authorId: "exemple-admin",
  };
  await prisma.resource.upsert({ where: { id: systemTool.id }, update: systemTool, create: systemTool });
}

async function seedLigueCases() {
  // Plusieurs commissaires ; Halfling membre de deux ligues
  await prisma.ligue.update({
    where: { id: "exemple-ligue-pictave" },
    data: { commissaires: { set: [{ id: "exemple-chef-ligue" }, { id: "exemple-rtc" }] } },
  });
  await prisma.ligue.update({
    where: { id: "exemple-ligue-lutece" },
    data: { members: { connect: [{ id: "exemple-coach-3" }] } },
  });
  const bannedLigue = {
    name: "Ligue du Fraudeur (exemple)",
    acronym: "LDF",
    region: "Occitanie",
    departement: "31",
    ville: "Toulouse",
    lat: 43.6,
    lng: 1.44,
    description: "Ligue dont le créateur a été banni.",
    creatorId: "exemple-banni-inscrit",
  };
  await prisma.ligue.upsert({
    where: { id: "exemple-ligue-bannie" },
    update: bannedLigue,
    create: {
      id: "exemple-ligue-bannie",
      ...bannedLigue,
      members: { connect: [{ id: "exemple-banni-inscrit" }, { id: "exemple-coach-4" }] },
      commissaires: { connect: [{ id: "exemple-banni-inscrit" }] },
    },
  });
}

async function seedTournamentCases() {
  const base = {
    location: "Gymnase municipal",
    ville: "Poitiers",
    departement: "86",
    region: "Nouvelle-Aquitaine",
    regionNAF: "R5-SO",
    totalMatches: 5,
    organizerId: "exemple-chef-ligue",
    lat: 46.58,
    lng: 0.34,
  };
  const tournaments = [
    { id: "exemple-tournoi-equipes", name: "Trophée des Équipes (exemple)", date: daysAhead(40), isTeam: true, coachsPerTeam: 3, maxParticipants: 8, typeCDF: "EQUIPE_TOTALE", description: "Tournoi par équipes de 3, avec mercenaires." },
    { id: "exemple-tournoi-complet", name: "Petit Tournoi Complet (exemple)", date: daysAhead(15), maxParticipants: 4, description: "Complet : les nouveaux inscrits vont en liste d'attente." },
    { id: "exemple-tournoi-ferme", name: "Tournoi aux Inscriptions Fermées (exemple)", date: daysAhead(20), maxParticipants: 16, registrationsLocked: true, description: "L'organisateur a fermé les inscriptions." },
    { id: "exemple-tournoi-annule", name: "Tournoi Annulé (exemple)", date: daysAhead(10), maxParticipants: 12, isCancelled: true, description: "Annulé faute de salle." },
    { id: "exemple-tournoi-naf", name: "Open NAF (exemple)", date: daysAhead(60), maxParticipants: 32, isNAF: true, organizerId: "exemple-coach-2", description: "Tournoi NAF organisé par un simple coach." },
    { id: "exemple-tournoi-a-valider", name: "Tournoi à Valider (exemple)", date: daysAgo(5), maxParticipants: 8, isCDF: true, isFinished: true, description: "Terminé, résultats saisis, validation CDF en attente." },
    { id: "exemple-tournoi-sujet-supprime", name: "Tournoi au Sujet Supprimé (exemple)", date: daysAhead(30), maxParticipants: 8, description: "Son sujet a été supprimé : aucune inscription possible." },
  ];
  for (const tournament of tournaments) {
    const data = { ...base, ...tournament };
    await prisma.tournament.upsert({ where: { id: tournament.id }, update: data, create: data });
    await seedTopic({
      id: `exemple-topic-${tournament.id.replace("exemple-", "")}`,
      forumName: "Les tournois",
      title: tournament.name,
      startDaysAgo: 9,
      tournamentId: tournament.id,
      deleted: tournament.id === "exemple-tournoi-sujet-supprime" ? { by: "exemple-modo", reason: "Doublon (exemple)" } : undefined,
      posts: [{ author: data.organizerId, content: tournament.description }],
    });
  }

  // Tournoi par équipes : une équipe complète, une incomplète, deux mercenaires
  const teams = [
    { id: "exemple-equipe-1", name: "Les Bourrins du Poitou", captainId: "exemple-coach-1", members: ["exemple-coach-1", "exemple-coach-3", "exemple-coach-4"], status: "REGISTERED", paymentStatus: "PAID" },
    { id: "exemple-equipe-2", name: "Équipe incomplète", captainId: "exemple-coach-2", members: ["exemple-coach-2"], status: "PRE_REGISTERED", paymentStatus: "NOT_PAID" },
  ] as const;
  for (const { members, ...team } of teams) {
    const data = { ...team, tournamentId: "exemple-tournoi-equipes" };
    await prisma.tournamentTeam.upsert({ where: { id: team.id }, update: data, create: data });
    for (const userId of members) {
      await prisma.tournamentTeamMember.upsert({
        where: { teamId_userId: { teamId: team.id, userId } },
        update: {},
        create: { teamId: team.id, userId },
      });
    }
  }
  for (const userId of ["exemple-coach-role-perso", "exemple-nouveau"]) {
    const key = { tournamentId: "exemple-tournoi-equipes", userId };
    await prisma.tournamentMercenary.upsert({ where: { tournamentId_userId: key }, update: {}, create: key });
  }

  // Inscriptions : tous les statuts de paiement, liste d'attente, banni encore inscrit
  const registrations = [
    { tournamentId: "exemple-tournoi-complet", userId: "exemple-coach-1", status: "REGISTERED", paymentStatus: "PAID" },
    { tournamentId: "exemple-tournoi-complet", userId: "exemple-coach-2", status: "REGISTERED", paymentStatus: "AT_TOURNAMENT" },
    { tournamentId: "exemple-tournoi-complet", userId: "exemple-coach-3", status: "REGISTERED", paymentStatus: "GUEST" },
    { tournamentId: "exemple-tournoi-complet", userId: "exemple-rtc", status: "REGISTERED", paymentStatus: "DEPANNAGE" },
    { tournamentId: "exemple-tournoi-complet", userId: "exemple-coach-4", status: "WAITING_LIST", paymentStatus: "NOT_PAID" },
    { tournamentId: "exemple-tournoi-ferme", userId: "exemple-coach-2", status: "REGISTERED", paymentStatus: "NOT_PAID" },
    { tournamentId: "exemple-tournoi-annule", userId: "exemple-coach-1", status: "REGISTERED", paymentStatus: "PAID" },
    { tournamentId: "exemple-tournoi-a-venir", userId: "exemple-banni-inscrit", status: "REGISTERED", paymentStatus: "PAID" },
  ] as const;
  for (const registration of registrations) {
    const key = { tournamentId: registration.tournamentId, userId: registration.userId };
    await prisma.tournamentRegistration.upsert({ where: { tournamentId_userId: key }, update: registration, create: registration });
  }
  // Compteurs recalculés à partir des inscriptions
  for (const id of ["exemple-tournoi-a-venir", "exemple-tournoi-complet", "exemple-tournoi-ferme", "exemple-tournoi-annule"]) {
    const [currentParticipants, preRegistered] = await Promise.all([
      prisma.tournamentRegistration.count({ where: { tournamentId: id, status: "REGISTERED" } }),
      prisma.tournamentRegistration.count({ where: { tournamentId: id, status: "PRE_REGISTERED" } }),
    ]);
    await prisma.tournament.update({ where: { id }, data: { currentParticipants, preRegistered } });
  }

  // Résultats du tournoi terminé pas encore validé
  const results = [
    { coachName: "Halfling Gourmand", userId: "exemple-coach-3", roster: "Halflings", wins: 2, draws: 1, losses: 0, points: 11, rank: 1 },
    { coachName: "Arbitre Maison", userId: "exemple-coach-role-perso", roster: "Bretonniens", wins: 1, draws: 1, losses: 1, points: 7, rank: 2 },
    { coachName: "Coach de Passage", userId: null, roster: "Nordiques", wins: 0, draws: 0, losses: 3, points: 0, rank: 3 },
  ];
  for (const result of results) {
    const key = { tournamentId: "exemple-tournoi-a-valider", coachName: result.coachName };
    await prisma.tournamentResult.upsert({ where: { tournamentId_coachName: key }, update: result, create: { ...key, ...result } });
  }
}

async function seedMessagingAndModerationCases() {
  // Conversation de groupe : un membre est parti, Halfling a des messages non lus
  const groupId = "exemple-groupe";
  const group = { isGroup: true, name: "Covoiturage Printemps", createdAt: daysAgo(5) };
  await prisma.conversation.upsert({ where: { id: groupId }, update: group, create: { id: groupId, ...group } });
  const participants = [
    { userId: "exemple-chef-ligue", isAdmin: true, deletedAt: null, lastReadAt: daysAgo(0) },
    { userId: "exemple-coach-1", isAdmin: false, deletedAt: null, lastReadAt: daysAgo(0) },
    { userId: "exemple-coach-3", isAdmin: false, deletedAt: null, lastReadAt: daysAgo(5) },
    { userId: "exemple-coach-4", isAdmin: false, deletedAt: daysAgo(3), lastReadAt: daysAgo(3) },
  ];
  for (const participant of participants) {
    const key = { userId: participant.userId, conversationId: groupId };
    await prisma.conversationParticipant.upsert({
      where: { userId_conversationId: key },
      update: participant,
      create: { ...key, ...participant, joinedAt: daysAgo(5) },
    });
  }
  const groupMessages = [
    { id: "exemple-groupe-mp-1", authorId: "exemple-chef-ligue", content: "Qui a de la place dans sa voiture pour le Printemps ?", hoursAgo: 96 },
    { id: "exemple-groupe-mp-2", authorId: "exemple-coach-4", content: "Pas moi, je quitte le groupe.", hoursAgo: 80 },
    { id: "exemple-groupe-mp-3", authorId: "exemple-coach-1", content: "Deux places au départ de Rouen.", hoursAgo: 20 },
    { id: "exemple-groupe-mp-4", authorId: "exemple-chef-ligue", content: "Parfait, merci !", hoursAgo: 10 },
  ];
  for (const { hoursAgo, ...message } of groupMessages) {
    const data = { ...message, conversationId: groupId, createdAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000) };
    await prisma.privateMessage.upsert({ where: { id: message.id }, update: data, create: data });
  }

  // Conversation avec un banni (écrite avant le bannissement)
  const bannedConversationId = "exemple-conversation-banni";
  const bannedConversation = { user1Id: "exemple-coach-3", user2Id: "exemple-banni-inscrit", createdAt: daysAgo(20) };
  await prisma.conversation.upsert({ where: { id: bannedConversationId }, update: bannedConversation, create: { id: bannedConversationId, ...bannedConversation } });
  for (const userId of ["exemple-coach-3", "exemple-banni-inscrit"]) {
    await prisma.conversationParticipant.upsert({
      where: { userId_conversationId: { userId, conversationId: bannedConversationId } },
      update: {},
      create: { userId, conversationId: bannedConversationId, joinedAt: daysAgo(20), lastReadAt: daysAgo(19) },
    });
  }
  const bannedMessage = { id: "exemple-mp-banni", authorId: "exemple-banni-inscrit", content: "Tu veux des dés spéciaux ?", conversationId: bannedConversationId, createdAt: daysAgo(19) };
  await prisma.privateMessage.upsert({ where: { id: bannedMessage.id }, update: bannedMessage, create: bannedMessage });

  // Blocage : Lézard a bloqué Skaven
  await prisma.block.upsert({
    where: { blockerId_blockedId: { blockerId: "exemple-coach-4", blockedId: "exemple-coach-2" } },
    update: {},
    create: { blockerId: "exemple-coach-4", blockedId: "exemple-coach-2" },
  });

  // Un signalement de chaque type, en attente ou traité
  const reports = [
    { id: "exemple-signalement-sujet", reason: "Spam / Publicité", targetType: "TOPIC", targetId: "exemple-topic-fusion-2", reporterId: "exemple-coach-1" },
    { id: "exemple-signalement-membre", reason: "Harcèlement / Insultes", targetType: "USER", targetId: "exemple-coach-role-perso", reporterId: "exemple-coach-2" },
    { id: "exemple-signalement-article", reason: "Contenu inapproprié / NSFW", targetType: "ARTICLE", targetId: "exemple-article-banni", reporterId: "exemple-coach-3" },
    { id: "exemple-signalement-ligue", reason: "Autre (préciser ci-dessous)", targetType: "LIGUE", targetId: "exemple-ligue-bannie", reporterId: "exemple-coach-4" },
    {
      id: "exemple-signalement-traite",
      reason: "Harcèlement / Insultes",
      targetType: "POST",
      targetId: "exemple-topic-moderation-post-1",
      reporterId: "exemple-coach-2",
      status: "RESOLVED",
      resolvedById: "exemple-modo",
      resolvedAt: daysAgo(3),
    },
  ];
  for (const report of reports) {
    const data = { details: "Signalement fictif du profil exemple.", ...report };
    await prisma.moderationReport.upsert({ where: { id: report.id }, update: data, create: data });
  }

  // Journal de modération : une entrée de chaque grande famille
  const logs = [
    { action: "TOPIC_DELETED", moderatorId: "exemple-modo", targetId: "exemple-topic-supprime", targetType: "TOPIC", details: "Publicité (exemple)" },
    { action: "POST_MODERATED", moderatorId: "exemple-modo", targetId: "exemple-topic-moderation-post-1", targetType: "POST", details: "Propos insultants (exemple)" },
    { action: "POST_DELETED", moderatorId: "exemple-modo-2", targetId: "exemple-topic-moderation-post-3", targetType: "POST", details: "Lien malveillant (exemple)" },
    { action: "TOPIC_MOVED", moderatorId: "exemple-modo", targetId: "exemple-topic-tableau", targetType: "TOPIC", details: "Déplacé depuis « La brocante »" },
    { action: "USER_BANNED", moderatorId: "exemple-admin", targetId: "exemple-banni-inscrit", targetType: "USER", details: "Faux résultats envoyés (exemple)" },
    { action: "USER_ROLE_CHANGED", moderatorId: "exemple-superadmin", targetId: "exemple-modo-2", targetType: "USER", details: "COACH → MODERATOR" },
    { action: "ARTICLE_MODERATED", moderatorId: "exemple-modo", targetId: "exemple-article-masque", targetType: "ARTICLE", details: "Plagiat (exemple)" },
    { action: "REPORT_RESOLVED", moderatorId: "exemple-modo", targetId: "exemple-topic-moderation-post-1", targetType: "POST" },
    { action: "TOURNAMENT_CDF_VALIDATED", moderatorId: "exemple-modo", targetId: "exemple-tournoi-termine", targetType: "TOURNAMENT" },
  ];
  for (const [index, log] of logs.entries()) {
    const id = `exemple-journal-${index + 1}`;
    const data = { ...log, createdAt: daysAgo(logs.length - index) };
    await prisma.moderationLog.upsert({ where: { id }, update: data, create: { id, ...data } });
  }

  // Notifications déjà lues, pour voir la différence avec les non lues
  const readNotifications = [
    { id: "exemple-notif-lue-mention", userId: "exemple-coach-2", type: "MENTION", topicId: "exemple-topic-bbcode", postId: "exemple-topic-bbcode-post-0", actorId: "exemple-modo", readAt: daysAgo(1) },
    { id: "exemple-notif-groupe", userId: "exemple-coach-3", type: "PRIVATE_MESSAGE", conversationId: groupId, actorId: "exemple-chef-ligue", readAt: null },
    { id: "exemple-notif-long", userId: "exemple-coach-1", type: "FOLLOWED_REPLY", topicId: "exemple-topic-long", postId: "exemple-topic-long-post-25", actorId: "exemple-coach-2", readAt: daysAgo(2) },
  ];
  for (const notification of readNotifications) {
    await prisma.notification.upsert({ where: { id: notification.id }, update: notification, create: notification });
  }
}

async function main() {
  console.log("Données fictives du profil exemple...");
  await seedCustomRole();
  await seedMembers();
  await seedForum();
  await seedArticlesAndResources();
  await seedLigues();
  await seedTournaments();
  await seedMessagesAndNotifications();
  await seedForumStructureCases();
  await seedForumCases();
  await seedArticleAndResourceCases();
  await seedLigueCases();
  await seedTournamentCases();
  await seedMessagingAndModerationCases();
  console.log("Données fictives prêtes.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
