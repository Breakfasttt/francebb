/**
 * Tests des cartes de correction écrites après la refonte (épic E08), pour les défauts qui ne relèvent pas d'un test
 * d'inventaire existant :
 * - carte 147 : le thème d'un visiteur est posé par le serveur, grâce au cookie `bbfrance_theme`, dès la réponse.
 * Les tests de l'éditeur BBScheme (cartes 146 et 148) ont quitté ce fichier avec l'éditeur (carte 179) :
 * apps/bbscheme/editeur-en-attente/tests/divers-bbscheme.spec.ts.
 *
 * Ce fichier n'est pas rejoué par le projet « telephone » de playwright.config.ts.
 * Les éléments sont cherchés par leur rôle et leur nom accessible. Aucune donnée n'est écrite dans la base.
 */
import { test, expect, type Page } from "@playwright/test";
import { themedModoId, loginAs } from "../fixtures";

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
