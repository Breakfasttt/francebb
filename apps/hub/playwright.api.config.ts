/**
 * Tests de l'API du hub seul (port 4200), sans le site : documentation, profil, événements…
 * Préparation : scripts/api-test-setup.mjs (pnpm test:api).
 */
import { readFileSync } from "node:fs";
import { defineConfig } from "@playwright/test";

// Adresses des bases Postgres locales de test, enregistrées par scripts/local-postgres.mjs
const databases = JSON.parse(readFileSync("../../.local-postgres.json", "utf-8")) as Record<string, string>;

export const HUB_API_TEST_URL = "http://localhost:4200";
// Secrets de test uniquement : les tests en ont besoin pour recalculer les empreintes du journal et appeler la purge
export const HUB_API_TEST_SECRET = "test-api-secret-0123456789abcdef0123456789";
export const HUB_API_TEST_CRON_SECRET = "test-cron-secret";

export default defineConfig({
  testDir: "./tests/api",
  fullyParallel: false,
  workers: 1,
  timeout: 60_000,
  reporter: "list",
  use: { baseURL: HUB_API_TEST_URL },
  webServer: {
    command: "npx next dev -p 4200",
    url: `${HUB_API_TEST_URL}/api/auth/.well-known/openid-configuration`,
    timeout: 180_000,
    reuseExistingServer: false,
    env: {
      HUB_DATABASE_URL: databases["hub-e2e"],
      BETTER_AUTH_URL: HUB_API_TEST_URL,
      BETTER_AUTH_SECRET: HUB_API_TEST_SECRET,
      // Inscription par mot de passe (développement uniquement) : crée des comptes de test sans email
      HUB_DEV_PASSWORD_LOGIN: "1",
      // Limite de requêtes active comme en production, pour la tester
      HUB_RATE_LIMIT: "1",
      CRON_SECRET: HUB_API_TEST_CRON_SECRET,
    },
  },
});
