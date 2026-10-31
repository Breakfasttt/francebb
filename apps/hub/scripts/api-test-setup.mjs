/**
 * Prépare les tests de l'API du hub seul (pnpm test:api), sans lancer le site.
 * Repart d'une base de test vide (serveur Postgres local « hub-e2e », partagé avec test:sso : ne pas lancer les deux en même temps).
 * Ne touche ni aux bases de développement ni à aucune base réelle.
 */
import { execSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import { freshLocalDatabase } from "../../../scripts/local-postgres.mjs";

const API_CLIENT_FILE = "tests/.api-client.json";

const HUB_DB = freshLocalDatabase("hub-e2e");
const env = { ...process.env, HUB_DATABASE_URL: HUB_DB, NODE_ENV: "test" };
execSync("npx prisma migrate deploy", { env, stdio: "inherit" });
// Application cliente de test : les tests obtiennent un vrai jeton d'accès par le parcours OIDC complet
if (existsSync(API_CLIENT_FILE)) rmSync(API_CLIENT_FILE);
execSync(`node scripts/register-client.mjs "Application de test API" http://localhost:4299/callback ${API_CLIENT_FILE}`, { env, stdio: "inherit" });
