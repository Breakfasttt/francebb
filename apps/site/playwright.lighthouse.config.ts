/**
 * Configuration Playwright de la mesure de fluidité sur téléphone (carte 059), lancée par `pnpm lighthouse`.
 * Contrairement aux tests e2e, le site est mesuré dans sa version de production (`next build` puis `next start`) :
 * le mode développement est beaucoup plus lent et fausserait les notes.
 * Même base de test jetable que les e2e (serveur local « site-e2e », recréé vide par scripts/e2e-db.mjs).
 */
import { randomBytes } from "node:crypto";
import { defineConfig } from "@playwright/test";
import { E2E_DATABASE_URL } from "./tests/e2e/fixtures";

const PORT = 3200;

// Clé de chiffrement des sessions, propre à cette mesure : le script fabrique lui-même le cookie de session du
// membre mesuré (la connexion de test « dev-login » n'existe pas en production). Créée une seule fois par lancement :
// les processus de Playwright héritent de la variable posée par le premier.
process.env.LIGHTHOUSE_AUTH_SECRET ??= randomBytes(32).toString("hex");

export default defineConfig({
  testDir: "./tests/lighthouse",
  globalSetup: "./tests/e2e/globalSetup.ts",
  fullyParallel: false,
  workers: 1,
  // Chaque page est mesurée plusieurs fois : une mesure Lighthouse prend de 20 à 60 secondes
  timeout: 15 * 60_000,
  reporter: "list",
  use: { baseURL: `http://localhost:${PORT}` },
  webServer: {
    command: `npx next build && npx next start -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    stdout: "pipe",
    timeout: 15 * 60_000,
    reuseExistingServer: false,
    env: {
      DATABASE_URL: E2E_DATABASE_URL,
      AUTH_SECRET: process.env.LIGHTHOUSE_AUTH_SECRET,
      AUTH_URL: `http://localhost:${PORT}`,
      AUTH_TRUST_HOST: "true",
      NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}`,
    },
  },
});
