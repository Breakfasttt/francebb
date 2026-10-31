/**
 * Profil du coach (carte 119) : pseudo unique sans tenir compte des majuscules, lecture du profil dans le jeton et
 * par userinfo avec la portée bbfrance:profile, modification par PATCH /api/v1/profile avec bbfrance:profile:write.
 * Les jetons sont obtenus par le vrai parcours OIDC (autorisation avec PKCE, puis échange du code).
 */
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { test, expect, request as playwrightRequest, type APIRequestContext } from "@playwright/test";
import { HUB_API_TEST_URL } from "../../playwright.api.config";

const client = JSON.parse(readFileSync("tests/.api-client.json", "utf-8")) as { clientId: string; clientSecret: string };
const REDIRECT_URI = "http://localhost:4299/callback";

/**
 * Crée un compte (inscription par mot de passe, réservée aux tests) et renvoie un contexte qui porte sa session,
 * comme le navigateur du coach sur les pages du hub : il envoie l'en-tête Origin, sans lequel Better Auth refuse
 * toute demande accompagnée d'un cookie (protection contre les requêtes forgées).
 */
async function newCoach(name: string) {
  const context = await playwrightRequest.newContext({ baseURL: HUB_API_TEST_URL, extraHTTPHeaders: { origin: HUB_API_TEST_URL } });
  const ip = `10.9.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
  const response = await context.post("/api/auth/sign-up/email", {
    headers: { "x-forwarded-for": ip },
    data: { email: `profil-${randomUUID()}@e2e.test`, password: "profil-password-123", name },
  });
  expect(response.ok(), await response.text()).toBe(true);
  const { user } = (await response.json()) as { user: { id: string; name: string } };
  return { context, user };
}

/** Parcours OIDC complet pour le coach connecté dans `context` : renvoie le jeton d'accès et l'id_token. */
async function getTokens(context: APIRequestContext, scope: string) {
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const authorize = await context.get("/api/auth/oauth2/authorize", {
    maxRedirects: 0,
    params: {
      response_type: "code",
      client_id: client.clientId,
      redirect_uri: REDIRECT_URI,
      scope,
      state: randomUUID(),
      code_challenge: challenge,
      code_challenge_method: "S256",
    },
  });
  const location = authorize.headers()["location"] ?? "";
  const code = new URL(location, HUB_API_TEST_URL).searchParams.get("code");
  expect(code, `pas de code d'autorisation (${authorize.status()} ${location})`).toBeTruthy();

  // L'échange du code se fait de serveur à serveur, sans cookie, comme le ferait l'application
  const app = await playwrightRequest.newContext({ baseURL: HUB_API_TEST_URL });
  const token = await app.post("/api/auth/oauth2/token", {
    headers: { authorization: `Basic ${Buffer.from(`${client.clientId}:${client.clientSecret}`).toString("base64")}` },
    form: { grant_type: "authorization_code", code: code!, redirect_uri: REDIRECT_URI, code_verifier: verifier },
  });
  expect(token.ok(), await token.text()).toBe(true);
  return (await token.json()) as { access_token: string; id_token: string };
}

const decodeJwt = (jwt: string) => JSON.parse(Buffer.from(jwt.split(".")[1], "base64url").toString()) as Record<string, unknown>;

test("deux pseudos identiques à la casse près ne coexistent pas", async () => {
  const base = `Doublon ${randomBytes(3).toString("hex")}`;
  const first = await newCoach(base);
  const second = await newCoach(base.toUpperCase());
  expect(first.user.name).toBe(base);
  // Le second compte est créé, avec un pseudo rendu unique
  expect(second.user.name.toLowerCase()).not.toBe(base.toLowerCase());

  // Le second ne peut pas prendre le pseudo du premier, même en minuscules
  const taken = await second.context.patch("/api/v1/profile", { data: { name: base.toLowerCase() } });
  expect(taken.status()).toBe(409);
  expect(((await taken.json()) as { code: string }).code).toBe("NAME_TAKEN");
});

test("le coach modifie son profil avec sa session et les données invalides sont refusées", async () => {
  const { context } = await newCoach(`Coach ${randomBytes(3).toString("hex")}`);
  const invalid = await context.patch("/api/v1/profile", { data: { naf: "12ab", timezone: "Lune/Base", email: "x@y.z" } });
  expect(invalid.status()).toBe(400);
  const { errors } = (await invalid.json()) as { errors: Record<string, string> };
  expect(Object.keys(errors).sort()).toEqual(["email", "naf", "timezone"]);

  const ok = await context.patch("/api/v1/profile", { data: { naf: "12345", region: "Bretagne", timezone: "Europe/Paris" } });
  expect(ok.status()).toBe(200);
  const profile = (await (await context.get("/api/v1/profile")).json()) as Record<string, unknown>;
  expect(profile).toMatchObject({ naf: "12345", region: "Bretagne", timezone: "Europe/Paris", locale: "fr" });
  expect(profile).not.toHaveProperty("email");
});

test("une application lit le profil dans le jeton et par userinfo avec la portée bbfrance:profile", async () => {
  const { context, user } = await newCoach(`Lecteur ${randomBytes(3).toString("hex")}`);
  await context.patch("/api/v1/profile", { data: { naf: "777", region: "Occitanie" } });
  const tokens = await getTokens(context, "openid profile bbfrance:profile");

  const idToken = decodeJwt(tokens.id_token);
  expect(idToken).toMatchObject({ sub: user.id, naf: "777", region: "Occitanie", locale: "fr", zoneinfo: "Europe/Paris" });
  expect(idToken.member_since).toBeTruthy();

  const app = await playwrightRequest.newContext({ baseURL: HUB_API_TEST_URL });
  const userinfo = (await (await app.get("/api/auth/oauth2/userinfo", { headers: { authorization: `Bearer ${tokens.access_token}` } })).json()) as Record<string, unknown>;
  expect(userinfo).toMatchObject({ sub: user.id, naf: "777", region: "Occitanie" });

  const profile = await app.get("/api/v1/profile", { headers: { authorization: `Bearer ${tokens.access_token}` } });
  expect(profile.status()).toBe(200);
  // Sans la portée d'écriture, la modification est refusée
  const refused = await app.patch("/api/v1/profile", { headers: { authorization: `Bearer ${tokens.access_token}` }, data: { region: "Bretagne" } });
  expect(refused.status()).toBe(403);
});

test("une application modifie le pseudo avec la portée bbfrance:profile:write", async () => {
  const { context, user } = await newCoach(`Ecrivain ${randomBytes(3).toString("hex")}`);
  const tokens = await getTokens(context, "openid profile bbfrance:profile bbfrance:profile:write");
  const app = await playwrightRequest.newContext({ baseURL: HUB_API_TEST_URL });
  const newName = `Renommé ${randomBytes(3).toString("hex")}`;

  const response = await app.patch("/api/v1/profile", { headers: { authorization: `Bearer ${tokens.access_token}` }, data: { name: newName } });
  expect(response.status(), await response.text()).toBe(200);
  expect(((await response.json()) as { id: string; name: string })).toMatchObject({ id: user.id, name: newName });

  // Un jeton inventé est refusé
  const fake = await app.patch("/api/v1/profile", { headers: { authorization: "Bearer jeton-invente" }, data: { name: "Pirate" } });
  expect(fake.status()).toBe(401);
});

test("/update-user de Better Auth est fermé : le profil ne change que par /api/v1/profile", async () => {
  const { context } = await newCoach(`Fermé ${randomBytes(3).toString("hex")}`);
  expect((await context.post("/api/auth/update-user", { data: { name: "Contournement" } })).status()).toBe(404);
});
