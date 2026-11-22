/**
 * Test local en mode production du hub et du site, avant une mise en ligne (DEPLOY.md, étape 2).
 * Simule un premier déploiement : deux bases neuves, les migrations, les données de base, le site enregistré
 * auprès du hub, puis `next build` et `next start` pour les deux applications. Ne touche ni aux bases de
 * développement ni à aucune base réelle.
 *
 * Usage, à la racine : pnpm prod-local <commande>
 *   prepare [exemple|vide] : repart de deux bases locales vides (site-prodtest, hub-prodtest), applique les
 *             migrations, lance firstSetup.ts, enregistre le site auprès du hub et écrit les deux fichiers
 *             `.env.production.local`. Profil `exemple` (par défaut) : ajoute les données fictives du site
 *             (prisma/seedScript/exampleData.ts, comme `pnpm dev exemple`). Profil `vide` : données de base
 *             seulement, comme une toute première mise en ligne.
 *   build   : construit le hub puis le site en mode production
 *   start   : démarre le hub (http://localhost:4000) et le site (http://localhost:3000) ; Ctrl+C arrête les deux
 *   clean   : supprime les deux fichiers `.env.production.local` et arrête les deux bases
 *
 * Les fichiers `.env.production.local` (hors git) passent avant `.env` et `.env.local` quand Next.js tourne en
 * mode production : adresses en localhost, mode hub, secrets propres à ce test. Les adresses des bases sont
 * données directement aux commandes, car `prisma dev` peut changer de port d'un démarrage à l'autre.
 * Le reste (SMTP, ImgBB…) vient toujours du `.env` de chaque application.
 */
