/**
 * Sécurité du hub (carte 118) : en-têtes de sécurité, limite de requêtes stockée en base, journal d'audit sans
 * donnée en clair, purge planifiée protégée par un secret, chiffrement des jetons et rotation des clés activés.
 */
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { test, expect } from "@playwright/test";
import { HUB_API_TEST_CRON_SECRET, HUB_API_TEST_SECRET } from "../../playwright.api.config";

// Les modules du hub lisent la base et le secret dans les variables d'environnement : mêmes valeurs que le serveur de test
process.env.HUB_DATABASE_URL = JSON.parse(readFileSync("../../.local-postgres.json", "utf-8"))["hub-e2e"];
process.env.BETTER_AUTH_SECRET = HUB_API_TEST_SECRET;
// Chargés après les variables ci-dessus (les tests Playwright ne permettent pas d'`await` au niveau du fichier)
let prisma: typeof import("../../lib/prisma.mjs").prisma;
let auditHash: typeof import("../../lib/audit.mjs").auditHash;
test.beforeAll(async () => {
  ({ prisma } = await import("../../lib/prisma.mjs"));
  ({ auditHash } = await import("../../lib/audit.mjs"));
});

/** Adresse IP inventée, différente à chaque appel : chaque test a ses propres compteurs de limite. */
const randomIp = () => `10.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`;

test("chaque page porte les en-têtes de sécurité", async ({ request }) => {
  const headers = (await request.get("/sign-in")).headers();
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["content-security-policy"]).toContain("object-src 'none'");
  expect(headers["strict-transport-security"]).toContain("max-age=31536000");
  expect(headers["x-content-type-options"]).toBe("nosniff");
});

test("la page de connexion fonctionne avec les règles de sécurité du navigateur", async ({ page }) => {
  const blocked: string[] = [];
  page.on("console", (message) => {
    if (/Content Security Policy|Refused to/i.test(message.text())) blocked.push(message.text());
  });
  await page.goto("/sign-in");
  await expect(page.getByRole("button", { name: /lien de connexion/i })).toBeVisible();
  expect(blocked).toEqual([]);
});

test("la limite de requêtes bloque et se range dans la base", async ({ request }) => {
  const ip = randomIp();
  const statuses: number[] = [];
  for (let i = 0; i < 5; i++) {
    const response = await request.post("/api/auth/sign-in/email", {
      headers: { "x-forwarded-for": ip },
      data: { email: "personne@e2e.test", password: "mauvais-mot-de-passe" },
    });
    statuses.push(response.status());
  }
  // Better Auth autorise 3 tentatives de connexion par 10 secondes et par adresse
  expect(statuses).toContain(429);
  expect(await prisma.rateLimit.count({ where: { key: { contains: ip } } })).toBeGreaterThan(0);
});

test("inscription et connexion sont journalisées sans identifiant ni IP en clair", async ({ request }) => {
  const ip = randomIp();
  const email = `audit-${randomUUID()}@e2e.test`;
  const response = await request.post("/api/auth/sign-up/email", {
    headers: { "x-forwarded-for": ip },
    data: { email, password: "audit-password-123", name: "Coach Audit" },
  });
  expect(response.ok()).toBe(true);
  const user = await prisma.user.findUniqueOrThrow({ where: { email } });

  const rows = await prisma.auditLog.findMany({ where: { userHash: auditHash(user.id) } });
  expect(rows.map((row) => row.action)).toEqual(expect.arrayContaining(["inscription", "connexion"]));
  const text = JSON.stringify(rows);
  expect(text).not.toContain(user.id);
  expect(text).not.toContain(ip);
});

test("la purge planifiée refuse un appel sans secret et efface le journal de plus d'un an", async ({ request }) => {
  expect((await request.get("/api/cron/daily")).status()).toBe(401);
  expect((await request.get("/api/cron/daily", { headers: { authorization: "Bearer mauvais" } })).status()).toBe(401);

  const old = await prisma.auditLog.create({ data: { id: randomUUID(), action: "test ancien", createdAt: new Date("2020-01-01") } });
  const recent = await prisma.auditLog.create({ data: { id: randomUUID(), action: "test récent", createdAt: new Date() } });

  const response = await request.get("/api/cron/daily", { headers: { authorization: `Bearer ${HUB_API_TEST_CRON_SECRET}` } });
  expect(response.status()).toBe(200);
  expect(await prisma.auditLog.findUnique({ where: { id: old.id } })).toBeNull();
  expect(await prisma.auditLog.findUnique({ where: { id: recent.id } })).not.toBeNull();
});

// Un vrai jeton Discord ne peut pas être obtenu en test (il faudrait un compte Discord) et le chargeur de Playwright
// n'importe pas Better Auth : on vérifie donc la configuration. Le contrôle en base se fait lors de l'essai à la main.
test("jetons Discord et Google chiffrés, clés renouvelées (configuration)", () => {
  expect(readFileSync("lib/auth.ts", "utf-8")).toMatch(/encryptOAuthTokens:\s*true/);
  expect(readFileSync("lib/authPlugins.mjs", "utf-8")).toMatch(/jwks:\s*\{\s*rotationInterval:\s*[1-9]/);
});
