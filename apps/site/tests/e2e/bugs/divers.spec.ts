/**
 * Tests des cartes de correction écrites après la refonte (épic E08), pour les défauts qui ne relèvent pas d'un test
 * d'inventaire existant :
 * - carte 147 : le thème d'un visiteur est posé par le serveur, grâce au cookie `bbfrance_theme`, dès la réponse ;
 * - carte 146 : la bulle d'infos d'un pion de BBScheme reste entière dans l'écran, même près de la réserve de gauche ;
 * - carte 148 : le bouton retour de BBScheme fait au moins 44 pixels.
 *
 * Ce fichier n'est pas rejoué par le projet « telephone » de playwright.config.ts : les vérifications en taille
 * téléphone sont faites ici, dans un groupe qui prend les réglages du Pixel 7 (`test.use`).
 * Les éléments sont cherchés par leur rôle et leur nom accessible. Aucune donnée n'est écrite dans la base.
 */
import { test, expect, devices, type Locator, type Page } from "@playwright/test";
import { themedModoId, loginAs } from "../fixtures";

// Réglages du téléphone sans `defaultBrowserType`, qui ne peut pas être changé dans un groupe de tests
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { defaultBrowserType, ...PHONE } = devices["Pixel 7"];

/** Bandeau des cookies masqué : sur téléphone, il couvre le bas de l'écran et intercepterait les appuis. */
async function hideCookieBanner(page: Page) {
  await page.addInitScript(() => localStorage.setItem("bbfrance_cookie_consent", "accepted"));
}

/** Valeur de l'attribut `data-theme` de la balise <html> dans le HTML envoyé par le serveur (avant tout script). */
async function serverTheme(page: Page, path = "/") {
  const response = await page.request.get(path);
  const html = await response.text();
  return html.match(/<html[^>]*\sdata-theme="([^"]+)"/)?.[1] ?? null;
}

test.describe("carte 147 : thème d'un visiteur posé par le serveur", () => {
  test("le cookie du thème est lu par le serveur : la page arrive directement dans ce thème", async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: "bbfrance_theme", value: "blood", url: baseURL! }]);
    expect(await serverTheme(page)).toBe("blood");
    expect(await serverTheme(page, "/forum")).toBe("blood");

    // Dans le navigateur, le thème reste celui du serveur une fois la page chargée
    await hideCookieBanner(page);
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "blood");
  });

  test("un cookie qui ne nomme pas un thème du site est ignoré (thème par défaut)", async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: "bbfrance_theme", value: "inconnu", url: baseURL! }]);
    expect(await serverTheme(page)).toBe("vestiaire");
  });

  test("un thème gardé dans le navigateur est recopié dans le cookie, puis servi par le serveur", async ({ page, context }) => {
    // Visiteur qui avait choisi un thème avant la carte 147 : il n'est gardé que dans le localStorage
    await page.addInitScript(() => {
      localStorage.setItem("bbfrance_cookie_consent", "accepted");
      localStorage.setItem("theme", "naf");
    });
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page.locator("html")).toHaveAttribute("data-theme", "naf");
    await expect.poll(async () => (await context.cookies()).find((cookie) => cookie.name === "bbfrance_theme")?.value).toBe("naf");

    // Page suivante : le serveur envoie directement le bon thème
    expect(await serverTheme(page, "/forum")).toBe("naf");
  });

  test("un membre connecté garde le thème de son profil, quel que soit le cookie", async ({ page, context, baseURL }) => {
    await context.addCookies([{ name: "bbfrance_theme", value: "blood", url: baseURL! }]);
    await loginAs(page, themedModoId("light"));
    expect(await serverTheme(page)).toBe("light");
  });
});

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
