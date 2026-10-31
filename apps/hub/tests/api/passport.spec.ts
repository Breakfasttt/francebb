/**
 * Pages du passeport (carte 120), en taille téléphone : une colonne sans défilement horizontal, boutons et champs
 * d'au moins 44 pixels, modification du profil, retour seulement vers une adresse enregistrée, retrait d'un accès.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { randomBytes, randomUUID } from "node:crypto";
import { test, expect, type Page } from "@playwright/test";
import { HUB_API_TEST_URL } from "../../playwright.api.config";
import { client, getTokens } from "./helpers";

test.use({ viewport: { width: 375, height: 740 }, hasTouch: true });

/** Crée un compte et connecte le navigateur de la page (les cookies de page.request sont ceux de la page). */
async function signUpInPage(page: Page) {
  const name = `Passeport ${randomBytes(3).toString("hex")}`;
  const response = await page.request.post("/api/auth/sign-up/email", {
    headers: { origin: HUB_API_TEST_URL, "x-forwarded-for": `10.8.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}` },
    data: { email: `passeport-${randomUUID()}@e2e.test`, password: "passeport-password-123", name },
  });
  expect(response.ok(), await response.text()).toBe(true);
  return name;
}

test("le passeport tient sur un téléphone, sans défilement horizontal, avec des cibles de 44 pixels", async ({ page }) => {
  await signUpInPage(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Mon passeport Blood Bowl" })).toBeVisible();
  await expect(page.getByText("Cet appareil")).toBeVisible();

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  for (const target of await page.locator("main button, main input, main select, main a").all()) {
    const box = await target.boundingBox();
    expect(box?.height ?? 0, await target.evaluate((node) => node.outerHTML.slice(0, 80))).toBeGreaterThanOrEqual(44);
  }
});

test("le coach modifie son profil depuis le passeport", async ({ page }) => {
  await signUpInPage(page);
  await page.goto("/");
  await page.getByLabel("Région").fill("Pays de la Loire");
  await page.getByLabel("Numéro NAF").fill("42");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  await expect(page.getByRole("status")).toContainText("Profil enregistré");

  await page.getByLabel("Numéro NAF").fill("abc");
  await page.getByRole("button", { name: "Enregistrer" }).click();
  // Next.js ajoute à chaque page une zone « alert » invisible : on cible le message du formulaire
  await expect(page.locator("form .hub-error")).toContainText("chiffres");

  const profile = (await (await page.request.get("/api/v1/profile")).json()) as Record<string, unknown>;
  expect(profile).toMatchObject({ region: "Pays de la Loire", naf: "42" });
});

test("le bouton de retour n'apparaît que pour une adresse enregistrée de l'application", async ({ page }) => {
  await signUpInPage(page);
  await page.goto(`/?client_id=${client.clientId}&return_to=${encodeURIComponent("http://localhost:4299/accueil")}`);
  await expect(page.getByRole("link", { name: "Retour vers Application de test API" })).toHaveAttribute("href", "http://localhost:4299/accueil");

  await page.goto(`/?client_id=${client.clientId}&return_to=${encodeURIComponent("https://piege.example/")}`);
  await expect(page.getByRole("heading", { name: "Mon passeport Blood Bowl" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Retour vers/ })).toHaveCount(0);
});

test("le coach retire l'accès d'une application", async ({ page }) => {
  await signUpInPage(page);
  await getTokens(page.request, "openid profile bbfrance:profile");
  await page.goto("/");
  const section = page.locator("section", { has: page.getByRole("heading", { name: "Applications liées" }) });
  await expect(section.getByText("Application de test API")).toBeVisible();

  page.once("dialog", (dialog) => dialog.accept());
  await section.getByRole("button", { name: "Retirer l'accès" }).click();
  await expect(section.getByText("Aucune application")).toBeVisible();
  await page.reload();
  await expect(section.getByText("Application de test API")).toHaveCount(0);
});

test("le hub n'importe aucun code du site", () => {
  const files = (dir: string): string[] =>
    readdirSync(dir).flatMap((name) => {
      const full = join(dir, name);
      if (["node_modules", ".next", "generated-client", "tests"].includes(name)) return [];
      return statSync(full).isDirectory() ? files(full) : /\.(ts|tsx|mjs|css)$/.test(name) ? [full] : [];
    });
  const offenders = [...files("app"), ...files("lib")].filter((file) => /from ["'][^"']*(apps\/site|\.\.\/\.\.\/site|@bbfrance\/site)/.test(readFileSync(file, "utf-8")));
  expect(offenders).toEqual([]);
});
