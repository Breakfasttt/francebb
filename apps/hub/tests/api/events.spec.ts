/**
 * Événements signés du hub vers les applications (carte 121). Une petite application de test écoute sur le port 4299
 * (adresse déclarée par scripts/client-hooks.mjs dans api-test-setup.mjs) et garde ce qu'elle reçoit.
 */
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { randomBytes } from "node:crypto";
import { test, expect } from "@playwright/test";
import { HUB_API_TEST_CRON_SECRET, HUB_API_TEST_SECRET } from "../../playwright.api.config";
import { getTokens, newCoach } from "./helpers";
import { verifyHubEvent } from "../../lib/verifyEvent.mjs";
import { signEvent } from "../../lib/eventSignature.mjs";

const HUB_E2E_DATABASE_URL: string = JSON.parse(readFileSync("../../.local-postgres.json", "utf-8"))["hub-e2e"];
const { eventsSecret } = JSON.parse(readFileSync("tests/.api-hooks.json", "utf-8")) as { eventsSecret: string };

type Received = { headers: Headers; body: string; event: { type: string; data: Record<string, unknown> } };
const received: Received[] = [];
let answerStatus = 200;
let server: Server;

test.beforeAll(async () => {
  server = createServer((request, response) => {
    let body = "";
    request.on("data", (chunk) => (body += chunk));
    request.on("end", () => {
      const headers = new Headers(Object.entries(request.headers).map(([key, value]): [string, string] => [key, String(value)]));
      received.push({ headers, body, event: JSON.parse(body) });
      response.writeHead(answerStatus).end();
    });
  });
  await new Promise<void>((resolve) => server.listen(4299, resolve));
});
test.afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

const eventsFor = (userId: string) => received.filter((item) => item.event.data.userId === userId);

test("un profil modifié prévient l'application qui connaît le coach, avec une signature valide", async () => {
  const { context, user } = await newCoach(`Evenement ${randomBytes(3).toString("hex")}`);
  await getTokens(context, "openid profile bbfrance:profile");
  await context.patch("/api/v1/profile", { data: { region: "Normandie" } });

  const [item] = eventsFor(user.id).filter((entry) => entry.event.type === "user.updated");
  expect(item, "aucun événement user.updated reçu").toBeTruthy();
  const seen = new Set<string>();
  const result = await verifyHubEvent({ secret: eventsSecret, body: item.body, headers: item.headers, alreadySeen: (id) => seen.has(id) });
  expect(result.ok).toBe(true);
  expect(item.event.data).toMatchObject({ userId: user.id, banned: false, profile: { id: user.id, region: "Normandie" } });
});

test("une application qui ne connaît pas le coach ne reçoit rien", async () => {
  const { context, user } = await newCoach(`Inconnu ${randomBytes(3).toString("hex")}`);
  await context.patch("/api/v1/profile", { data: { region: "Corse" } });
  expect(eventsFor(user.id)).toEqual([]);
});

test("la vérification refuse une signature fausse, un envoi trop ancien et un rejeu", async () => {
  const body = JSON.stringify({ id: "evt-1", type: "user.updated", version: 1, data: {} });
  const headersAt = (timestamp: number, secret = eventsSecret) =>
    new Headers({ "x-bbfrance-event-id": "evt-1", "x-bbfrance-timestamp": String(timestamp), "x-bbfrance-signature": signEvent(secret, String(timestamp), body) });
  const now = Math.floor(Date.now() / 1000);
  const never = () => false;

  expect(await verifyHubEvent({ secret: eventsSecret, body, headers: headersAt(now), alreadySeen: never })).toMatchObject({ ok: true });
  expect(await verifyHubEvent({ secret: eventsSecret, body, headers: headersAt(now, "autre-secret"), alreadySeen: never })).toMatchObject({ ok: false, reason: "signature invalide" });
  expect(await verifyHubEvent({ secret: eventsSecret, body, headers: headersAt(now - 6 * 60), alreadySeen: never })).toMatchObject({ ok: false, reason: "envoi trop ancien" });
  expect(await verifyHubEvent({ secret: eventsSecret, body, headers: headersAt(now), alreadySeen: () => true })).toMatchObject({ ok: false, reason: "événement déjà reçu" });
});

test("un envoi raté est renvoyé par la tâche quotidienne", async ({ request }) => {
  process.env.HUB_DATABASE_URL = HUB_E2E_DATABASE_URL;
  const { prisma } = await import("../../lib/prisma.mjs");
  const { context, user } = await newCoach(`Panne ${randomBytes(3).toString("hex")}`);
  await getTokens(context, "openid profile bbfrance:profile");

  answerStatus = 500;
  await context.patch("/api/v1/profile", { data: { region: "Alsace" } });
  answerStatus = 200;
  const pending = await prisma.outboundEvent.findFirstOrThrow({ where: { type: "user.updated", status: "pending", payload: { path: ["data", "userId"], equals: user.id } } });
  expect(pending.attempts).toBe(1);

  // On avance l'heure du prochain essai, puis la tâche de la nuit passe
  await prisma.outboundEvent.update({ where: { id: pending.id }, data: { nextAttemptAt: new Date(Date.now() - 1000) } });
  const daily = await request.get("/api/cron/daily", { headers: { authorization: `Bearer ${HUB_API_TEST_CRON_SECRET}` } });
  expect(daily.status()).toBe(200);
  expect((await prisma.outboundEvent.findUniqueOrThrow({ where: { id: pending.id } })).status).toBe("delivered");
});

test("un bannissement par le script prévient l'application (user.banned)", async () => {
  const email = `banni-${randomBytes(3).toString("hex")}@e2e.test`;
  const { context, user } = await newCoach(`Banni ${randomBytes(3).toString("hex")}`, email);
  await getTokens(context, "openid profile");

  // Lancé sans bloquer ce processus : la petite application de test doit pouvoir répondre au hub pendant ce temps
  await promisify(execFile)("node", ["scripts/ban-user.mjs", email, "Test du bannissement"], {
    env: { ...process.env, HUB_DATABASE_URL: HUB_E2E_DATABASE_URL, BETTER_AUTH_SECRET: HUB_API_TEST_SECRET },
  });
  const banned = eventsFor(user.id).find((entry) => entry.event.type === "user.banned");
  expect(banned?.event.data).toMatchObject({ userId: user.id, banned: true });
  expect(banned?.body).not.toContain("Test du bannissement");
});
