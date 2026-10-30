/**
 * Connexion au site via le hub d'identité (OIDC) : membre existant rattaché sans re-onboarding,
 * reconnexion silencieuse quand la session hub existe, email non vérifié refusé, lien magique,
 * déconnexion globale et bannissement au hub (carte 037), hub invisible derrière les boutons du site (carte 073).
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import { test, expect, type Page } from "@playwright/test";

// Adresse de la base de test du hub, enregistrée par scripts/local-postgres.mjs
const HUB_E2E_DATABASE_URL: string = JSON.parse(readFileSync("../../.local-postgres.json", "utf-8"))["hub-e2e"];

const SITE = "http://localhost:3200";
const HUB = "http://localhost:4100";
const PASSWORD = "e2e-password-123";
// Fichier où le hub de test écrit le dernier lien de connexion par email (HUB_DEV_MAIL_FILE, playwright.config.ts)
const MAIL_FILE = "tests/.last-magic-link.json";

/**
 * Lance la connexion par le hub sans moyen choisi : le hub affiche alors son formulaire normal, où les tests
 * utilisent la connexion par mot de passe réservée au développement. L'écran du site n'a plus de bouton pour
 * cela (carte 073) : on envoie la même demande que lui à Auth.js, avec son jeton anti-falsification.
 */
async function startHubLogin(page: Page) {
  await page.goto(`${SITE}/auth/login`);
  const { csrfToken } = (await (await page.request.get(`${SITE}/api/auth/csrf`)).json()) as { csrfToken: string };
  await page.evaluate(
    ({ csrfToken, callbackUrl }) => {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = "/api/auth/signin/hub";
      for (const [name, value] of Object.entries({ csrfToken, callbackUrl })) {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = value;
        form.appendChild(input);
      }
      document.body.appendChild(form);
      form.submit();
    },
    { csrfToken, callbackUrl: `${SITE}/` },
  );
}

/**
 * Surveille les pages du hub dans tous les onglets du test : renvoie une fonction qui dit si un bouton du hub a
 * été affiché, même un instant. Sert à vérifier que le hub reste invisible quand le membre choisit son moyen de
 * connexion sur le site.
 */
async function watchHubButtons(page: Page) {
  let seen = false;
  await page.context().exposeFunction("reportHubButton", () => {
    seen = true;
  });
  await page.context().addInitScript((hubOrigin) => {
    if (window.location.origin !== hubOrigin) return;
    const check = () => {
      if (document.querySelector(".hub-button")) (window as unknown as { reportHubButton: () => void }).reportHubButton();
    };
    new MutationObserver(check).observe(document, { childList: true, subtree: true });
    document.addEventListener("DOMContentLoaded", check);
  }, HUB);
  return () => seen;
}

async function readMagicLink(email: string) {
  await expect.poll(() => existsSync(MAIL_FILE) && JSON.parse(readFileSync(MAIL_FILE, "utf-8")).email === email).toBe(true);
  return (JSON.parse(readFileSync(MAIL_FILE, "utf-8")) as { url: string }).url;
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

test("connexion par email depuis le bouton du site, sans aucun écran du hub", async ({ page }) => {
  rmSync(MAIL_FILE, { force: true });
  const hubButtonSeen = await watchHubButtons(page);
  await page.goto(`${SITE}/auth/login`);
  // Mêmes boutons qu'hors mode hub, et plus de bouton « compte BBFrance »
  await expect(page.getByRole("button", { name: "Se connecter avec Discord" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Se connecter avec Google" })).toBeVisible();
  await expect(page.getByRole("button", { name: /compte BBFrance/i })).toHaveCount(0);

  await page.getByPlaceholder("nom@exemple.fr").fill("coach@e2e.test");
  await page.getByRole("button", { name: "Recevoir un lien magique" }).click();
  await page.waitForURL((url) => url.origin === HUB);
  await expect(page.getByText("Vérifie ta boîte mail")).toBeVisible();

  // Le membre ouvre le lien reçu : il revient connecté sur le site, à la fin du flux OIDC
  await page.goto(await readMagicLink("coach@e2e.test"));
  await page.waitForURL((url) => url.origin === SITE && !url.pathname.startsWith("/auth"));
  expect((await siteSessionName(page))?.name).toBe("Coach E2E");
  expect(hubButtonSeen()).toBe(false);
});

test("Discord et Google : le bouton du site mène directement chez le fournisseur, via le hub", async ({ page }) => {
  const hubButtonSeen = await watchHubButtons(page);
  for (const [label, host, provider] of [
    ["Se connecter avec Discord", "discord.com", "discord"],
    ["Se connecter avec Google", "accounts.google.com", "google"],
  ]) {
    // Un onglet par fournisseur. La page du fournisseur n'est pas chargée : seule l'adresse de la demande est vérifiée
    const tab = await page.context().newPage();
    await tab.route(`https://${host}/**`, (route) => route.abort());
    const providerRequest = tab.waitForRequest((request) => new URL(request.url()).hostname === host);
    await tab.goto(`${SITE}/auth/login`);
    await tab.getByRole("button", { name: label }).click();
    const url = new URL((await providerRequest).url());
    // Le fournisseur renverra le membre au hub (et non au site), qui le renverra ensuite au site
    expect(url.searchParams.get("redirect_uri")).toBe(`${HUB}/api/auth/callback/${provider}`);
  }
  expect(hubButtonSeen()).toBe(false);
});

test("le hub envoie un lien magique de connexion depuis son propre formulaire", async ({ page }) => {
  // Sans SMTP configuré (tests), le lien est écrit dans la console du hub : on vérifie le parcours côté membre
  const hubButtonSeen = await watchHubButtons(page);
  await page.goto("http://localhost:4100/sign-in");
  await page.getByLabel("Email").fill("coach@e2e.test");
  await page.getByRole("button", { name: "Recevoir un lien de connexion" }).click();
  await expect(page.getByText("Lien de connexion envoyé")).toBeVisible();
  // Contre-épreuve de la surveillance utilisée plus haut : ici, les boutons du hub sont bien détectés
  expect(hubButtonSeen()).toBe(true);
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
