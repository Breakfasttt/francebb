/**
 * Connexion au site via le hub d'identité (OIDC) : membre existant rattaché sans re-onboarding,
 * reconnexion silencieuse quand la session hub existe, email non vérifié refusé, lien magique,
 * déconnexion globale et bannissement au hub (carte 037).
 */
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";

// Adresse de la base de test du hub, enregistrée par scripts/local-postgres.mjs
const HUB_E2E_DATABASE_URL: string = JSON.parse(readFileSync("../../.local-postgres.json", "utf-8"))["hub-e2e"];

const SITE = "http://localhost:3200";
const PASSWORD = "e2e-password-123";

async function startHubLogin(page: Page) {
  await page.goto(`${SITE}/auth/login`);
  await page.getByRole("button", { name: "Se connecter avec le compte BBFrance" }).click();
}

async function siteSessionName(page: Page) {
  const response = await page.request.get(`${SITE}/api/auth/session`);
  const session = (await response.json()) as { user?: { name?: string; hasFinishedOnboarding?: boolean } } | null;
  return session?.user;
}

test("un membre existant se connecte via le hub, sans re-onboarding", async ({ page }) => {
  await startHubLogin(page);
  await page.waitForURL(/localhost:4100\/sign-in/);
  await page.getByLabel("Email").fill("coach@e2e.test");
  await page.getByLabel("Mot de passe").fill(PASSWORD);
  await page.getByRole("button", { name: "Connexion mot de passe (dev)" }).click();
  await page.waitForURL((url) => url.origin === SITE && !url.pathname.startsWith("/auth"));
  const user = await siteSessionName(page);
  expect(user?.name).toBe("Coach E2E");
  expect(user?.hasFinishedOnboarding).toBe(true);

  // Session hub encore active : après déconnexion du site, la reconnexion ne redemande rien
  await page.context().clearCookies({ domain: "localhost", name: "authjs.session-token" });
  expect(await siteSessionName(page)).toBeUndefined();
  await startHubLogin(page);
  await page.waitForURL((url) => url.origin === SITE && !url.pathname.startsWith("/auth"));
  expect((await siteSessionName(page))?.name).toBe("Coach E2E");
});

test("un compte hub à l'email non vérifié est refusé par le site", async ({ page }) => {
  await startHubLogin(page);
  await page.waitForURL(/localhost:4100\/sign-in/);
  await page.getByLabel("Email").fill("unverified@e2e.test");
  await page.getByLabel("Mot de passe").fill(PASSWORD);
  await page.getByRole("button", { name: "Connexion mot de passe (dev)" }).click();
  await page.waitForURL((url) => url.origin === SITE && url.pathname.startsWith("/auth"));
  expect(await siteSessionName(page)).toBeUndefined();
});

test("le hub envoie un lien magique de connexion", async ({ page }) => {
  // Sans SMTP configuré (tests), le lien est écrit dans la console du hub : on vérifie le parcours côté membre
  await page.goto("http://localhost:4100/sign-in");
  await page.getByLabel("Email").fill("coach@e2e.test");
  await page.getByRole("button", { name: "Recevoir un lien de connexion" }).click();
  await expect(page.getByText("Lien de connexion envoyé")).toBeVisible();
});

test("la déconnexion du site ferme aussi la session du hub", async ({ page }) => {
  await startHubLogin(page);
  await page.waitForURL(/localhost:4100\/sign-in/);
  await page.getByLabel("Email").fill("coach@e2e.test");
  await page.getByLabel("Mot de passe").fill(PASSWORD);
  await page.getByRole("button", { name: "Connexion mot de passe (dev)" }).click();
  await page.waitForURL((url) => url.origin === SITE && !url.pathname.startsWith("/auth"));

  // Le jeton d'identité du hub reste côté serveur : la session lisible par le navigateur n'en contient aucun
  const sessionJson = await (await page.request.get(`${SITE}/api/auth/session`)).text();
  expect(JSON.parse(sessionJson).hubLogout).toBe(true);
  expect(sessionJson).not.toContain("hubIdToken");
  expect(sessionJson).not.toMatch(/eyJ[\w-]+\.[\w-]+\./);

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.getByRole("button", { name: "Déconnexion" }).first().click();
  await page.waitForURL((url) => url.origin === SITE && !url.pathname.startsWith("/auth"));
  expect(await siteSessionName(page)).toBeUndefined();

  // Session hub fermée : la reconnexion redemande les identifiants
  await startHubLogin(page);
  await page.waitForURL(/localhost:4100\/sign-in/);
});

test("un compte banni au hub ne peut plus se connecter au site", async ({ page }) => {
  // Ce test bannit le compte « coach » du hub de test : il doit rester le dernier du fichier
  execSync('node scripts/ban-user.mjs coach@e2e.test "Test e2e"', { env: { ...process.env, HUB_DATABASE_URL: HUB_E2E_DATABASE_URL } });
  await startHubLogin(page);
  await page.waitForURL(/localhost:4100\/sign-in/);
  await page.getByLabel("Email").fill("coach@e2e.test");
  await page.getByLabel("Mot de passe").fill(PASSWORD);
  await page.getByRole("button", { name: "Connexion mot de passe (dev)" }).click();
  await expect(page.getByText("Ce compte BBFrance a été suspendu.")).toBeVisible();
  expect(await siteSessionName(page)).toBeUndefined();
});
