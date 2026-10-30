/**
 * Bases de données Postgres locales du projet, sans Docker.
 * Chaque base est un petit serveur Postgres lancé par `prisma dev` (fourni par Prisma, rien à installer),
 * qui tourne en arrière-plan. Un serveur ne contient qu'une base : d'où un serveur par usage.
 *
 * `prisma dev` choisit lui-même ses ports : l'adresse obtenue au démarrage est donc enregistrée dans
 * `.local-postgres.json` (racine du dépôt, hors git), et, pour les bases de développement, écrite dans le
 * `.env.local` de l'application (fichier lu automatiquement par Next.js et Prisma en local, prioritaire sur `.env`).
 *
 * Usage : node scripts/local-postgres.mjs <commande> <base>
 *   commandes : start (démarre si besoin), fresh (repart d'une base vide), stop, url (affiche l'adresse)
 *   bases     : site, site-e2e (tests du site), hub, hub-e2e (tests du hub), shadow (vérification des migrations)
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const STATE_FILE = `${ROOT}.local-postgres.json`;

// Base de développement : variable écrite dans le .env.local de l'application
const DEV_ENV = {
  site: { file: `${ROOT}apps/site/.env.local`, variable: "DATABASE_URL" },
  hub: { file: `${ROOT}apps/hub/.env.local`, variable: "HUB_DATABASE_URL" },
};
export const LOCAL_DATABASES = ["site", "site-e2e", "hub", "hub-e2e", "shadow"];

// `npx prisma` doit être lancé depuis une application qui a Prisma dans ses dépendances
const PRISMA_CWD = `${ROOT}apps/site`;

function prisma(args, { ignoreErrors = false } = {}) {
  try {
    return execSync(`npx prisma ${args}`, { cwd: PRISMA_CWD, encoding: "utf-8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (error) {
    if (ignoreErrors) return "";
    throw error;
  }
}

function readState() {
  return existsSync(STATE_FILE) ? JSON.parse(readFileSync(STATE_FILE, "utf-8")) : {};
}

function writeState(state) {
  writeFileSync(STATE_FILE, `${JSON.stringify(state, null, 2)}\n`);
}

function serverName(name) {
  return `bbfrance-${name}`;
}

function isRunning(name) {
  const list = prisma("dev ls", { ignoreErrors: true });
  // Le mot entier « running » : l'état d'une base arrêtée, « not_running », le contient aussi (carte 066)
  return list.split("\n").some((line) => line.includes(` ${serverName(name)} `) && /\srunning(\s|$)/.test(line));
}

function writeDevEnv(name, url) {
  const target = DEV_ENV[name];
  if (!target) return;
  const header = "# Écrit par scripts/local-postgres.mjs : adresse de la base Postgres locale (ne pas enregistrer dans git)\n";
  writeFileSync(target.file, `${header}${target.variable}="${url}"\n`);
}

/** Adresse de la base `name`, ou null si elle n'a jamais été démarrée. */
export function localDatabaseUrl(name) {
  return readState()[name] ?? null;
}

/** Démarre la base si besoin et renvoie son adresse. */
export function startLocalDatabase(name) {
  const known = localDatabaseUrl(name);
  if (known && isRunning(name)) {
    writeDevEnv(name, known);
    return known;
  }
  prisma(`dev stop ${serverName(name)}`, { ignoreErrors: true });
  const output = prisma(`dev --name ${serverName(name)} --detach`);
  const url = output.match(/postgres:\/\/postgres:postgres@localhost:\d+\/template1\?sslmode=disable/)?.[0];
  if (!url) throw new Error(`Adresse introuvable dans la sortie de prisma dev :\n${output}`);
  writeState({ ...readState(), [name]: url });
  writeDevEnv(name, url);
  return url;
}

/** Supprime la base (toutes ses données) puis en redémarre une vide. Réservé aux bases de test. */
export function freshLocalDatabase(name) {
  prisma(`dev stop ${serverName(name)}`, { ignoreErrors: true });
  prisma(`dev rm --force ${serverName(name)}`, { ignoreErrors: true });
  const state = readState();
  delete state[name];
  writeState(state);
  return startLocalDatabase(name);
}

export function stopLocalDatabase(name) {
  prisma(`dev stop ${serverName(name)}`, { ignoreErrors: true });
}

// Lancement en ligne de commande
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [command, name] = process.argv.slice(2);
  if (!LOCAL_DATABASES.includes(name) || !["start", "fresh", "stop", "url"].includes(command)) {
    console.error(`Usage : node scripts/local-postgres.mjs <start|fresh|stop|url> <${LOCAL_DATABASES.join("|")}>`);
    process.exit(1);
  }
  if (command === "start") console.log(startLocalDatabase(name));
  if (command === "fresh") console.log(freshLocalDatabase(name));
  if (command === "stop") stopLocalDatabase(name);
  if (command === "url") console.log(localDatabaseUrl(name) ?? "(base jamais démarrée : lancer la commande start)");
}
