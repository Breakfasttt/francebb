/**
 * Configuration Playwright du parcours de fin de carte (niveau 2 des tests, carte 157) : `pnpm test:parcours`.
 * Un seul fichier de test (tests/parcours/parcours.spec.ts), un seul navigateur, un seul démarrage du serveur.
 * Même serveur et même base de test que la suite complète (playwright.config.ts) : la base « site-e2e » est
 * recréée vide par scripts/e2e-db.mjs, puis remplie par tests/e2e/globalSetup.ts.
 */
import { defineConfig, devices } from "@playwright/test";
import baseConfig from "./playwright.config";

export default defineConfig({
  ...baseConfig,
  testDir: "./tests/parcours",
  // Le parcours visite une trentaine de pages, deux fois chacune (téléphone, puis ordinateur)
  timeout: 10 * 60_000,
  reporter: "list",
  projects: [{ name: "parcours", use: { ...devices["Desktop Chrome"] } }],
});
