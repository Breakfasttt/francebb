/**
 * Inventaire de la refonte, section 1 « Éléments présents sur toutes les pages » (docs/refonte/inventaire.md,
 * cartes 081 et 084). Rejoué en taille ordinateur (projet chromium) et en taille téléphone (projet telephone).
 * Les actions sont cherchées par leur rôle et leur nom accessible, jamais par une classe CSS : le test doit passer
 * sans modification quel que soit le design.
 * Des captures sont aussi enregistrées dans test-results/ pour la relecture humaine (pas de comparaison au pixel).
 */
import { test, expect, type Page } from "@playwright/test";
import { E2E, loginAs } from "../fixtures";

const isPhone = (page: Page) => (page.viewportSize()?.width ?? 1280) <= 1024;

/** Ouvre le panneau « Plus » sur téléphone ; ne fait rien sur ordinateur. */
async function openMore(page: Page) {
  if (!isPhone(page)) return;
  await page.getByRole("button", { name: "Plus", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Plus" })).toBeVisible();
}

test.describe("coquille : visiteur", () => {
  test("navigation, connexion, thème et pied de page", async ({ page }, testInfo) => {
    await page.goto("/forum", { waitUntil: "networkidle" });
    const nav = page.getByRole("navigation", { name: "Navigation principale" }).filter({ visible: true }).first();
    for (const label of ["Accueil", "Forum", "Tournois"]) {
      await expect(nav.getByRole("link", { name: label, exact: true })).toBeVisible();
    }
    await expect(page.getByRole("link", { name: "Connexion" }).filter({ visible: true }).first()).toHaveAttribute("href", "/auth/login");

    if (isPhone(page)) {
      await expect(nav.getByRole("link", { name: "Messages" })).toBeVisible();
      // Bouton retour et outils du forum affichés sur place, sans portail (carte 156)
      await expect(page.getByRole("main").getByRole("link", { name: "Retour" })).toBeVisible();
      await expect(page.getByRole("region", { name: "Outils du forum" }).getByRole("link", { name: "Recherche avancée" })).toBeVisible();
      await openMore(page);
      const panel = page.getByRole("dialog", { name: "Plus" });
      for (const label of ["Ligues", "Carte", "Articles", "Ressources", "BBScheme", "Quizz", "Classement", "Jouer", "Statistiques", "Médias", "Mentions légales", "GitHub"]) {
        await expect(panel.getByRole("link", { name: label })).toBeVisible();
      }
      await expect(panel.getByRole("radiogroup", { name: "Thème du site" }).getByRole("radio")).toHaveCount(8);
      // Plus de rubrique « Cette page » (carte 156) : les outils du forum sont dans la page elle-même
      await expect(panel.getByRole("region", { name: "Cette page" })).toHaveCount(0);
      await page.screenshot({ path: testInfo.outputPath("visiteur-plus.png") });
      await page.keyboard.press("Escape");
      await expect(panel).toBeHidden();
    } else {
      for (const label of ["Mentions légales", "GitHub", "Statistiques", "Médias"]) {
        await expect(page.getByRole("contentinfo").getByRole("link", { name: label })).toBeVisible();
      }
      await page.getByRole("button", { name: "Plus de rubriques" }).click();
      for (const label of ["Carte", "BBScheme", "Quizz", "Classement", "Jouer", "Statistiques", "Médias"]) {
        await expect(page.getByRole("menuitem", { name: label })).toBeVisible();
      }
      await page.keyboard.press("Escape");
      await page.getByRole("button", { name: "Changer de thème" }).click();
      await expect(page.getByRole("dialog", { name: "Thème du site" }).getByRole("radio")).toHaveCount(8);
      await page.keyboard.press("Escape");
    }
    await page.screenshot({ path: testInfo.outputPath("visiteur-forum.png"), fullPage: false });
  });

  test("le choix du thème s'applique tout de suite", async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
    if (isPhone(page)) await openMore(page);
    else await page.getByRole("button", { name: "Changer de thème" }).click();
    await page.getByRole("radio", { name: "NAF" }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "naf");
  });
});

test.describe("coquille : membre modérateur", () => {
  test("pastilles, messagerie, modération, profil et déconnexion", async ({ page }, testInfo) => {
    await loginAs(page, E2E.modoId);
    await page.goto("/forum", { waitUntil: "networkidle" });

    if (isPhone(page)) {
      const nav = page.getByRole("navigation", { name: "Navigation principale" }).filter({ visible: true }).first();
      await expect(nav.getByRole("link", { name: /Messages/ })).toHaveAttribute("href", "/messagerie");
      await openMore(page);
      const panel = page.getByRole("dialog", { name: "Plus" });
      await expect(panel.getByRole("link", { name: /Voir mon profil/ })).toHaveAttribute("href", "/profile");
      await expect(panel.getByRole("link", { name: /Modération/ })).toHaveAttribute("href", "/moderation");
      await expect(panel.getByRole("button", { name: "Déconnexion" })).toBeVisible();
      await page.screenshot({ path: testInfo.outputPath("modo-plus.png") });
    } else {
      await expect(page.getByRole("link", { name: /^Messagerie/ })).toHaveAttribute("href", "/messagerie");
      await expect(page.getByRole("link", { name: /^Modération/ })).toHaveAttribute("href", "/moderation");
      await page.getByRole("button", { name: "Menu du compte" }).click();
      for (const label of ["Mon profil", "Réglages du compte", "Changer de thème", "Déconnexion"]) {
        await expect(page.getByRole("menuitem", { name: label })).toBeVisible();
      }
      await page.screenshot({ path: testInfo.outputPath("modo-compte.png") });
      await page.keyboard.press("Escape");
    }
  });

  test("la barre basse s'efface pendant la saisie (téléphone)", async ({ page }) => {
    test.skip(!isPhone(page), "Barre basse : téléphone seulement");
    await loginAs(page, E2E.coachId);
    await page.goto(`/forum/topic/${E2E.topicId}?page=1`, { waitUntil: "networkidle" });
    const bottomNav = page.getByRole("navigation", { name: "Navigation principale" }).filter({ visible: true }).first();
    await expect(bottomNav).toBeInViewport();
    await page.locator("textarea").first().focus();
    await expect(page.locator("html")).toHaveAttribute("data-typing", "true");
    await expect(bottomNav).not.toBeInViewport({ ratio: 0.5 });
  });
});
