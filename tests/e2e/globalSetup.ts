/**
 * Setup global des tests smoke : insère le jeu de données minimal dans e2e.db
 * (le schéma est poussé par la commande webServer de playwright.config.ts).
 */
import { PrismaClient } from "../../prisma/generated-client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { E2E } from "./fixtures";

export default async function globalSetup() {
  // Client direct (le loader Playwright ne résout pas l'alias "@/" utilisé par lib/prisma.ts)
  const prisma = new PrismaClient({ adapter: new PrismaLibSql({ url: "file:./e2e.db" }) });

  // User.role est une FK vers RoleConfig
  await prisma.roleConfig.upsert({
    where: { name: "COACH" },
    update: {},
    create: { name: "COACH", label: "Coach", power: 10, isBaseRole: true },
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

  await prisma.$disconnect();
}
