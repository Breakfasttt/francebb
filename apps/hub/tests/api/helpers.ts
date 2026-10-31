/**
 * Outils communs des tests d'API du hub : création d'un coach avec sa session, parcours OIDC complet pour obtenir
 * ses jetons, lecture d'un JWT.
 */
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { expect, request as playwrightRequest, type APIRequestContext } from "@playwright/test";
import { HUB_API_TEST_URL } from "../../playwright.api.config";

export const client = JSON.parse(readFileSync("tests/.api-client.json", "utf-8")) as { clientId: string; clientSecret: string };
const REDIRECT_URI = "http://localhost:4299/callback";

/**
 * Crée un compte (inscription par mot de passe, réservée aux tests) et renvoie un contexte qui porte sa session,
 * comme le navigateur du coach sur les pages du hub : il envoie l'en-tête Origin, sans lequel Better Auth refuse
 * toute demande accompagnée d'un cookie (protection contre les requêtes forgées).
 */
export async function newCoach(name: string, email = `profil-${randomUUID()}@e2e.test`) {
  const context = await playwrightRequest.newContext({ baseURL: HUB_API_TEST_URL, extraHTTPHeaders: { origin: HUB_API_TEST_URL } });
  const ip = `10.9.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;
  const response = await context.post("/api/auth/sign-up/email", {
    headers: { "x-forwarded-for": ip },
    data: { email, password: "profil-password-123", name },
  });
  expect(response.ok(), await response.text()).toBe(true);
  const { user } = (await response.json()) as { user: { id: string; name: string } };
  return { context, user };
}

/** Parcours OIDC complet pour le coach connecté dans `context` : renvoie le jeton d'accès et l'id_token. */
export async function getTokens(context: APIRequestContext, scope: string) {
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

export const decodeJwt = (jwt: string) => JSON.parse(Buffer.from(jwt.split(".")[1], "base64url").toString()) as Record<string, unknown>;
