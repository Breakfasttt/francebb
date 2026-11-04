/**
 * Tests de l'éditeur BBScheme retirés de apps/site/tests/e2e/bugs/divers.spec.ts par la carte 179, copiés à l'identique :
 * - carte 146 : la bulle d'infos d'un pion de BBScheme reste entière dans l'écran, même près de la réserve de gauche ;
 * - carte 148 : le bouton retour de BBScheme fait au moins 44 pixels.
 * À rebrancher avec l'éditeur (voir ../README.md).
 */
import { test, expect, devices, type Locator, type Page } from "@playwright/test";

// Réglages du téléphone sans `defaultBrowserType`, qui ne peut pas être changé dans un groupe de tests
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { defaultBrowserType, ...PHONE } = devices["Pixel 7"];

/** Bandeau des cookies masqué : sur téléphone, il couvre le bas de l'écran et intercepterait les appuis. */
async function hideCookieBanner(page: Page) {
  await page.addInitScript(() => localStorage.setItem("bbfrance_cookie_consent", "accepted"));
}

/** Ouvre l'éditeur BBScheme et attend que le terrain soit affiché. */
async function openEditor(page: Page) {
  await hideCookieBanner(page);
  await page.goto("/bbscheme");
  // En développement, la pastille de Next.js (en bas à gauche) peut couvrir un bouton de la barre du bas
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
  await expect(page.getByRole("region", { name: "Terrain" })).toBeVisible({ timeout: 30_000 });
}

/** Affiche la réserve bleue (colonne de gauche sur ordinateur, panneau du bas sur téléphone) et y charge les Humains. */
async function blueReserveWithHumans(page: Page) {
  const reserve = page.getByRole("region", { name: "Réserve de l'équipe bleue" });
  if (!(await reserve.isVisible())) {
    await page.getByRole("button", { name: /^Réserve bleue/i }).filter({ visible: true }).first().click();
  }
  await expect(reserve).toBeVisible();
  await reserve.getByRole("combobox", { name: "Roster de l'équipe bleue" }).selectOption("humans");
  await expect(page.getByText(/chargé pour l'équipe bleue/).first()).toBeVisible();
  return reserve;
}

/** Survole un pion et vérifie que sa bulle d'infos est entière dans la partie visible de l'écran. */
async function expectTooltipInside(page: Page, token: Locator) {
  await token.hover();
  const tooltip = page.getByRole("tooltip");
  await expect(tooltip).toBeVisible();
  const box = await tooltip.boundingBox();
  const viewport = page.viewportSize();
  expect(box, "la bulle d'infos a une position").not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width);
  expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height);
}

for (const size of ["ordinateur", "téléphone"] as const) {
  test.describe(`BBScheme en taille ${size}`, () => {
    if (size === "téléphone") test.use(PHONE);

    test("carte 146 : la bulle d'infos d'un pion de la réserve de gauche reste entière dans l'écran", async ({ page }) => {
      await openEditor(page);
      const reserve = await blueReserveWithHumans(page);
      const tokens = reserve.getByRole("listitem");
      // Le premier pion de la réserve (le plus près du bord) et un pion plus bas dans la liste
      await expectTooltipInside(page, tokens.first());
      await page.mouse.move(0, 0);
      await expectTooltipInside(page, tokens.nth(3));
    });

    test("carte 148 : le bouton retour de BBScheme fait au moins 44 pixels", async ({ page }) => {
      await openEditor(page);
      const back = page.getByRole("link", { name: "Retour à l'accueil" }).filter({ visible: true }).first();
      await expect(back).toBeVisible();
      const box = await back.boundingBox();
      expect(box!.width).toBeGreaterThanOrEqual(44);
      expect(box!.height).toBeGreaterThanOrEqual(44);
    });
  });
}
