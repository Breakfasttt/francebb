/**
 * Prépare les tests de l'API du hub seul (pnpm test:api), sans lancer le site.
 * Repart d'une base de test vide (serveur Postgres local « hub-e2e », partagé avec test:sso : ne pas lancer les deux en même temps).
 * Ne touche ni aux bases de développement ni à aucune base réelle.
 */
import { execSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { freshLocalDatabase } from "../../../scripts/local-postgres.mjs";
import { HUB_API_TEST_SECRET, TEST_EVENTS_URL } from "../tests/api/secrets.mjs";

const API_CLIENT_FILE = "tests/.api-client.json";
const API_HOOKS_FILE = "tests/.api-hooks.json";
const THIRD_PARTY_FILE = "tests/.api-third-party.json";
const PENDING_THIRD_PARTY_FILE = "tests/.api-third-party-pending.json";

const HUB_DB = freshLocalDatabase("hub-e2e");
const env = { ...process.env, HUB_DATABASE_URL: HUB_DB, BETTER_AUTH_SECRET: HUB_API_TEST_SECRET, NODE_ENV: "test" };
execSync("npx prisma migrate deploy", { env, stdio: "inherit" });
// Application cliente de test : les tests obtiennent un vrai jeton d'accès par le parcours OIDC complet
if (existsSync(API_CLIENT_FILE)) rmSync(API_CLIENT_FILE);
execSync(`node scripts/register-client.mjs "Application de test API" http://localhost:4299/callback ${API_CLIENT_FILE}`, { env, stdio: "inherit" });
// Adresse où cette application reçoit les événements signés du hub (tests/api/events.spec.ts)
execSync(`node scripts/client-hooks.mjs "Application de test API" ${TEST_EVENTS_URL} "" ${API_HOOKS_FILE}`, { env, stdio: "inherit" });
// Deux applications tierces (tests/api/third-party.spec.ts) : l'une validée à la main, l'autre pas
for (const [name, file] of [["Outil tiers valide", THIRD_PARTY_FILE], ["Outil tiers en attente", PENDING_THIRD_PARTY_FILE]]) {
  if (existsSync(file)) rmSync(file);
  execSync(`node scripts/register-client.mjs "${name}" http://localhost:4299/tiers ${file} --tiers`, { env, stdio: "inherit" });
}
execSync(`node scripts/validate-client.mjs "Outil tiers valide"`, { env, stdio: "inherit" });
