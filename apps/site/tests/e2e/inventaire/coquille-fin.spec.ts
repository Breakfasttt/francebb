/**
 * Inventaire de la refonte, section 1 « Éléments présents sur toutes les pages » (docs/refonte/inventaire.md) : les
 * lignes que coquille.spec.ts ne vérifiait pas encore, ajoutées par la carte 101 (fin de la refonte). Logo, icône
 * Administration, bouton retour du téléphone, notifications au-dessus de la barre basse, thème
 * sans éclair, redirections des bannis et de l'onboarding, widgets de développement, page des mentions légales,
 * barre de progression de la navigation (carte 188).
 * Rejoué en taille ordinateur (projet chromium) et en taille téléphone (projet telephone).
 * Les actions sont cherchées par leur rôle et leur nom accessible, jamais par une classe CSS.
 */
import { test, expect, type Page } from "@playwright/test";
import { E2E, loginAs, themedModoId, withTestDb } from "../fixtures";

const isPhone = (page: Page) => (page.viewportSize()?.width ?? 1280) <= 1024;

const ADMIN = { id: "e2e_cqf_admin", name: "Admin Coquille Inv" };
const NEWBIE = { id: "e2e_cqf_newbie", name: "Nouveau Coquille Inv" };

/** Le bandeau des cookies est masqué d'avance dans les tests qui ne le concernent pas. */
async function acceptCookies(page: Page) {
  await page.addInitScript(() => localStorage.setItem("bbfrance_cookie_consent", "accepted"));
}

/** Haut de la barre de navigation basse du téléphone (en pixels depuis le haut de l'écran). */
async function bottomNavTop(page: Page) {
  const nav = page.getByRole("navigation", { name: "Navigation principale" }).filter({ visible: true }).last();
  const box = await nav.boundingBox();
  return box ? box.y : Infinity;
}

test.beforeAll(async () => {
  await withTestDb(async (prisma) => {
    // User.role est une clé étrangère vers RoleConfig : le rôle d'administration doit exister
    await prisma.roleConfig.upsert({ where: { name: "ADMIN" }, update: {}, create: { name: "ADMIN", label: "Administrateur", power: 90, isBaseRole: true } });
    await prisma.user.upsert({
      where: { id: ADMIN.id },
      update: { role: "ADMIN", hasFinishedOnboarding: true },
      create: { id: ADMIN.id, name: ADMIN.name, email: "cqf-admin@e2e.test", role: "ADMIN", hasFinishedOnboarding: true },
    });
    await prisma.user.upsert({
      where: { id: NEWBIE.id },
      update: { hasFinishedOnboarding: false },
      create: { id: NEWBIE.id, name: NEWBIE.name, email: "cqf-newbie@e2e.test", hasFinishedOnboarding: false },
    });
  });
});

