/**
 * Mesure de baseline perf (refacto P0, à relancer à chaque phase pour comparer).
 * Lance `next start` (build requis) sur une COPIE de dev.db, simule un mobile 4G (CDP),
 * et mesure par route, en anonyme et connecté : TTFB, FCP, LCP, JS transféré, requêtes Prisma.
 * Usage : npm run build && node scripts/baseline.mjs > logs/baseline.md
 */
import { copyFileSync, mkdirSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { chromium } from "@playwright/test";
import { encode } from "@auth/core/jwt";
import { PrismaClient } from "../prisma/generated-client/index.js";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const PORT = 3200;
const BASE_URL = `http://localhost:${PORT}`;
const DB_COPY = "logs/baseline.db";
const RUNS = 3;
const ROUTES = ["/", "/forum", "/forum/[firstForum]", "/forum/topic/[biggestTopic]", "/tournois", "/classement", "/bbscheme"];
const SECRET = process.env.AUTH_SECRET ?? "baseline-secret";

mkdirSync("logs", { recursive: true });
copyFileSync("dev.db", DB_COPY);

const prisma = new PrismaClient({ adapter: new PrismaLibSql({ url: `file:./${DB_COPY}` }) });
const [firstForum, biggestTopic, user] = await Promise.all([
  prisma.forum.findFirst({ orderBy: { topics: { _count: "desc" } }, select: { id: true } }),
  prisma.topic.findFirst({ orderBy: { posts: { _count: "desc" } }, select: { id: true } }),
  prisma.user.findFirst({ where: { hasFinishedOnboarding: true, isBanned: false }, select: { id: true, role: true, name: true } }),
]);
await prisma.$disconnect();

const routes = ROUTES.map((route) =>
  route.replace("[firstForum]", firstForum?.id ?? "none").replace("[biggestTopic]", biggestTopic?.id ?? "none")
);

let queryCount = 0;
const server = spawn("npx", ["next", "start", "-p", String(PORT)], {
  shell: true,
  env: { ...process.env, DATABASE_URL: `file:./${DB_COPY}`, TURSO_DATABASE_URL: "", PRISMA_QUERY_LOG: "1", AUTH_SECRET: SECRET, AUTH_URL: BASE_URL },
});
const ready = new Promise((resolve, reject) => {
  server.on("exit", (code) => reject(new Error(`next start arrêté (code ${code}) : port ${PORT} occupé ou build manquant`)));
  const onData = (chunk) => {
    const text = chunk.toString();
    queryCount += (text.match(/prisma:query/g) ?? []).length;
    if (text.includes("Ready")) resolve();
  };
  server.stdout.on("data", onData);
  server.stderr.on("data", onData);
});
function stopServer() {
  if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(server.pid), "/T", "/F"]);
  else server.kill();
}
process.on("exit", stopServer);
await ready;

async function sessionCookie() {
  if (!user) return null;
  const value = await encode({
    token: { id: user.id, sub: user.id, name: user.name, role: user.role, hasFinishedOnboarding: true, isBanned: false },
    secret: SECRET,
    salt: "authjs.session-token",
  });
  return { name: "authjs.session-token", value, url: BASE_URL };
}

async function measure(browser, route, connected) {
  const context = await browser.newContext();
  if (connected) {
    const cookie = await sessionCookie();
    if (cookie) await context.addCookies([cookie]);
  }
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 150, downloadThroughput: (9 * 1024 * 1024) / 8, uploadThroughput: (1.5 * 1024 * 1024) / 8 });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

  const queriesBefore = queryCount;
  await page.goto(BASE_URL + route, { waitUntil: "networkidle" });
  const metrics = await page.evaluate(
    () =>
      new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const nav = performance.getEntriesByType("navigation")[0];
          const fcp = performance.getEntriesByName("first-contentful-paint")[0];
          const js = performance
            .getEntriesByType("resource")
            .filter((entry) => entry.initiatorType === "script")
            .reduce((sum, entry) => sum + entry.transferSize, 0);
          resolve({
            ttfb: Math.round(nav.responseStart),
            fcp: Math.round(fcp?.startTime ?? 0),
            lcp: Math.round(entries[entries.length - 1]?.startTime ?? 0),
            jsKb: Math.round(js / 1024),
          });
        }).observe({ type: "largest-contentful-paint", buffered: true });
      })
  );
  await page.waitForTimeout(500);
  const queries = queryCount - queriesBefore;
  await context.close();
  return { ...metrics, queries };
}

const median = (values) => values.sort((a, b) => a - b)[Math.floor(values.length / 2)];

const browser = await chromium.launch();
const rows = [];
for (const route of routes) {
  for (const connected of [false, true]) {
    const samples = [];
    for (let i = 0; i < RUNS; i++) samples.push(await measure(browser, route, connected));
    const pick = (key) => median(samples.map((sample) => sample[key]));
    rows.push(`| ${route} | ${connected ? "connecté" : "anonyme"} | ${pick("ttfb")} | ${pick("fcp")} | ${pick("lcp")} | ${pick("jsKb")} | ${pick("queries")} |`);
  }
}
await browser.close();
stopServer();

console.log(`Mesuré le ${new Date().toISOString().slice(0, 10)} — mobile 4G simulé (150 ms, 9 Mb/s, CPU ×4), médiane de ${RUNS} runs, copie de dev.db.\n`);
console.log("| Route | Session | TTFB ms | FCP ms | LCP ms | JS kB | Requêtes Prisma |");
console.log("|---|---|---|---|---|---|---|");
console.log(rows.join("\n"));
process.exit(0);
