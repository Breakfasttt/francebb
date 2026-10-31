/**
 * Suppression d'un compte orchestrée par le hub (carte 123) : délai de grâce, applications coupées et prévenues,
 * annulation, puis effacement au hub une fois que toutes les applications ont accusé réception de user.deleted.
 * Une petite application de test écoute les événements sur le port 4299, comme dans events.spec.ts.
 */
import { readFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { test, expect, type APIRequestContext } from "@playwright/test";
import { HUB_API_TEST_CRON_SECRET, HUB_API_TEST_SECRET, HUB_API_TEST_URL } from "../../playwright.api.config";
import { client, getTokens, newCoach } from "./helpers";

process.env.HUB_DATABASE_URL = JSON.parse(readFileSync("../../.local-postgres.json", "utf-8"))["hub-e2e"];
process.env.BETTER_AUTH_SECRET = HUB_API_TEST_SECRET;
let prisma: typeof import("../../lib/prisma.mjs").prisma;
let auditHash: typeof import("../../lib/audit.mjs").auditHash;

type Received = { type: string; data: Record<string, unknown> };
const received: Received[] = [];
let answerStatus = 200;
let server: Server;

test.beforeAll(async () => {
  ({ prisma } = await import("../../lib/prisma.mjs"));
  ({ auditHash } = await import("../../lib/audit.mjs"));
  server = createServer((request, response) => {
    let body = "";
    request.on("data", (chunk) => (body += chunk));
    request.on("end", () => {
      received.push(JSON.parse(body));
      response.writeHead(answerStatus).end();
    });
  });
  await new Promise<void>((resolve) => server.listen(4299, resolve));
});
test.afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

const typesFor = (userId: string) => received.filter((event) => event.data.userId === userId).map((event) => event.type);

/** Demande d'autorisation OIDC : renvoie l'adresse vers laquelle le hub redirige. */
async function authorizeLocation(context: APIRequestContext) {
  const verifier = randomBytes(32).toString("base64url");
  const response = await context.get("/api/auth/oauth2/authorize", {
    maxRedirects: 0,
    params: {
      response_type: "code",
      client_id: client.clientId,
      redirect_uri: "http://localhost:4299/callback",
      scope: "openid profile",
      state: randomUUID(),
      code_challenge: createHash("sha256").update(verifier).digest("base64url"),
      code_challenge_method: "S256",
    },
  });
  return response.headers()["location"] ?? "";
}

/** Lance la tâche quotidienne, comme Vercel chaque nuit. */
async function runDaily(context: APIRequestContext) {
  const response = await context.get(`${HUB_API_TEST_URL}/api/cron/daily`, { headers: { authorization: `Bearer ${HUB_API_TEST_CRON_SECRET}` } });
  expect(response.status()).toBe(200);
  return (await response.json()) as { deletions: { started: number; erased: number; blocked: number } };
}

test("une demande coupe les applications, que le coach peut annuler", async () => {
  const { context, user } = await newCoach(`Hesitant ${randomBytes(3).toString("hex")}`);
  await getTokens(context, "openid profile");

  const request = await context.post("/api/v1/account/delete", { data: {} });
  expect(request.status()).toBe(200);
  const { scheduledAt } = (await request.json()) as { scheduledAt: string };
  const days = (new Date(scheduledAt).getTime() - Date.now()) / 86_400_000;
  expect(days).toBeGreaterThan(29);
  expect(typesFor(user.id)).toContain("user.deletion_scheduled");
  // Plus de connexion aux applications : le hub renvoie vers le passeport
  expect(await authorizeLocation(context)).toContain("suppression=en-cours");

  expect((await context.post("/api/v1/account/delete/cancel", { data: {} })).status()).toBe(200);
  expect(typesFor(user.id)).toContain("user.deletion_cancelled");
  expect(await authorizeLocation(context)).toContain("code=");
});

test("à l'échéance, le hub efface tout après l'accusé de réception de chaque application", async ({ request }) => {
  const name = `Efface ${randomBytes(3).toString("hex")}`;
  const { context, user } = await newCoach(name);
  await getTokens(context, "openid profile bbfrance:profile");
  await context.post("/api/v1/account/delete", { data: {} });
  await prisma.user.update({ where: { id: user.id }, data: { deletionScheduledAt: new Date(Date.now() - 1000) } });

  const { deletions } = await runDaily(request);
  expect(deletions).toMatchObject({ started: 1, erased: 1 });
  expect(typesFor(user.id)).toContain("user.deleted");

  expect(await prisma.user.findUnique({ where: { id: user.id } })).toBeNull();
  expect(await prisma.account.count({ where: { userId: user.id } })).toBe(0);
  expect(await prisma.session.count({ where: { userId: user.id } })).toBe(0);
  expect(await prisma.oauthRefreshToken.count({ where: { userId: user.id } })).toBe(0);
  expect(await prisma.oauthAccessToken.count({ where: { userId: user.id } })).toBe(0);
  expect(await prisma.outboundEvent.count({ where: { payload: { path: ["data", "userId"], equals: user.id } } })).toBe(0);
  // Le pseudo reste réservé : un nouveau compte qui le demande reçoit un autre pseudo
  expect(await prisma.reservedName.findUnique({ where: { nameHash: auditHash(name.toLowerCase())! } })).not.toBeNull();
  const { user: newcomer } = await newCoach(name);
  expect(newcomer.name).not.toBe(name);
});

test("une application qui ne répond pas retarde l'effacement", async ({ request }) => {
  const { context, user } = await newCoach(`Patient ${randomBytes(3).toString("hex")}`);
  await getTokens(context, "openid profile");
  await context.post("/api/v1/account/delete", { data: {} });
  await prisma.user.update({ where: { id: user.id }, data: { deletionScheduledAt: new Date(Date.now() - 1000) } });

  answerStatus = 500;
  await runDaily(request);
  answerStatus = 200;
  expect(await prisma.user.findUnique({ where: { id: user.id } })).not.toBeNull();

  // L'application répond de nouveau : au prochain passage, l'événement est renvoyé et le compte effacé
  await prisma.outboundEvent.updateMany({ where: { type: "user.deleted", status: "pending" }, data: { nextAttemptAt: new Date(Date.now() - 1000) } });
  await runDaily(request);
  expect(await prisma.user.findUnique({ where: { id: user.id } })).toBeNull();
});

test("un compte banni puis supprimé ne revient pas avec le même email", async ({ request }) => {
  const email = `banni-supprime-${randomBytes(3).toString("hex")}@e2e.test`;
  const { context, user } = await newCoach(`Exclu ${randomBytes(3).toString("hex")}`, email);
  await context.post("/api/v1/account/delete", { data: {} });
  await prisma.user.update({ where: { id: user.id }, data: { banned: true, deletionScheduledAt: new Date(Date.now() - 1000) } });
  await runDaily(request);
  expect(await prisma.user.findUnique({ where: { id: user.id } })).toBeNull();

  const again = await request.post("/api/auth/sign-up/email", {
    headers: { origin: HUB_API_TEST_URL, "x-forwarded-for": "10.7.7.7" },
    data: { email, password: "profil-password-123", name: `Retour ${randomBytes(3).toString("hex")}` },
  });
  expect(again.ok()).toBe(false);
});
