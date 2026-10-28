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