test("[tous] le nom du site ramène à l'accueil, sans image de logo", async ({ page }) => {
  await acceptCookies(page);
  await page.goto("/forum", { waitUntil: "networkidle" });
  const logo = page.getByRole("banner").getByRole("link", { name: "BBFrance, accueil" }).filter({ visible: true });
  await expect(logo).toHaveCount(1);
  await expect(logo).toHaveAttribute("href", "/");
  // Zone de toucher d'au moins 44 pixels de haut
  expect((await logo.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await logo.click();
  await page.waitForURL((url) => url.pathname === "/");
  // Le nom reste affiché sur l'accueil ; aucune image d'écusson dans la barre ni dans la page (DESIGN.md)
  await expect(page.getByRole("banner").getByRole("link", { name: "BBFrance, accueil" }).filter({ visible: true })).toHaveCount(1);
  await expect(page.getByRole("banner").getByRole("img")).toHaveCount(0);
  await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toBeVisible();
});

test("[admin] une icône Administration mène à /administration", async ({ page }) => {
  await acceptCookies(page);
  await loginAs(page, ADMIN.id);
  await page.goto("/forum", { waitUntil: "networkidle" });
  if (isPhone(page)) {
    await page.getByRole("button", { name: "Plus", exact: true }).click();
    const panel = page.getByRole("dialog", { name: "Plus" });
    await expect(panel.getByRole("link", { name: /Administration/ })).toHaveAttribute("href", "/administration");
  } else {
    await expect(page.getByRole("banner").getByRole("link", { name: "Administration" })).toHaveAttribute("href", "/administration");
  }
});

// Depuis la carte 156, le bouton retour reste dans l'en-tête de la page, à toutes les tailles (plus de portail React
// vers la barre du haut)
test("[tous] le bouton retour est dans l'en-tête de la page, 44 pixels sur téléphone", async ({ page }) => {
  await acceptCookies(page);
  await page.goto(`/forum/topic/${E2E.topicId}`, { waitUntil: "networkidle" });
  const back = page.getByRole("button", { name: "Retour au forum" }).filter({ visible: true });
  // Le bouton retour n'existe que sur téléphone : sur ordinateur, la navigation et le fil d'Ariane suffisent (skill ui)
  await expect(back).toHaveCount(isPhone(page) ? 1 : 0);
  if (isPhone(page)) {
    await expect(page.getByRole("main").getByRole("button", { name: "Retour au forum" })).toBeVisible();
    await expect(page.getByRole("banner").getByRole("button", { name: "Retour au forum" })).toHaveCount(0);
    expect((await back.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  }
});

test("[tous] une notification s'affiche sans être cachée par la navigation", async ({ page, context }) => {
  await acceptCookies(page);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(`/forum/topic/${E2E.topicId}`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Plus d'actions sur ce message" }).filter({ visible: true }).first().click();
  await page.getByRole("menuitem", { name: "Partager ce message" }).or(page.getByRole("button", { name: "Partager ce message" })).filter({ visible: true }).first().click();
  const toast = page.getByText("Lien copié !").filter({ visible: true }).first();
  await expect(toast).toBeVisible();
  if (isPhone(page)) {
    // La notification monte depuis le bas de l'écran : on attend la fin de son animation
    const navTop = await bottomNavTop(page);
    await expect.poll(async () => {
      const box = await toast.boundingBox();
      return box ? box.y + box.height : Infinity;
    }).toBeLessThanOrEqual(navTop);
  }
});

test("[membre] le thème du profil est appliqué dès le premier affichage ; [visiteur] celui du navigateur est repris", async ({ page }) => {
  // Membre : le thème de son profil est déjà dans la page envoyée par le serveur (pas d'éclair d'une autre couleur)
  await loginAs(page, themedModoId("saison3"));
  const html = await (await page.request.get("/forum")).text();
  expect(html).toMatch(/<html[^>]*data-theme="saison3"/);

  // Visiteur : le thème gardé par le navigateur est repris. Il n'est posé qu'une fois la page chargée par le
  // navigateur (ThemeProvider), d'où un court éclair du thème par défaut : défaut signalé par la carte 101.
  await page.context().clearCookies();
  await page.addInitScript(() => localStorage.setItem("theme", "naf"));
  await page.goto("/forum", { waitUntil: "networkidle" });
  await expect.poll(() => page.evaluate(() => document.documentElement.dataset.theme)).toBe("naf");
});

test("[membre banni] est envoyé vers /banned ; [membre] sans profil terminé, vers l'onboarding", async ({ page }) => {
  await acceptCookies(page);
  await loginAs(page, E2E.bannedId);
  await page.goto("/forum");
  await page.waitForURL(/\/banned/);

  await page.context().clearCookies();
  await loginAs(page, NEWBIE.id);
  await page.goto("/forum");
  await page.waitForURL(/\/auth\/onboarding/);
});

// Depuis la carte 204, le sélecteur de comptes de test est un bouton de la barre haute (plus de bouton flottant) et le
// sélecteur de thème de développement n'existe plus : le thème se choisit comme sur le site en ligne
test("[tous, en développement] le bouton des comptes de test est dans la barre haute et ouvre sa fenêtre", async ({ page }) => {
  await acceptCookies(page);
  await page.goto("/forum", { waitUntil: "networkidle" });
  await expect(page.getByRole("button", { name: /Dev Theme/ })).toHaveCount(0);
  const widget = page.getByRole("banner").getByRole("button", { name: "Dev Auth" }).filter({ visible: true });
  await expect(widget).toBeVisible();
  expect((await widget.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await widget.click();
  await expect(page.getByRole("dialog", { name: "Comptes de test" })).toBeVisible();
});

test("[tous] /mentions-legales : titre, dix sections, lisible sans défilement de côté", async ({ page }) => {
  await acceptCookies(page);
  await page.goto("/mentions-legales", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { level: 1, name: "Mentions légales" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2 })).toHaveCount(10);
  await expect(page.getByRole("link", { name: "cnil.fr/plaintes" })).toHaveAttribute("href", "https://www.cnil.fr/fr/plaintes");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  // Texte des sections en 16 pixels au moins (lisible sans zoom)
  const size = await page.getByText(/BBFrance est un site communautaire/).evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(size).toBeGreaterThanOrEqual(16);
});

test("[tous] la barre de progression est invisible au repos et s'affiche pendant une navigation lente", async ({ page }) => {
  await acceptCookies(page);
  await page.goto("/mentions-legales", { waitUntil: "networkidle" });
  const bar = page.getByTestId("navigation-progress");
  const opacity = () => bar.evaluate((element) => getComputedStyle(element).opacity);
  // Au repos, la barre est présente dans la page mais complètement transparente
  expect(await opacity()).toBe("0");

  // Réseau lent simulé : la réponse du serveur pour la page du forum (requête « RSC », reconnaissable à son en-tête
  // « rsc: 1 ») est retenue deux secondes, assez pour que la barre apparaisse après son délai de 150 millisecondes
  await page.route(
    (url) => url.pathname === "/forum",
    async (route) => {
      if (route.request().headers()["rsc"] === "1") await new Promise((resolve) => setTimeout(resolve, 2_000));
      await route.continue();
    },
  );
  await page.locator('a[href="/forum"]').filter({ visible: true }).first().click();
  await expect.poll(opacity, { timeout: 2_000 }).toBe("1");

  // Arrivée sur le forum : la barre se remplit puis s'efface
  await page.waitForURL((url) => url.pathname === "/forum");
  await expect.poll(opacity, { timeout: 5_000 }).toBe("0");
});
