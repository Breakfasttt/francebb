/**
 * Prépare le test SSO hub ↔ site : base hub de test vide (serveur Postgres local « hub-e2e »), client OIDC du site,
 * deux comptes hub (email vérifié = membre existant du site, email non vérifié = doit être refusé), base de test du site.
 * Ne touche ni aux bases de développement ni à aucune base réelle.
 */
import { execSync } from "node:child_process";
import { rmSync, existsSync } from "node:fs";
import { freshLocalDatabase } from "../../../scripts/local-postgres.mjs";
import { SSO_TEST_SECRET } from "../tests/api/secrets.mjs";

const HUB_DB = freshLocalDatabase("hub-e2e");
for (const file of ["tests/.sso-client.json", "tests/.sso-hooks.json"]) if (existsSync(file)) rmSync(file);

const env = { ...process.env, HUB_DATABASE_URL: HUB_DB, BETTER_AUTH_SECRET: SSO_TEST_SECRET, HUB_DEV_PASSWORD_LOGIN: "1", NODE_ENV: "test" };
execSync("npx prisma migrate deploy", { env, stdio: "inherit" });
execSync('node scripts/register-client.mjs "BBFrance site e2e" http://localhost:3200/api/auth/callback/hub tests/.sso-client.json', { env, stdio: "inherit" });
// Adresses où le hub prévient le site et lui demande les données d'un membre (cartes 122 et 125)
execSync('node scripts/client-hooks.mjs "BBFrance site e2e" http://localhost:3200/api/hub/events http://localhost:3200/api/hub/export tests/.sso-hooks.json', { env, stdio: "inherit" });

process.env.HUB_DATABASE_URL = HUB_DB;
const { prisma } = await import("../lib/prisma.mjs");
const { hashPassword } = await import("better-auth/crypto");
const { randomUUID } = await import("node:crypto");
// Comptes créés comme le ferait Better Auth (user + account "credential" au mot de passe haché)
const now = new Date();
for (const [email, name, emailVerified] of [["coach@e2e.test", "Coach E2E", true], ["unverified@e2e.test", "Non vérifié", false]]) {
  const userId = randomUUID();
  await prisma.user.create({ data: { id: userId, email, name, emailVerified, createdAt: now, updatedAt: now } });
  await prisma.account.create({
    data: { id: randomUUID(), userId, accountId: userId, providerId: "credential", password: await hashPassword("e2e-password-123"), createdAt: now, updatedAt: now },
  });
}

// Base e2e du site (membre "Coach E2E" déjà onboardé, email coach@e2e.test)
execSync("node scripts/e2e-db.mjs", { cwd: "../site", stdio: "inherit" });
