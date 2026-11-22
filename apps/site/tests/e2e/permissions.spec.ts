/**
 * Carte 221 : chaque faille de droits trouvée par la revue de l'administration et de la modération est refusée par le
 * serveur. Les actions sont appelées directement (`callServerAction`), avec la session de chaque rôle et des
 * arguments que l'écran ne propose jamais, puis on vérifie la base.
 *
 * Données propres à ce fichier (identifiants `p221_…`), créées avant les tests.
 */
import { test, expect } from "@playwright/test";
import { E2E, callServerAction, loginAs, withTestDb } from "./fixtures";

test.describe.configure({ mode: "serial" });

const ID = {
  superadmin: "p221_super",
  admin: "p221_admin",
  admin2: "p221_admin2",
  modo: "p221_modo",
  coach: "p221_coach",
  victim: "p221_victim",
  deletable: "p221_deletable",
  banned: "p221_banned",
  topic: "p221_topic",
  postOk: "p221_post_ok",
  postDeleted: "p221_post_deleted",
  postHidden: "p221_post_hidden",
  tool: "p221_tool",
  group: "p221_group",
  log: "p221_log",
  article: "p221_article",
  tournament: "p221_tournament",
  tournamentTopic: "p221_tournament_topic",
};

test.beforeAll(async () => {
  await withTestDb(async (prisma) => {
    for (const role of [
      { name: "SUPERADMIN", label: "Super Admin", power: 100 },
      { name: "ADMIN", label: "Administrateur", power: 90 },
      { name: "RTC", label: "RTC", power: 50 },
    ]) {
      await prisma.roleConfig.upsert({ where: { name: role.name }, update: {}, create: { ...role, isBaseRole: true } });
    }
    const users = [
      { id: ID.superadmin, role: "SUPERADMIN" },
      { id: ID.admin, role: "ADMIN" },
      { id: ID.admin2, role: "ADMIN" },
      { id: ID.modo, role: "MODERATOR" },
      { id: ID.coach, role: "COACH" },
      { id: ID.victim, role: "COACH" },
      { id: ID.deletable, role: "COACH" },
      { id: ID.banned, role: "COACH", isBanned: true, banReason: "Test e2e" },
    ];
    for (const user of users) {
      const data = { name: `Membre ${user.id}`, email: `${user.id}@e2e.test`, hasFinishedOnboarding: true, isBanned: false, ...user };
      await prisma.user.upsert({ where: { id: user.id }, update: data, create: data });
    }

    // Sujet avec un message normal, un message supprimé par la modération et un message masqué
    const now = Date.now();
    await prisma.topic.upsert({
      where: { id: ID.topic },
      update: {},
      create: { id: ID.topic, title: "Sujet des droits (carte 221)", forumId: E2E.forumId, authorId: ID.coach, lastPostAt: new Date(now), lastPostId: ID.postOk, lastPostAuthorId: ID.coach },
    });
    const posts = [
      { id: ID.postOk, content: "Message normal", createdAt: new Date(now - 3000) },
      { id: ID.postDeleted, content: "Message supprimé", createdAt: new Date(now - 2000), isDeleted: true, deletedAt: new Date(), deletedById: ID.modo, deletionReason: "Test" },
      { id: ID.postHidden, content: "Message masqué", createdAt: new Date(now - 1000), isModerated: true, moderatedBy: ID.modo, moderationReason: "Test" },
    ];
    for (const post of posts) {
      const data = { topicId: ID.topic, authorId: ID.coach, ...post };
      await prisma.post.upsert({ where: { id: post.id }, update: data, create: data });
    }

    await prisma.resource.upsert({
      where: { id: ID.tool },
      update: { title: "Outil 221", link: "/forum", status: "APPROVED", isSystem: true },
      create: { id: ID.tool, title: "Outil 221", link: "/forum", status: "APPROVED", isSystem: true, authorId: ID.admin },
    });

    // Groupe que le coach a quitté
    await prisma.conversation.upsert({ where: { id: ID.group }, update: {}, create: { id: ID.group, isGroup: true, name: "Groupe 221" } });
    for (const participant of [
      { userId: ID.coach, deletedAt: new Date() },
      { userId: ID.victim, deletedAt: null },
      { userId: ID.modo, deletedAt: null },
    ]) {
      await prisma.conversationParticipant.upsert({
        where: { userId_conversationId: { userId: participant.userId, conversationId: ID.group } },
        update: participant,
        create: { ...participant, conversationId: ID.group },
      });
    }

    // Entrée du journal d'hier : aucune purge ne doit l'effacer
    await prisma.moderationLog.upsert({
      where: { id: ID.log },
      update: { createdAt: new Date(now - 24 * 60 * 60 * 1000) },
      create: { id: ID.log, action: "TOPIC_LOCKED", moderatorId: ID.modo, createdAt: new Date(now - 24 * 60 * 60 * 1000) },
    });

    await prisma.article.upsert({
      where: { id: ID.article },
      update: { views: 0 },
      create: { id: ID.article, title: "Article 221", content: "Texte de l'article", authorId: ID.admin, views: 0 },
    });

    // Tournoi organisé par le coach, avec un inscrit banni depuis
    await prisma.tournament.upsert({
      where: { id: ID.tournament },
      update: {},
      create: { id: ID.tournament, name: "Tournoi 221", date: new Date(now + 30 * 24 * 60 * 60 * 1000), location: "Salle", organizerId: ID.coach, maxParticipants: 8 },
    });
    await prisma.topic.upsert({
      where: { id: ID.tournamentTopic },
      update: {},
      create: { id: ID.tournamentTopic, title: "Tournoi 221", forumId: E2E.forumId, authorId: ID.coach, tournamentId: ID.tournament },
    });
    await prisma.post.upsert({
      where: { id: `${ID.tournamentTopic}_post` },
      update: {},
      create: { id: `${ID.tournamentTopic}_post`, content: "Annonce du tournoi", topicId: ID.tournamentTopic, authorId: ID.coach },
    });
    await prisma.tournamentRegistration.upsert({
      where: { tournamentId_userId: { tournamentId: ID.tournament, userId: ID.banned } },
      update: { status: "REGISTERED" },
      create: { tournamentId: ID.tournament, userId: ID.banned, status: "REGISTERED" },
    });
  });
});

