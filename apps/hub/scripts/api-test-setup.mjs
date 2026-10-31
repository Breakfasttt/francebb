/**
 * Prépare les tests de l'API du hub seul (pnpm test:api), sans lancer le site.
 * Repart d'une base de test vide (serveur Postgres local « hub-e2e », partagé avec test:sso : ne pas lancer les deux en même temps).
 * Ne touche ni aux bases de développement ni à aucune base réelle.
 */
import { execSync } from "node:child_process";
import { freshLocalDatabase } from "../../../scripts/local-postgres.mjs";

const HUB_DB = freshLocalDatabase("hub-e2e");
const env = { ...process.env, HUB_DATABASE_URL: HUB_DB, NODE_ENV: "test" };
execSync("npx prisma migrate deploy", { env, stdio: "inherit" });
