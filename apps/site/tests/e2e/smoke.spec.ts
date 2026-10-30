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

test("un membre sans avatar affiche l'avatar par défaut, sans image introuvable", async ({ page }) => {
  // Carte 065 : les membres de test n'ont pas d'avatar ; aucune image ne doit répondre « introuvable » (404)
  const missingImages: string[] = [];
  page.on("response", (response) => {
    if (response.request().resourceType() === "image" && response.status() === 404) missingImages.push(response.url());
  });
  await loginAs(page, E2E.coachId);
  await page.goto("/messagerie", { waitUntil: "networkidle" });
  await page.getByText("Nouvelle conversation").first().click();
  await page.getByPlaceholder("Tapez un nom...").fill("Modo E2");
  await expect(page.getByRole("dialog").locator(".member-avatar-fallback").first()).toBeVisible();
  expect(missingImages).toEqual([]);
});

// Carte 064 : un refus de l'action serveur s'affiche en notification, sans page d'erreur, et la saisie reste en place
test("créer un forum au nom déjà pris affiche une notification d'erreur", async ({ page }) => {
  await loginAs(page, E2E.modoId);
  await page.goto("/forum/new-forum", { waitUntil: "networkidle" });
  await page.locator("#name").fill(E2E.forumName);
  await page.getByRole("button", { name: "Créer le forum" }).click();
  await expect(page.getByText(`Un forum porte déjà le nom « ${E2E.forumName} ».`)).toBeVisible();
  await expect(page).toHaveURL(/\/forum\/new-forum/);
  await expect(page.locator("#name")).toHaveValue(E2E.forumName);
});

test("créer un sujet sans message affiche une notification d'erreur", async ({ page }) => {
  await loginAs(page, E2E.coachId);
  await page.goto(`/forum/new-topic?forumId=${E2E.forumId}`, { waitUntil: "networkidle" });
  await page.locator('input[name="title"]').fill("Sujet sans message");
  await page.getByRole("button", { name: "Créer le sujet" }).click();
  await expect(page.getByText("Le titre et le message du sujet sont obligatoires.")).toBeVisible();
  await expect(page).toHaveURL(/\/forum\/new-topic/);
  await expect(page.locator('input[name="title"]')).toHaveValue("Sujet sans message");
});

test("après la création d'un sujet, le membre arrive sur le nouveau sujet", async ({ page }) => {
  // Forum réservé aux modérateurs : le sujet créé ne change pas les pages vues par les visiteurs (captures des thèmes)
  const title = `Sujet créé ${Date.now()}`;
  await loginAs(page, E2E.modoId);
  await page.goto(`/forum/new-topic?forumId=${E2E.secretForumId}`, { waitUntil: "networkidle" });
  await page.locator('input[name="title"]').fill(title);
  await page.locator('textarea[name="content"]').fill("Premier message du sujet créé par le test");
  await page.getByRole("button", { name: "Créer le sujet" }).click();
  await page.waitForURL(/\/forum\/topic\//);
  await expect(page.getByText(title).first()).toBeVisible();
});

test("créer une ligue sans nom affiche une notification d'erreur", async ({ page }) => {
  await loginAs(page, E2E.coachId);
  await page.goto("/ligues/create", { waitUntil: "networkidle" });
  // Le navigateur bloquerait l'envoi (champs obligatoires) : on le laisse passer pour tester le contrôle du serveur
  await page.locator("form.ligue-form").evaluate((form) => ((form as HTMLFormElement).noValidate = true));
  await page.getByRole("button", { name: "Créer la Ligue" }).click();
  await expect(page.getByText("Le nom et l'acronyme de la ligue sont obligatoires.")).toBeVisible();
  await expect(page).toHaveURL(/\/ligues\/create/);
});

test("choisir le thème « Sombre » dans le profil enregistre l'identifiant default", async ({ page }) => {
  // Carte 062 : l'identifiant enregistré doit faire partie de la liste officielle des thèmes (lib/themes.ts).
  // Le test ne lit pas la base lui-même : la base de test n'accepte qu'une connexion, déjà tenue par le site
  // (carte 067). Il recharge la page, dont la balise <html> porte le thème lu en base par le serveur.
  await loginAs(page, E2E.coachId);
  try {
    await page.goto("/profile?tab=edit", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Sombre" }).click();
    await expect.poll(async () => {
      await page.reload({ waitUntil: "domcontentloaded" });
      return page.locator("html").getAttribute("data-theme");
    }).toBe("default");
  } finally {
    // Le coach de test est créé avec le thème par défaut de la base, « saison3 » (globalSetup.ts)
    await page.goto("/profile?tab=edit", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Saison 3" }).click();
    await expect.poll(async () => {
      await page.reload({ waitUntil: "domcontentloaded" });
      return page.locator("html").getAttribute("data-theme");
    }).toBe("saison3");
  }
});