test("changement de rôle : rôle inventé, rôle trop haut et son propre rôle sont refusés ; un rôle permis est tracé", async ({ page }) => {
  await loginAs(page, ID.modo);
  for (const role of ["PIRATE", "ADMIN", "MODERATOR"]) {
    const result = await callServerAction(page, "/membres", "updateUserRole", [ID.victim, role]);
    expect(result?.success, `rôle ${role}`).toBe(false);
  }
  const fromAdmin = await callServerAction(page, "/administration", "updateCoachRole", [ID.victim, "SUPERADMIN"]);
  expect(fromAdmin?.success).toBe(false);
  expect((await callServerAction(page, "/membres", "updateUserRole", [ID.victim, "RTC"]))?.success).toBe(true);

  await loginAs(page, ID.superadmin);
  expect((await callServerAction(page, "/membres", "updateUserRole", [ID.superadmin, "COACH"]))?.success).toBe(false);

  await withTestDb(async (prisma) => {
    expect((await prisma.user.findUnique({ where: { id: ID.victim } }))?.role).toBe("RTC");
    expect((await prisma.user.findUnique({ where: { id: ID.superadmin } }))?.role).toBe("SUPERADMIN");
    const log = await prisma.moderationLog.findFirst({ where: { action: "USER_ROLE_CHANGED", targetId: ID.victim, moderatorId: ID.modo } });
    expect(log).not.toBeNull();
    await prisma.user.update({ where: { id: ID.victim }, data: { role: "COACH" } });
  });
});

