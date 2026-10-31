/**
 * Applications tierces (carte 127) : une application pas encore validée est refusée ; une application validée passe
 * par l'écran de consentement (droits en français, « Refuser » aussi visible qu'« Autoriser ») ; un refus ne donne
 * aucun code ; une application qui dépasse son quota est bloquée. Le serveur de test ouvre les applications tierces
 * (HUB_THIRD_PARTY_APPS=1) avec un quota de 3 demandes par heure.
 */
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { test, expect, request as playwrightRequest, type Page } from "@playwright/test";
import { HUB_API_TEST_URL } from "../../playwright.api.config";

type Client = { clientId: string; clientSecret: string };
const validated = JSON.parse(readFileSync("tests/.api-third-party.json", "utf-8")) as Client;
const pending = JSON.parse(readFileSync("tests/.api-third-party-pending.json", "utf-8")) as Client;
const REDIRECT_URI = "http://localhost:4299/tiers";

test.use({ viewport: { width: 375, height: 740 }, hasTouch: true });
// La base locale ne sert qu'une requête à la fois : finir les échanges de la page avant le test suivant
test.afterEach(async ({ page }) => page.waitForLoadState("networkidle"));

async function signUpInPage(page: Page) {
  const response = await page.request.post("/api/auth/sign-up/email", {
    headers: { origin: HUB_API_TEST_URL, "x-forwarded-for": `10.6.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}` },
    data: { email: `tiers-${randomUUID()}@e2e.test`, password: "tiers-password-123", name: `Tiers ${randomBytes(3).toString("hex")}` },
  });
  expect(response.ok(), await response.text()).toBe(true);
  // L'application tierce n'existe pas vraiment : on intercepte le retour vers elle
  await page.route("http://localhost:4299/**", (route) => route.fulfill({ body: "application tierce" }));
}

function authorizeUrl(client: Client, verifier: string) {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: client.clientId,
    redirect_uri: REDIRECT_URI,
    scope: "openid profile bbfrance:profile",
    state: randomUUID(),
    code_challenge: createHash("sha256").update(verifier).digest("base64url"),
    code_challenge_method: "S256",
  });
  return `/api/auth/oauth2/authorize?${params}`;
}

test("une application tierce pas encore validée est refusée", async ({ page }) => {
  await signUpInPage(page);
  const response = await page.request.get(authorizeUrl(pending, "v".repeat(43)), { maxRedirects: 0 });
  const location = response.headers()["location"] ?? "";
  expect(location).not.toContain("code=");
  expect(location.includes("error=") || response.status() >= 400).toBe(true);
});

test("l'écran de consentement explique les droits ; un refus ne donne aucun code", async ({ page }) => {
  await signUpInPage(page);
  await page.goto(authorizeUrl(validated, "r".repeat(43)));
  await expect(page.getByRole("heading", { name: "Autoriser Outil tiers valide ?" })).toBeVisible();
  await expect(page.getByText("voir ton profil de coach (NAF, région…)")).toBeVisible();
  await expect(page.getByText("bbfrance:profile")).toHaveCount(0);

  const refuse = await page.getByRole("button", { name: "Refuser" }).boundingBox();
  const accept = await page.getByRole("button", { name: "Autoriser" }).boundingBox();
  expect(refuse?.height ?? 0).toBeGreaterThanOrEqual(44);
  expect(Math.abs((refuse?.width ?? 0) - (accept?.width ?? 0))).toBeLessThan(2);

  // Le client Better Auth et la page lancent tous deux le retour : on attend la requête vers l'application
  const back = page.waitForRequest(/localhost:4299\/tiers/);
  await page.getByRole("button", { name: "Refuser" }).click();
  const url = (await back).url();
  expect(url).toContain("error=access_denied");
  expect(url).not.toContain("code=");
});

test("après consentement, l'application est bloquée au-delà de son quota", async ({ page }) => {
  await signUpInPage(page);
  const verifier = randomBytes(32).toString("base64url");
  await page.goto(authorizeUrl(validated, verifier));
  const back = page.waitForRequest(/localhost:4299\/tiers/);
  await page.getByRole("button", { name: "Autoriser" }).click();
  const code = new URL((await back).url()).searchParams.get("code");
  expect(code).toBeTruthy();

  const app = await playwrightRequest.newContext({ baseURL: HUB_API_TEST_URL });
  const token = await app.post("/api/auth/oauth2/token", {
    headers: { authorization: `Basic ${Buffer.from(`${validated.clientId}:${validated.clientSecret}`).toString("base64")}` },
    form: { grant_type: "authorization_code", code: code!, redirect_uri: REDIRECT_URI, code_verifier: verifier },
  });
  expect(token.ok(), await token.text()).toBe(true);
  const { access_token } = (await token.json()) as { access_token: string };

  const statuses: number[] = [];
  for (let i = 0; i < 4; i++) statuses.push((await app.get("/api/v1/profile", { headers: { authorization: `Bearer ${access_token}` } })).status());
  expect(statuses).toEqual([200, 200, 200, 429]);
});
