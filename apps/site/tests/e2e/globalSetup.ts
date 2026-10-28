/**
 * Setup global des tests smoke : insère le jeu de données minimal dans la base de test
 * (créée vide et structurée par scripts/e2e-db.mjs avant le lancement des tests).
 */
import { PrismaClient } from "../../prisma/generated-client";
import { PrismaPg } from "@prisma/adapter-pg";
import { E2E, E2E_DATABASE_URL } from "./fixtures";

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

  await prisma.user.upsert({
    where: { id: E2E.modoId },
    update: {},
    create: { id: E2E.modoId, name: "Modo E2E", email: "modo@e2e.test", role: "MODERATOR", hasFinishedOnboarding: true },
  });

  const category = await prisma.category.upsert({
    where: { name: E2E.categoryName },
    update: {},
    create: { name: E2E.categoryName },
  });
  const forum = await prisma.forum.upsert({
    where: { name: E2E.forumName },
    update: {},
    create: { name: E2E.forumName, categoryId: category.id },
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

  // Carte 050 : un membre ordinaire que le modérateur bannira
  await prisma.user.upsert({
    where: { id: E2E.targetId },
    update: { isBanned: false, banReason: null },
    create: { id: E2E.targetId, name: "Cible E2E", email: "target@e2e.test", hasFinishedOnboarding: true },
  });

  await prisma.$disconnect();
}
