/**
 * Configuration Playwright des tests smoke (filet de sécurité avant refacto).
 * Base Postgres dédiée (serveur local « site-e2e »), recréée vide à chaque run : ne touche jamais la base de dev ni la prod.
 * Le serveur doit tourner en mode dev (le provider "dev-login" n'existe qu'en développement).
 */
import { defineConfig, devices } from "@playwright/test";
import { E2E, E2E_BBSCHEME_PORT, E2E_DATABASE_URL } from "./tests/e2e/fixtures";

const PORT = 3100;

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/globalSetup.ts",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    // Règle absolue « mobile impeccable » : les parcours essentiels et les tests d'inventaire de la refonte
    // (tests/e2e/inventaire/, ADR 0006) sont rejoués en taille téléphone
    { name: "telephone", use: { ...devices["Pixel 7"] }, testMatch: /(smoke\.spec|inventaire[\\/].*\.spec)\.ts$/ },
  ],
  webServer: [
    {
      // Carte 179 : faux serveur BBScheme, qui sert les schémas affichés dans les messages à la place de l'application
      // apps/bbscheme (voir tests/e2e/fakeBbschemeServer.mjs). Le site le trouve par le réglage BBSCHEME_URL, plus bas.
      command: `node tests/e2e/fakeBbschemeServer.mjs ${E2E_BBSCHEME_PORT} ${E2E.bbschemeBoardId}`,
      url: `http://localhost:${E2E_BBSCHEME_PORT}`,
      reuseExistingServer: false,
    },
    {
      // La base e2e.db est préparée en amont par scripts/e2e-db.mjs (npm run test:e2e).
      command: `npx next dev -p ${PORT}`,
      url: `http://localhost:${PORT}`,
      stdout: "pipe",
      timeout: 180_000,
      reuseExistingServer: false,
      env: {
        DATABASE_URL: E2E_DATABASE_URL,
        AUTH_URL: `http://localhost:${PORT}`,
        NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}`,
        // Carte 141 : l'envoi d'images passe par le serveur ; en test, il renvoie une adresse factice sans appeler ImgBB
        E2E_FAKE_IMAGE_UPLOAD: "1",
        BBSCHEME_URL: `http://localhost:${E2E_BBSCHEME_PORT}`,
      },
    },
  ],
});
