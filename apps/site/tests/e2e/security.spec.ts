/**
 * Tests des failles corrigées par la carte 050 (sécurité de la modération et de la connexion)
 * et par la carte 051 (BBQuizz : bonnes réponses et score gardés par le serveur).
 */
import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";
import { PrismaClient } from "../../prisma/generated-client";
import { PrismaPg } from "@prisma/adapter-pg";
import { E2E, E2E_DATABASE_URL, loginAs, withTestDb } from "./fixtures";
import { questions as staticQuestions } from "../../app/bbquizz/data/questions";

test("le journal de modération n'est pas une action serveur publique", () => {
  // Une fonction exportée d'un fichier « use server » devient appelable depuis le navigateur par n'importe qui
  const helper = readFileSync("lib/moderationLog.ts", "utf-8");
  expect(helper).not.toMatch(/["']use server["']/);
  const actions = readFileSync("app/moderation/actions.ts", "utf-8");
  expect(actions).not.toMatch(/export async function logModerationAction/);
});

test("après connexion, aucune redirection vers un site extérieur", async ({ page }) => {
  await loginAs(page, E2E.coachId);
  for (const target of ["https://example.com", "//example.com", "/\example.com"]) {
    await page.goto(`/auth/login?callbackUrl=${encodeURIComponent(target)}`);
    expect(new URL(page.url()).hostname).toBe("localhost");
  }
});

test("l'API des articles ne dévoile ni la fiche de l'auteur ni les articles masqués", async ({ page, request }) => {
  // Articles créés pour ce test seulement : l'accueil affiche un article au hasard, ce qui changerait ses captures
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: E2E_DATABASE_URL }) });
  await prisma.article.createMany({
    data: [
      { id: E2E.articleId, title: "Article visible E2E", content: "Contenu public", authorId: E2E.coachId },
      { id: E2E.moderatedArticleId, title: "Article masqué E2E", content: "Contenu masqué", authorId: E2E.coachId, isModerated: true, moderationReason: "Test e2e" },
    ],
    skipDuplicates: true,
  });
  try {
  const anonymous = await (await request.get(`/api/articles?authorId=${E2E.coachId}`)).json();
  const anonymousIds = anonymous.articles.map((article: { id: string }) => article.id);
  expect(anonymousIds).toContain(E2E.articleId);
  expect(anonymousIds).not.toContain(E2E.moderatedArticleId);
  for (const article of anonymous.articles) {
    expect(Object.keys(article.author).sort()).toEqual(["avatarFrame", "id", "image", "name", "role"]);
  }

  // L'auteur voit ses propres articles masqués
  await loginAs(page, E2E.coachId);
  const own = await (await page.request.get(`/api/articles?authorId=${E2E.coachId}`)).json();
  expect(own.articles.map((article: { id: string }) => article.id)).toContain(E2E.moderatedArticleId);

  // Taille de page bornée
  const big = await (await request.get(`/api/articles?authorId=${E2E.coachId}&limit=100000`)).json();
  expect(big.totalPages).toBeGreaterThanOrEqual(1);
  } finally {
    await prisma.article.deleteMany({ where: { id: { in: [E2E.articleId, E2E.moderatedArticleId] } } });
    await prisma.$disconnect();
  }
});

test("un modérateur bannit un membre depuis sa fiche, et c'est tracé au journal", async ({ page }) => {
  await loginAs(page, E2E.modoId);
  await page.goto(`/spy/${E2E.targetId}`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Bannir" }).first().click();
  await page.getByRole("button", { name: "Spam / Publicité" }).click();
  await page.getByRole("button", { name: "Confirmer le bannissement" }).click();
  await expect(page.getByText("Utilisateur banni")).toBeVisible();

  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: E2E_DATABASE_URL }) });
  try {
    const target = await prisma.user.findUnique({ where: { id: E2E.targetId }, select: { isBanned: true } });
    expect(target?.isBanned).toBe(true);
    const log = await prisma.moderationLog.findFirst({ where: { action: "USER_BANNED", targetId: E2E.targetId, moderatorId: E2E.modoId } });
    expect(log).not.toBeNull();
  } finally {
    await prisma.$disconnect();
  }
});

