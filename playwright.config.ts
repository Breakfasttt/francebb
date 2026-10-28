/**
 * Configuration Playwright des tests smoke (filet de sécurité avant refacto).
 * Base dédiée e2e.db, recréée à chaque run : ne touche jamais dev.db ni la prod.
 * Le serveur doit tourner en mode dev (le provider "dev-login" n'existe qu'en développement).
 */
import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const E2E_DB_URL = "file:./e2e.db";

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
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // La base e2e.db est préparée en amont par scripts/e2e-db.mjs (npm run test:e2e).
    command: `npx next dev -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    stdout: "pipe",
    timeout: 180_000,
    reuseExistingServer: false,
    env: {
      DATABASE_URL: E2E_DB_URL,
      TURSO_DATABASE_URL: "",
      AUTH_URL: `http://localhost:${PORT}`,
      NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}`,
    },
  },
});