import { execSync, spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { freshLocalDatabase, startLocalDatabase, stopLocalDatabase } from "./local-postgres.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SITE = `${ROOT}apps/site`;
const HUB = `${ROOT}apps/hub`;
const SITE_ENV = `${SITE}/.env.production.local`;
const HUB_ENV = `${HUB}/.env.production.local`;
const CLIENT_NAME = "FranceBB site (test prod local)";
const SITE_URL = "http://localhost:3000";
const HUB_URL = "http://localhost:4000";

const command = process.argv[2];

function run(cmd, cwd, env = {}) {
  execSync(cmd, { cwd, stdio: "inherit", env: { ...process.env, ...env } });
}

function envFile(title, values) {
  const lines = Object.entries(values).map(([key, value]) => `${key}="${value}"`);
  return `# ${title}\n# Écrit par scripts/prod-local.mjs (pnpm prod-local prepare) : ne pas enregistrer dans git.\n${lines.join("\n")}\n`;
}

/** Adresses des deux bases de test, démarrées si besoin. */
function databases() {
  return { DATABASE_URL: startLocalDatabase("site-prodtest"), HUB_DATABASE_URL: startLocalDatabase("hub-prodtest") };
}

function prepare() {
  const profile = process.argv[3] ?? "exemple";
  if (!["exemple", "vide"].includes(profile)) throw new Error("Profil inconnu : pnpm prod-local prepare [exemple|vide]");
  console.log("1/5 Deux bases neuves (site-prodtest, hub-prodtest)…");
  const siteDb = freshLocalDatabase("site-prodtest");
  const hubDb = freshLocalDatabase("hub-prodtest");
  const hubSecret = randomBytes(32).toString("base64");

  console.log("2/5 Migrations du hub et du site…");
  run("npx prisma generate", HUB, { HUB_DATABASE_URL: hubDb });
  run("npx prisma migrate deploy", HUB, { HUB_DATABASE_URL: hubDb });
  run("npx prisma migrate deploy", SITE, { DATABASE_URL: siteDb });

  console.log(`3/5 Données de base du site (firstSetup.ts)${profile === "exemple" ? " et données fictives" : ""}…`);
  run("npx tsx prisma/firstSetup.ts", SITE, { DATABASE_URL: siteDb });
  if (profile === "exemple") run("npx tsx prisma/seedScript/exampleData.ts", SITE, { DATABASE_URL: siteDb });

  console.log("4/5 Site enregistré auprès du hub…");
  const clientFile = `${HUB}/.prod-local-client.json`;
  const hooksFile = `${HUB}/.prod-local-hooks.json`;
  const hubEnv = { HUB_DATABASE_URL: hubDb, BETTER_AUTH_SECRET: hubSecret };
  try {
    run(`node scripts/register-client.mjs "${CLIENT_NAME}" ${SITE_URL}/api/auth/callback/hub .prod-local-client.json`, HUB, hubEnv);
    run(`node scripts/client-hooks.mjs "${CLIENT_NAME}" ${SITE_URL}/api/hub/events ${SITE_URL}/api/hub/export .prod-local-hooks.json`, HUB, hubEnv);
    const client = JSON.parse(readFileSync(clientFile, "utf-8"));
    const hooks = JSON.parse(readFileSync(hooksFile, "utf-8"));

    console.log("5/5 Fichiers .env.production.local…");
    writeFileSync(
      HUB_ENV,
      envFile("Hub, test local en mode production", {
        BETTER_AUTH_URL: HUB_URL,
        BETTER_AUTH_SECRET: hubSecret,
        CRON_SECRET: randomBytes(32).toString("base64"),
      }),
    );
    writeFileSync(
      SITE_ENV,
      envFile("Site, test local en mode production", {
        AUTH_URL: SITE_URL,
        NEXT_PUBLIC_SITE_URL: SITE_URL,
        AUTH_SECRET: randomBytes(32).toString("base64"),
        ENCRYPTION_KEY: randomBytes(32).toString("hex"),
        AUTH_MODE: "hub",
        HUB_ISSUER: `${HUB_URL}/api/auth`,
        HUB_CLIENT_ID: client.clientId,
        HUB_CLIENT_SECRET: client.clientSecret,
        HUB_EVENTS_SECRET: hooks.eventsSecret,
      }),
    );
  } finally {
    for (const file of [clientFile, hooksFile]) if (existsSync(file)) rmSync(file);
  }
  console.log("\nPrêt. Suite : pnpm prod-local build, puis pnpm prod-local start.");
}

function build() {
  if (!existsSync(SITE_ENV) || !existsSync(HUB_ENV)) throw new Error("Lancer d'abord : pnpm prod-local prepare");
  const env = databases();
  run("corepack pnpm build", HUB, env);
  run("corepack pnpm build", SITE, env);
  console.log("\nConstruit. Suite : pnpm prod-local start.");
}

function start() {
  if (!existsSync(`${SITE}/.next/BUILD_ID`) || !existsSync(`${HUB}/.next/BUILD_ID`)) throw new Error("Lancer d'abord : pnpm prod-local build");
  // Une seule connexion à la fois vers chaque base : la base locale `prisma dev` coupe la connexion quand une page
  // lance plusieurs requêtes en parallèle (lib/prisma.ts, DATABASE_POOL_MAX). En ligne, Neon n'a pas ce défaut.
  const env = { ...process.env, ...databases(), DATABASE_POOL_MAX: "1" };
  const children = [
    spawn("corepack pnpm start", { cwd: HUB, env, stdio: "inherit", shell: true }),
    spawn("corepack pnpm start", { cwd: SITE, env, stdio: "inherit", shell: true }),
  ];
  console.log(`\nHub : ${HUB_URL}   Site : ${SITE_URL}   (Ctrl+C pour arrêter)\n`);
  const stopAll = () => children.forEach((child) => child.kill());
  process.on("SIGINT", stopAll);
  children.forEach((child) => child.on("exit", stopAll));
}

function clean() {
  for (const file of [SITE_ENV, HUB_ENV]) if (existsSync(file)) rmSync(file);
  stopLocalDatabase("site-prodtest");
  stopLocalDatabase("hub-prodtest");
  console.log("Fichiers .env.production.local supprimés, bases de test arrêtées. Penser à relancer `pnpm build` avant d'autres essais en mode production.");
}

const commands = { prepare, build, start, clean };
if (!commands[command]) {
  console.error("Usage : pnpm prod-local <prepare [exemple|vide]|build|start|clean>");
  process.exit(1);
}
commands[command]();
