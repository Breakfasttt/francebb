/**
 * Setup global des tests smoke : insère le jeu de données minimal dans la base de test
 * (créée vide et structurée par scripts/e2e-db.mjs avant le lancement des tests).
 */
import { PrismaClient } from "../../prisma/generated-client";
import { PrismaPg } from "@prisma/adapter-pg";
import { E2E, E2E_DATABASE_URL, E2E_THEMES, themedBannedId, themedModoId } from "./fixtures";

export default async function globalSetup() {
  // Client direct (le loader Playwright ne résout pas l'alias "@/" utilisé par lib/prisma.ts)
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: E2E_DATABASE_URL }) });

  // User.role est une FK vers RoleConfig
  await prisma.roleConfig.upsert({
    where: { name: "COACH" },
    update: {},
    create: { name: "COACH", label: "Coach", power: 10, isBaseRole: true },
  });
  await prisma.roleConfig.upsert({
    where: { name: "MODERATOR" },
    update: {},
    create: { name: "MODERATOR", label: "Modérateur", power: 70, isBaseRole: true },
  });

  await prisma.user.upsert({
    where: { id: E2E.coachId },
    update: {},
    create: { id: E2E.coachId, name: "Coach E2E", email: E2E.coachEmail, hasFinishedOnboarding: true },
  });
  await prisma.user.upsert({
    where: { id: E2E.bannedId },
    update: { isBanned: true },
    create: {
      id: E2E.bannedId,
      name: "Banni E2E",
      email: "banned@e2e.test",
      hasFinishedOnboarding: true,
      isBanned: true,
      banReason: "Test e2e",
    },
  });

  // Un membre banni par thème, pour les captures de la page des bannis (même nom et même raison partout)
  for (const theme of E2E_THEMES) {
    const id = themedBannedId(theme);
    await prisma.user.upsert({
      where: { id },
      update: { theme, isBanned: true },
      create: {
        id,
        name: "Banni E2E",
        email: `${id}@e2e.test`,
        theme,
        hasFinishedOnboarding: true,
        isBanned: true,
        banReason: "Test e2e",
      },
    });
  }

  await prisma.user.upsert({
    where: { id: E2E.modoId },
    update: {},
    create: { id: E2E.modoId, name: "Modo E2E", email: "modo@e2e.test", role: "MODERATOR", hasFinishedOnboarding: true },
  });
  // Un modérateur par thème, pour les captures de la fenêtre de signalement (le thème du profil gagne)
  for (const theme of E2E_THEMES) {
    const id = themedModoId(theme);
    await prisma.user.upsert({
      where: { id },
      update: { theme },
      create: { id, name: "Modo E2E", email: `${id}@e2e.test`, role: "MODERATOR", theme, hasFinishedOnboarding: true },
    });
  }

  const category = await prisma.category.upsert({
    where: { name: E2E.categoryName },
    update: {},
    create: { name: E2E.categoryName },
  });
  const forum = await prisma.forum.upsert({
    where: { name: E2E.forumName },
    update: {},
    create: { id: E2E.forumId, name: E2E.forumName, categoryId: category.id },
  });
  await prisma.topic.upsert({
    where: { id: E2E.topicId },
    update: {},
    create: {
      id: E2E.topicId,
      title: E2E.topicTitle,
      forumId: forum.id,
      authorId: E2E.coachId,
      posts: { create: { content: E2E.postContent, authorId: E2E.coachId } },
    },
  });

  // Catégorie réservée aux modérateurs (allowedRoles = « ce rôle et supérieurs »)
  const secretCategory = await prisma.category.upsert({
    where: { name: E2E.secretCategoryName },
    update: {},
    create: { name: E2E.secretCategoryName, allowedRoles: "MODERATOR" },
  });
  const secretForum = await prisma.forum.upsert({
    where: { name: E2E.secretForumName },
    update: {},
    create: { id: E2E.secretForumId, name: E2E.secretForumName, categoryId: secretCategory.id },
  });
  await prisma.topic.upsert({
    where: { id: E2E.secretTopicId },
    update: {},
    create: {
      id: E2E.secretTopicId,
      title: E2E.secretTopicTitle,
      forumId: secretForum.id,
      authorId: E2E.modoId,
      posts: { create: { content: "Message réservé aux modérateurs", authorId: E2E.modoId } },
    },
  });

  // Cartes 061 et 024 : sujet dont le message affiche le lecteur BBScheme (plateau vide : terrain sans joueurs)
  await prisma.bBSchemeState.upsert({
    where: { id: E2E.bbschemeBoardId },
    update: {},
    create: { id: E2E.bbschemeBoardId, hash: E2E.bbschemeBoardId, data: "{}" },
  });
  await prisma.topic.upsert({
    where: { id: E2E.bbschemeTopicId },
    update: {},
    create: {
      id: E2E.bbschemeTopicId,
      title: "Schéma BBScheme de l'audit",
      forumId: forum.id,
      authorId: E2E.coachId,
      posts: { create: { content: `Voici le schéma : [bbscheme]${E2E.bbschemeBoardId}[/bbscheme]`, authorId: E2E.coachId } },
    },
  });

  // Carte 050 : un membre ordinaire que le modérateur bannira
  await prisma.user.upsert({
    where: { id: E2E.targetId },
    update: { isBanned: false, banReason: null },
    create: { id: E2E.targetId, name: "Cible E2E", email: "target@e2e.test", hasFinishedOnboarding: true },
  });

  await prisma.$disconnect();
}
