/**
 * Prépare la base des tests : repart d'un serveur Postgres local vide (« site-e2e »), puis y applique les migrations.
 * Adresse fixe, réservée aux tests : ne peut jamais viser la base de développement ni la prod.
 */
import { execSync } from "node:child_process";
import { freshLocalDatabase } from "../../../scripts/local-postgres.mjs";

const url = freshLocalDatabase("site-e2e");
execSync("npx prisma migrate deploy", {
  stdio: ["ignore", "inherit", "inherit"],
  env: { ...process.env, DATABASE_URL: url },
});
