/**
 * Secrets des tests d'API du hub (jamais utilisés ailleurs), partagés entre la préparation (scripts/api-test-setup.mjs),
 * le serveur de test (playwright.api.config.ts) et les tests, qui en ont besoin pour recalculer empreintes et signatures.
 */
export const HUB_API_TEST_SECRET = "test-api-secret-0123456789abcdef0123456789";
export const HUB_API_TEST_CRON_SECRET = "test-cron-secret";
// Adresse où la petite application de test (tests/api/events.spec.ts) reçoit les événements du hub
export const TEST_EVENTS_URL = "http://localhost:4299/events";
