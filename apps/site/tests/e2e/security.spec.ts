/**
 * Tests des failles corrigées par la carte 050 (sécurité de la modération et de la connexion).
 */
import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";
import { PrismaClient } from "../../prisma/generated-client";
import { PrismaPg } from "@prisma/adapter-pg";
import { E2E, E2E_DATABASE_URL, loginAs } from "./fixtures";

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
