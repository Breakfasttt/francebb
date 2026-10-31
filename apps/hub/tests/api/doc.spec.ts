/**
 * Documentation de l'API du hub (carte 117) : GET /api/doc renvoie un document OpenAPI 3.1 complet, sans route
 * d'administration ni secret ; GET /api/doc?route=<chemin> ne renvoie que cette route ; aucune route de app/api n'est oubliée.
 */
import { readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { test, expect } from "@playwright/test";

type OpenApiDocument = { openapi: string; info: { title: string }; paths: Record<string, Record<string, unknown>> };

/**
 * Chemins des routes Next.js publiques de app/api propres au hub : hors routes de Better Auth, découverte OIDC
 * et tâches planifiées internes (`/api/cron`, appelées seulement par Vercel avec un secret).
 */
function hubRouteFiles(dir = "app/api"): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return hubRouteFiles(full);
    if (name !== "route.ts") return [];
    const route = "/" + relative("app", dir).split(sep).join("/");
    return route.startsWith("/api/auth") || route.startsWith("/api/cron") ? [] : [route];
  });
}

test("GET /api/doc renvoie un document OpenAPI 3.1 public et propre", async ({ request }) => {
  const response = await request.get("/api/doc");
  expect(response.status()).toBe(200);
  const doc = (await response.json()) as OpenApiDocument;

  expect(doc.openapi).toMatch(/^3\.1/);
  expect(doc.info.title).toContain("Passeport Blood Bowl");
  // Routes de connexion OIDC présentes
  expect(doc.paths["/api/auth/oauth2/authorize"]).toBeDefined();
  expect(doc.paths["/api/auth/oauth2/userinfo"]).toBeDefined();
  expect(doc.paths["/api/doc"]).toBeDefined();

  const paths = Object.keys(doc.paths);
  expect(paths.filter((path) => path.includes("/admin/"))).toEqual([]);
  expect(paths.filter((path) => /password|sign-up|open-api|reference/i.test(path))).toEqual([]);

  // Aucun secret ni table interne
  const text = JSON.stringify(doc);
  expect(text).not.toContain("test-api-secret");
  expect(text).not.toMatch(/"(Account|Verification|OauthClient|Jwks)"\s*:/);
});

test("GET /api/doc?route= ne renvoie que la route demandée", async ({ request }) => {
  const full = (await (await request.get("/api/doc?route=/api/auth/oauth2/userinfo")).json()) as OpenApiDocument;
  expect(Object.keys(full.paths)).toEqual(["/api/auth/oauth2/userinfo"]);

  // Le préfixe /api/auth peut être omis
  const short = (await (await request.get("/api/doc?route=/oauth2/userinfo")).json()) as OpenApiDocument;
  expect(Object.keys(short.paths)).toEqual(["/api/auth/oauth2/userinfo"]);

  const unknown = await request.get("/api/doc?route=/n-existe-pas");
  expect(unknown.status()).toBe(404);
  const body = (await unknown.json()) as { error: string; routes: string[] };
  expect(body.routes).toContain("/api/doc");
});

test("les adresses du plugin qui montrent tout sont coupées", async ({ request }) => {
  expect((await request.get("/api/auth/open-api/generate-schema")).status()).toBe(404);
  expect((await request.get("/api/auth/reference")).status()).toBe(404);
});

test("la découverte OIDC indique la documentation", async ({ request }) => {
  const metadata = (await (await request.get("/api/auth/.well-known/openid-configuration")).json()) as Record<string, string>;
  expect(metadata.service_documentation).toMatch(/\/api\/doc$/);
  expect(metadata.issuer).toBeDefined();
});

test("toute route de app/api est documentée", async ({ request }) => {
  const doc = (await (await request.get("/api/doc")).json()) as OpenApiDocument;
  for (const route of hubRouteFiles()) expect(doc.paths[route], `route ${route} absente de /api/doc`).toBeDefined();
});
