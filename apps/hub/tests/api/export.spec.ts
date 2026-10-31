/**
 * Export des données d'un coach (carte 125) : le fichier contient les données du hub et celles de chaque application
 * qui connaît le coach, obtenues par une demande signée. Une petite application de test répond sur le port 4299.
 */
import { readFileSync } from "node:fs";
import { createServer, type Server } from "node:http";
import { randomBytes } from "node:crypto";
import { test, expect, request as playwrightRequest } from "@playwright/test";
import { HUB_API_TEST_URL } from "../../playwright.api.config";
import { getTokens, newCoach } from "./helpers";
import { verifyHubEvent } from "../../lib/verifyEvent.mjs";

const { eventsSecret } = JSON.parse(readFileSync("tests/.api-hooks.json", "utf-8")) as { eventsSecret: string };
let server: Server;

test.beforeAll(async () => {
  server = createServer((request, response) => {
    let body = "";
    request.on("data", (chunk) => (body += chunk));
    request.on("end", async () => {
      if (request.url !== "/export") return response.writeHead(200).end();
      // Comme le ferait une vraie application : elle vérifie la signature avant de donner quoi que ce soit
      const headers = new Headers(Object.entries(request.headers).map(([key, value]): [string, string] => [key, String(value)]));
      const check = await verifyHubEvent({ secret: eventsSecret, body, headers, alreadySeen: () => false });
      if (!check.ok) return response.writeHead(401).end();
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ forum: { messages: 2 }, coach: check.event.data.userId }));
    });
  });
  await new Promise<void>((resolve) => server.listen(4299, resolve));
});
test.afterAll(() => new Promise<void>((resolve) => server.close(() => resolve())));

test("le fichier exporté contient les données du hub et de l'application, sans secret", async () => {
  const { context, user } = await newCoach(`Export ${randomBytes(3).toString("hex")}`);
  await getTokens(context, "openid profile");
  await context.patch("/api/v1/profile", { data: { region: "Bourgogne" } });

  const response = await context.get("/api/v1/account/export");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-disposition"]).toContain("attachment");
  const data = (await response.json()) as { hub: { profile: Record<string, unknown>; applications: unknown[] }; applications: Record<string, unknown> };
  expect(data.hub.profile).toMatchObject({ id: user.id, region: "Bourgogne" });
  expect(data.hub.applications).toHaveLength(1);
  expect(data.applications["Application de test API"]).toEqual({ forum: { messages: 2 }, coach: user.id });

  const text = JSON.stringify(data);
  expect(text).not.toMatch(/accessToken|refreshToken|password|"token"/);
});

test("l'export est réservé à la session du coach", async () => {
  const anonymous = await playwrightRequest.newContext({ baseURL: HUB_API_TEST_URL });
  expect((await anonymous.get("/api/v1/account/export")).status()).toBe(401);
});
