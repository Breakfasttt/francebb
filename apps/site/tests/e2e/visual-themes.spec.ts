/**
 * Non-régression visuelle P4 (épic E05) : pages clés et modale de signalement dans les 7 thèmes.
 * Captures de référence prises avant la migration vers packages/ui, comparées au pixel après chaque carte.
 * Captures Windows : comparaison locale uniquement (rendu des polices différent sous Linux en CI).
 */
import { test, expect, type Page } from "@playwright/test";
import { E2E, E2E_THEMES, loginAs, themedBannedId, themedModoId } from "./fixtures";

const REPORT_BUTTON = "button:has(svg.lucide-triangle-alert)";
const THEMES = E2E_THEMES;

async function useTheme(page: Page, theme: string) {
  // Pour un visiteur, ThemeProvider relit le thème depuis localStorage au montage
  await page.addInitScript((value) => {
    localStorage.setItem("theme", value);
    // Le bandeau cookies apparaît après 1,5 s et faussait les captures selon le timing
    localStorage.setItem("bbfrance_cookie_consent", "accepted");
  }, theme);
  await page.setViewportSize({ width: 1280, height: 900 });
}

test.describe("rendu des thèmes", () => {
  test.skip(!!process.env.CI, "captures de référence locales (Windows)");

  for (const theme of THEMES) {
    test(`accueil et forum, thème ${theme}`, async ({ page }) => {
      await useTheme(page, theme);
      for (const [name, path] of [["accueil", "/"], ["forum", "/forum"]]) {
        await page.goto(path, { waitUntil: "networkidle" });
        await expect(page).toHaveScreenshot(`${name}-${theme}.png`, { animations: "disabled", maxDiffPixelRatio: 0.001 });
      }
    });

    test(`modale de signalement, thème ${theme}`, async ({ page }) => {
      await useTheme(page, theme);
      // Membre connecté : c'est le thème de son profil qui s'affiche (carte 051), d'où un modérateur par thème
      await loginAs(page, themedModoId(theme));
      await page.goto(`/forum/topic/${E2E.topicId}`, { waitUntil: "networkidle" });
      await page.locator(REPORT_BUTTON).first().click();
      const modal = page.locator(".report-modal");
      await expect(modal).toBeVisible();
      // La modale est translucide : attendre que la page derrière (images, polices) soit stable
      await page.waitForLoadState("networkidle");
      await page.evaluate(() => document.fonts.ready);
      // Neutralise le focus automatique (anneau de focus) pour comparer uniquement le rendu
      await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());
      await page.mouse.move(0, 0);
      await expect(modal).toHaveScreenshot(`signalement-${theme}.png`, { animations: "disabled", maxDiffPixelRatio: 0.001 });
    });

    test(`page des bannis sur téléphone, thème ${theme}`, async ({ page }) => {
      // Carte 058 : la page des bannis n'utilise que des variables de thème. Membre connecté : le thème de son
      // profil s'affiche, d'où un membre banni par thème, préparé une fois pour toutes par globalSetup (carte 067)
      await useTheme(page, theme);
      await page.setViewportSize({ width: 390, height: 844 });
      await loginAs(page, themedBannedId(theme));
      await page.goto("/banned", { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator(".banned-card")).toHaveScreenshot(`banni-telephone-${theme}.png`, { animations: "disabled", maxDiffPixelRatio: 0.001 });
    });
  }
});

test("le signalement sans raison affiche une notification d'erreur", async ({ page }) => {
  await loginAs(page, E2E.modoId);
  await page.goto(`/forum/topic/${E2E.topicId}`, { waitUntil: "networkidle" });
  await page.locator(REPORT_BUTTON).first().click();
  await page.getByRole("button", { name: "Envoyer le signalement" }).click();
  await expect(page.getByText("Veuillez choisir une raison")).toBeVisible();
});

test("la modale de signalement est un dialog accessible, fermé par Échap", async ({ page }) => {
  await loginAs(page, E2E.modoId);
  await page.goto(`/forum/topic/${E2E.topicId}`, { waitUntil: "networkidle" });
  await page.locator(REPORT_BUTTON).first().click();
  const dialog = page.getByRole("dialog", { name: "Signaler un contenu" });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});
