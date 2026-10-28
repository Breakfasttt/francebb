/**
 * Test SSO hub ↔ site (P5) : lance le hub (port 4100) et le site en AUTH_MODE=hub (port 3200) sur des bases Postgres locales de test.
 * Préparation : scripts/e2e-setup.mjs (pnpm test:sso).
 */
import { readFileSync } from "node:fs";
import { defineConfig, devices } from "@playwright/test";

const client = JSON.parse(readFileSync("tests/.sso-client.json", "utf-8")) as { clientId: string; clientSecret: string };
// Adresses des bases Postgres locales de test, enregistrées par scripts/local-postgres.mjs
const databases = JSON.parse(readFileSync("../../.local-postgres.json", "utf-8")) as Record<string, string>;

export default defineConfig({
  testDir: "./tests",
  globalSetup: "./tests/globalSetup.ts",
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  reporter: "list",
  use: { trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      command: "npx next dev -p 4100",
      url: "http://localhost:4100/api/auth/.well-known/openid-configuration",
      timeout: 180_000,
      reuseExistingServer: false,
      env: {
        HUB_DATABASE_URL: databases["hub-e2e"],
        BETTER_AUTH_URL: "http://localhost:4100",
        HUB_DEV_PASSWORD_LOGIN: "1",
        NEXT_PUBLIC_HUB_DEV_PASSWORD_LOGIN: "1",
      },
    },
    {
      command: "npx next dev -p 3200",
      cwd: "../site",
      url: "http://localhost:3200/auth/login",
      timeout: 180_000,
      reuseExistingServer: false,
      env: {
        DATABASE_URL: databases["site-e2e"],
        AUTH_URL: "http://localhost:3200",
        NEXT_PUBLIC_SITE_URL: "http://localhost:3200",
        AUTH_MODE: "hub",
        HUB_ISSUER: "http://localhost:4100/api/auth",
        HUB_CLIENT_ID: client.clientId,
        HUB_CLIENT_SECRET: client.clientSecret,
      },
    },
  ],
});
