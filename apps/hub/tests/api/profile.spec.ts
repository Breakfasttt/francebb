/**
 * Profil du coach (carte 119) : pseudo unique sans tenir compte des majuscules, lecture du profil dans le jeton et
 * par userinfo avec la portée bbfrance:profile, modification par PATCH /api/v1/profile avec bbfrance:profile:write.
 * Les jetons sont obtenus par le vrai parcours OIDC (autorisation avec PKCE, puis échange du code).
 */
import { randomBytes } from "node:crypto";
import { test, expect, request as playwrightRequest } from "@playwright/test";
import { HUB_API_TEST_URL } from "../../playwright.api.config";
import { decodeJwt, getTokens, newCoach } from "./helpers";

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
