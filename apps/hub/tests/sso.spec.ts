/**
 * Connexion au site via le hub d'identité (OIDC) : membre existant rattaché sans re-onboarding,
 * reconnexion silencieuse quand la session hub existe, email non vérifié refusé.
 */
import { test, expect, type Page } from "@playwright/test";

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
