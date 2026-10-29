/**
 * Tests smoke : parcours critiques qui doivent rester verts à chaque phase du refacto.
 */
import { test, expect } from "@playwright/test";
import { E2E, loginAs } from "./fixtures";

const PUBLIC_PAGES = ["/", "/forum", "/tournois", "/classement", "/bbscheme", "/articles", "/ressources"];

for (const path of PUBLIC_PAGES) {
  test(`page publique ${path} répond sans erreur`, async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    const response = await page.goto(path);
    expect(response?.status()).toBeLessThan(400);
    await page.waitForLoadState("networkidle");
    expect(pageErrors).toEqual([]);
  });
}

test("le forum affiche la catégorie et le topic", async ({ page }) => {
  await page.goto("/forum");
  await expect(page.getByText(E2E.forumName).first()).toBeVisible();
  await page.goto(`/forum/topic/${E2E.topicId}`);
  await expect(page.getByText(E2E.postContent)).toBeVisible();
});

test("un coach connecté peut répondre à un topic", async ({ page }) => {
  await loginAs(page, E2E.coachId);
  const reply = `Réponse smoke ${Date.now()}`;
  await page.goto(`/forum/topic/${E2E.topicId}/reply`);
  await page.locator('textarea[name="content"]').fill(reply);
  await page.getByRole("button", { name: "Publier ma réponse" }).click();
  await page.waitForURL(new RegExp(`/forum/topic/${E2E.topicId}`));
  await expect(page.getByText(reply)).toBeVisible();
});

test("un coach connecté accède à son profil", async ({ page }) => {
  await loginAs(page, E2E.coachId);
  const response = await page.goto("/profile");
  expect(response?.status()).toBeLessThan(400);
  await expect(page).not.toHaveURL(/auth\/login/);
});

test("un banni est redirigé vers /banned", async ({ page }) => {
  await loginAs(page, E2E.bannedId);
  await page.goto("/forum");
  await page.waitForURL(/\/banned/);
});

test("aucun email d'auteur dans les pages et API publiques", async ({ page, request }) => {
  await loginAs(page, E2E.coachId);
  for (const path of ["/forum", `/forum/topic/${E2E.topicId}`, "/api/articles"]) {
    const anonymous = await request.get(path);
    const connected = await page.request.get(path);
    expect(await anonymous.text(), `${path} anonyme`).not.toContain(E2E.coachEmail);
    expect(await connected.text(), `${path} connecté`).not.toContain(E2E.coachEmail);
  }
});

test("un coach ne voit ni n'ouvre le contenu réservé aux modérateurs", async ({ page }) => {
  await loginAs(page, E2E.coachId);
  await page.goto("/forum");
  await expect(page.getByText(E2E.forumName).first()).toBeVisible();
  await expect(page.getByText(E2E.secretForumName)).toHaveCount(0);
  await expect(page.getByText(E2E.secretCategoryName)).toHaveCount(0);

  expect((await page.request.get(`/forum/${E2E.secretForumId}`)).status()).toBe(404);
  expect((await page.request.get(`/forum/topic/${E2E.secretTopicId}?page=1`)).status()).toBe(404);
  const search = await page.request.get("/api/forum/topics/search?q=Secret");
  expect(await search.text()).not.toContain(E2E.secretTopicTitle);
});

test("un modérateur voit et ouvre le contenu réservé", async ({ page }) => {
  await loginAs(page, E2E.modoId);
  await page.goto("/forum");
  await expect(page.getByText(E2E.secretForumName).first()).toBeVisible();
  await page.goto(`/forum/topic/${E2E.secretTopicId}?page=1`);
  await expect(page.getByText("Message réservé aux modérateurs").first()).toBeVisible();
});

test("la recherche de membres se fait par pseudo, jamais par email", async ({ page }) => {
  await loginAs(page, E2E.coachId);
  await page.goto("/messagerie", { waitUntil: "networkidle" });
  await page.getByText("Nouvelle conversation").first().click();
  const search = page.getByPlaceholder("Tapez un nom...");
  await search.fill("modo@e2e");
  await expect(page.getByText("Aucun résultat")).toBeVisible();
  await search.fill("Modo E2");
  // Plusieurs modérateurs de test s'appellent « Modo E2E » (un par thème, carte 051)
  await expect(page.getByRole("dialog").getByText("Modo E2E").first()).toBeVisible();
});
