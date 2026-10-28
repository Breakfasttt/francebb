/**
 * Configuration Playwright des tests smoke (filet de sécurité avant refacto).
 * Base Postgres dédiée (serveur local « site-e2e »), recréée vide à chaque run : ne touche jamais la base de dev ni la prod.
 * Le serveur doit tourner en mode dev (le provider "dev-login" n'existe qu'en développement).
 */
import { defineConfig, devices } from "@playwright/test";
import { E2E_DATABASE_URL } from "./tests/e2e/fixtures";

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
    // Règle absolue « mobile impeccable » : les parcours essentiels sont rejoués en taille téléphone
    { name: "telephone", use: { ...devices["Pixel 7"] }, testMatch: /smoke\.spec\.ts/ },
  ],
  webServer: {
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
    },
  },
});