test("suppression d'un compte : refusée à un modérateur et entre admins, permise à un admin sur un coach", async ({ page }) => {
  await loginAs(page, ID.modo);
  expect((await callServerAction(page, "/membres", "deleteUser", [ID.victim]))?.success).toBe(false);

  await loginAs(page, ID.admin);
  expect((await callServerAction(page, "/membres", "deleteUser", [ID.admin2]))?.success).toBe(false);
  expect((await callServerAction(page, "/membres", "deleteUser", [ID.deletable]))?.success).toBe(true);

  await withTestDb(async (prisma) => {
    expect(await prisma.user.findUnique({ where: { id: ID.victim } })).not.toBeNull();
    expect(await prisma.user.findUnique({ where: { id: ID.admin2 } })).not.toBeNull();
    expect(await prisma.user.findUnique({ where: { id: ID.deletable } })).toBeNull();
  });
});

test("le journal de modération ne peut pas être vidé : la durée de conservation est fixée par le serveur", async ({ page }) => {
  await loginAs(page, ID.modo);
  expect((await callServerAction(page, "/moderation", "cleanupModerationLogs", []))?.success).toBe(false);

  await loginAs(page, ID.admin);
  // Avant la carte 221, l'argument 0 effaçait tout le journal
  expect((await callServerAction(page, "/moderation", "cleanupModerationLogs", [0]))?.success).toBe(true);
  await withTestDb(async (prisma) => {
    expect(await prisma.moderationLog.findUnique({ where: { id: ID.log } })).not.toBeNull();
  });
});

test("un modérateur ne modifie ni ne rejette un outil système par la voie de la modération", async ({ page }) => {
  await loginAs(page, ID.modo);
  const update = await callServerAction(page, "/moderation", "moderateResource", [ID.tool, "UPDATE", { title: "Piraté", link: "https://example.com/piege" }]);
  expect(update?.error).toBeTruthy();
  const reject = await callServerAction(page, "/moderation", "moderateResource", [ID.tool, "REJECT"]);
  expect(reject?.error).toBeTruthy();
  await withTestDb(async (prisma) => {
    const tool = await prisma.resource.findUnique({ where: { id: ID.tool } });
    expect(tool?.title).toBe("Outil 221");
    expect(tool?.link).toBe("/forum");
    expect(tool?.status).toBe("APPROVED");
  });
});

test("l'auteur ne modifie plus un message supprimé ou masqué ; un modérateur qui modifie un message est tracé", async ({ page }) => {
  const editPage = `/forum/post/${ID.postOk}/edit`;
  await loginAs(page, ID.coach);
  for (const postId of [ID.postDeleted, ID.postHidden]) {
    expect((await callServerAction(page, editPage, "updatePost", [postId, "Texte réécrit en douce"]))?.success, postId).toBe(false);
  }

  await loginAs(page, ID.modo);
  expect((await callServerAction(page, editPage, "updatePost", [ID.postOk, "Message corrigé par la modération"]))?.success).toBe(true);

  await withTestDb(async (prisma) => {
    expect((await prisma.post.findUnique({ where: { id: ID.postDeleted } }))?.content).toBe("Message supprimé");
    expect((await prisma.post.findUnique({ where: { id: ID.postHidden } }))?.content).toBe("Message masqué");
    const log = await prisma.moderationLog.findFirst({ where: { action: "POST_EDITED_BY_MOD", targetId: ID.postOk } });
    expect(log).not.toBeNull();
  });
});