test("un modérateur ne peut pas débannir un membre de rang égal, mais débannit un coach, et c'est tracé au journal", async ({ page }) => {
  // Un modérateur banni (même rang que « Modo E2E ») et le coach cible banni, préparés directement en base
  await withTestDb(async (prisma) => {
    await prisma.user.upsert({
      where: { id: E2E.bannedModoId },
      update: { isBanned: true, banReason: "Test e2e" },
      create: { id: E2E.bannedModoId, name: E2E.bannedModoName, email: "banned-modo@e2e.test", role: "MODERATOR", hasFinishedOnboarding: true, isBanned: true, banReason: "Test e2e" },
    });
    await prisma.user.update({ where: { id: E2E.targetId }, data: { isBanned: true, banReason: "Test e2e" } });
  });

  try {
    await loginAs(page, E2E.modoId);
    await page.goto("/moderation?tab=reports_user_banned", { waitUntil: "networkidle" });

    // Refus : le serveur bloque le débannissement d'un membre de rang égal
    await page.getByRole("row").filter({ hasText: E2E.bannedModoName }).getByRole("button", { name: "Débannir" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Débannir" }).click();
    await expect(page.getByText("Vous ne pouvez pas débannir ce membre (hiérarchie insuffisante)")).toBeVisible();

    // Autorisé : le coach, de rang inférieur, est débanni
    await page.getByRole("row").filter({ hasText: "Cible E2E" }).getByRole("button", { name: "Débannir" }).click();
    await page.getByRole("dialog").getByRole("button", { name: "Débannir" }).click();
    await expect(page.getByText("Utilisateur débanni")).toBeVisible();

    await withTestDb(async (prisma) => {
      const bannedModo = await prisma.user.findUnique({ where: { id: E2E.bannedModoId }, select: { isBanned: true } });
      expect(bannedModo?.isBanned).toBe(true);
      const refusedLog = await prisma.moderationLog.findFirst({ where: { action: "USER_UNBANNED", targetId: E2E.bannedModoId } });
      expect(refusedLog).toBeNull();

      const target = await prisma.user.findUnique({ where: { id: E2E.targetId }, select: { isBanned: true } });
      expect(target?.isBanned).toBe(false);
      const log = await prisma.moderationLog.findFirst({ where: { action: "USER_UNBANNED", targetId: E2E.targetId, moderatorId: E2E.modoId } });
      expect(log).not.toBeNull();
    });
  } finally {
    await withTestDb((prisma) => prisma.user.delete({ where: { id: E2E.bannedModoId } }));
  }
});

test("BBQuizz : ni la bonne réponse ni le calcul du score ne passent par le navigateur", async ({ page }) => {
  // L'ancienne action qui acceptait le score envoyé par le navigateur ne doit pas revenir
  const actions = readFileSync("app/bbquizz/actions.ts", "utf-8");
  expect(actions).not.toMatch(/export async function submitQuizAttempt/);

  // Tout ce que le serveur renvoie aux actions du jeu est gardé pour être inspecté
  const actionBodies: string[] = [];
  page.on("response", async (response) => {
    if (response.request().method() === "POST" && response.url().includes("/bbquizz")) {
      actionBodies.push(await response.text().catch(() => ""));
    }
  });

  await loginAs(page, E2E.coachId);
  await page.goto("/bbquizz", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Commencer le quizz !" }).click();
  await expect(page.locator(".question-text")).toBeVisible();

  // Avant de répondre : aucune trace de la bonne réponse ni de l'explication
  for (const body of actionBodies) {
    expect(body).not.toContain("correctIndex");
    expect(body).not.toContain("explanation");
  }

  // La base e2e n'a pas de questions : le jeu utilise celles de départ, où l'on retrouve la bonne réponse
  const questionText = await page.locator(".question-text").innerText();
  const correctIndex = staticQuestions.find((question) => question.question === questionText.trim())!.correctIndex;

  // Après les 5 secondes de lecture, on répond juste : le serveur compte 100 points plus le bonus de rapidité
  const answer = page.locator(".option-btn").nth(correctIndex);
  await expect(answer).toBeEnabled({ timeout: 10_000 });
  await answer.click();
  await expect(page.locator(".points-feedback.plus")).toBeVisible();
  const shownScore = await page.locator(".quiz-score").innerText();
  page.removeAllListeners("response");
  await page.close();

  // La partie est tenue en base, avec le score calculé par le serveur
  const game = await withTestDb((prisma) => prisma.quizGame.findFirst({ where: { userId: E2E.coachId } }));
  try {
    expect(game?.currentIndex).toBe(1);
    expect(game?.correct).toBe(1);
    expect(game?.score).toBeGreaterThanOrEqual(100);
    expect(game?.score).toBeLessThanOrEqual(130);
    expect(shownScore).toBe(`Score: ${game?.score}`);
  } finally {
    await withTestDb((prisma) => prisma.quizGame.deleteMany({ where: { userId: E2E.coachId } }));
  }
});
