/**
 * Secrets des tests d'API du hub (jamais utilisés ailleurs), partagés entre la préparation (scripts/api-test-setup.mjs),
 * le serveur de test (playwright.api.config.ts) et les tests, qui en ont besoin pour recalculer empreintes et signatures.
 */
export const HUB_API_TEST_SECRET = "test-api-secret-0123456789abcdef0123456789";
export const HUB_API_TEST_CRON_SECRET = "test-cron-secret";
// Secret du hub dans le test hub ↔ site (pnpm test:sso), qui chiffre aussi le secret d'événements du site
export const SSO_TEST_SECRET = "test-sso-secret-0123456789abcdef0123456789";
// Adresse où la petite application de test (tests/api/events.spec.ts) reçoit les événements du hub
export const TEST_EVENTS_URL = "http://localhost:4299/events";
// Adresse où cette même application de test fournit les données d'un coach pour l'export (tests/api/export.spec.ts)
export const TEST_EXPORT_URL = "http://localhost:4299/export";