test("messagerie : pas de message vide ou trop long, pas de conversation avec un banni, pas de renommage après départ", async ({ page }) => {
  await loginAs(page, ID.coach);
  expect((await callServerAction(page, "/messagerie", "startConversation", [[ID.banned]]))?.success).toBe(false);
  expect((await callServerAction(page, "/messagerie", "startConversation", [["compte-inexistant"]]))?.success).toBe(false);
  // Comptes techniques du site : personne ne leur écrit
  expect((await callServerAction(page, "/messagerie", "startConversation", [["system"]]))?.success).toBe(false);
  expect((await callServerAction(page, "/messagerie", "startConversation", [["ghost_coach"]]))?.success).toBe(false);
  expect((await callServerAction(page, "/messagerie", "renameConversation", [ID.group, "Renommé après départ"]))?.success).toBe(false);

  await loginAs(page, ID.victim);
  expect((await callServerAction(page, "/messagerie", "sendMessage", [ID.group, "   "]))?.success).toBe(false);
  expect((await callServerAction(page, "/messagerie", "sendMessage", [ID.group, "x".repeat(501)]))?.success).toBe(false);

  await withTestDb(async (prisma) => {
    expect((await prisma.conversation.findUnique({ where: { id: ID.group } }))?.name).toBe("Groupe 221");
    expect(await prisma.privateMessage.count({ where: { conversationId: ID.group } })).toBe(0);
  });
});

test("signalement : type inconnu, contenu réservé et doublon refusés ; un banni ne signale rien", async ({ page }) => {
  const articlePage = `/articles/${ID.article}`;
  await loginAs(page, ID.coach);
  const report = (targetType: string, targetId: string) =>
    callServerAction(page, articlePage, "createReportAction", [{ reason: "Spam / Publicité", targetType, targetId }]);

  expect((await report("CONVERSATION", ID.group))?.success).toBe(false);
  expect((await report("TOPIC", E2E.secretTopicId))?.success).toBe(false);
  expect((await report("POST", ID.postDeleted))?.success).toBe(false);
  expect((await report("POST", ID.postOk))?.success).toBe(true);
  expect((await report("POST", ID.postOk))?.success).toBe(false);

  await loginAs(page, ID.banned);
  expect((await callServerAction(page, articlePage, "createReportAction", [{ reason: "Spam", targetType: "POST", targetId: ID.postOk }]))?.success).toBe(false);

  await withTestDb(async (prisma) => {
    expect(await prisma.moderationReport.count({ where: { targetId: ID.postOk } })).toBe(1);
    expect(await prisma.moderationReport.count({ where: { targetId: E2E.secretTopicId } })).toBe(0);
  });
});

test("réglages du site : une clé inconnue est refusée, une clé prévue est enregistrée et tracée", async ({ page }) => {
  await loginAs(page, ID.admin);
  expect((await callServerAction(page, "/administration", "updateSiteSetting", ["devProfile", "pirate"]))?.success).toBe(false);
  expect((await callServerAction(page, "/administration", "updateHowToPlaySettings", [{ discord_invite: "https://example.com" }]))?.success).toBe(false);
  expect((await callServerAction(page, "/administration", "updateSiteSetting", ["discord_invite", "https://discord.gg/e2e221"]))?.success).toBe(true);

  await withTestDb(async (prisma) => {
    expect(await prisma.siteSetting.findUnique({ where: { key: "devProfile" } })).toBeNull();
    expect(await prisma.moderationLog.findFirst({ where: { action: "SITE_SETTING_UPDATED", targetId: "discord_invite" } })).not.toBeNull();
    await prisma.siteSetting.delete({ where: { key: "discord_invite" } });
  });
});

test("le compteur de lectures d'un article ne monte qu'une fois par visite", async ({ page }) => {
  await loginAs(page, ID.coach);
  for (let i = 0; i < 3; i++) await page.request.post(`/api/articles/${ID.article}/view`);
  await withTestDb(async (prisma) => {
    expect((await prisma.article.findUnique({ where: { id: ID.article } }))?.views).toBe(1);
  });
});

test("l'organisateur voit qu'un inscrit a été banni", async ({ page }) => {
  await loginAs(page, ID.coach);
  await page.goto(`/forum/topic/${ID.tournamentTopic}`, { waitUntil: "networkidle" });
  // La liste des inscriptions est ouverte d'office pour l'organisateur (carte 221)
  await expect(page.getByRole("button", { name: /Gestion des inscriptions/ })).toHaveAttribute("aria-expanded", "true");
  const row = page.getByRole("listitem").filter({ hasText: `Membre ${ID.banned}` });
  await expect(row.getByText("Banni", { exact: true })).toBeVisible();
});
