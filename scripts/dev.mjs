/**
 * Lance le site en local en une commande, sur un profil de base au choix (carte 219).
 *
 * Usage, à la racine ou dans apps/site : pnpm dev [vide|exemple|prod] [--reset] [options de next dev]
 *   vide     : structure et données de base (prisma/firstSetup.ts), sans membre ni contenu
 *   exemple  : données de base et données fictives (prisma/seedScript/exampleData.ts) — profil par défaut
 *   prod     : dernière sauvegarde `bbfrance-site-backup-AAAAMMJJ.json` de docs/backup-db, restaurée par
 *              apps/site/scripts/site-backup.ts, puis données de base. S'il n'y en a aucune, la dernière ancienne
 *              sauvegarde `.db` de la bêta est d'abord convertie à ce format (elle est gardée).
 *   --reset  : supprime la base du profil et la recrée
 *   Autres options (ex. -H 0.0.0.0) : transmises à next dev.
 *
 * Étapes : démarrer le serveur Postgres local du profil (scripts/local-postgres.mjs, qui écrit son adresse dans
 * apps/site/.env.local), le mettre à jour (migrations), le remplir au premier lancement, puis lancer next dev.
 * Le repère `devProfile` (table SiteSetting) évite de remplir deux fois. Profil prod : une sauvegarde plus récente
 * que celle restaurée recrée la base.
 */
import { execSync, spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { freshLocalDatabase, startLocalDatabase } from "./local-postgres.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SITE = `${ROOT}apps/site`;
const BACKUP_DIR = `${ROOT}docs/backup-db`;
const PROFILES = ["vide", "exemple", "prod"];

const args = process.argv.slice(2);
const profile = args.find((arg) => PROFILES.includes(arg)) ?? "exemple";
const reset = args.includes("--reset");
const unknownProfile = args.find((arg) => !arg.startsWith("-") && !PROFILES.includes(arg) && !isOptionValue(arg));
const nextArgs = args.filter((arg) => arg !== profile && arg !== "--reset");

/** Valeur d'une option de next dev (ex. « 0.0.0.0 » dans « -H 0.0.0.0 »), à ne pas prendre pour un profil. */
function isOptionValue(arg) {
  const index = args.indexOf(arg);
  return index > 0 && args[index - 1].startsWith("-") && args[index - 1] !== "--reset";
}

if (unknownProfile) {
  console.error(`Profil inconnu : « ${unknownProfile} ». Profils : ${PROFILES.join(", ")} (défaut : exemple).`);
  process.exit(1);
}

/** Lance une commande dans apps/site sur la base du profil, sortie affichée. */
function run(command, url) {
  execSync(command, { cwd: SITE, stdio: "inherit", env: { ...process.env, DATABASE_URL: url } });
}

/** Repère de la base ; vide si elle n'a jamais été remplie (ou n'a pas encore de tables). */
function readMarker(url) {
  return execSync("npx --yes tsx scripts/dev-profile.ts read", {
    cwd: SITE,
    encoding: "utf-8",
    env: { ...process.env, DATABASE_URL: url },
  }).trim();
}

/** Fichiers de docs/backup-db au nom `<préfixe>AAAAMMJJ<extension>`, du plus ancien au plus récent. */
function backups(prefix, extension) {
  if (!existsSync(BACKUP_DIR)) return [];
  return readdirSync(BACKUP_DIR)
    .filter((file) => file.startsWith(prefix) && file.endsWith(extension) && /\d{8}/.test(file))
    .sort();
}

/** Dernière sauvegarde au format du site ; convertit la dernière sauvegarde de la bêta s'il n'y en a aucune. */
function latestSiteBackup() {
  let files = backups("bbfrance-site-backup-", ".json");
  if (files.length === 0) {
    const beta = backups("bbfrance-db-backup-", ".db").at(-1);
    if (!beta) {
      console.error("Aucune sauvegarde dans docs/backup-db : impossible de remplir le profil prod.");
      process.exit(1);
    }
    console.log(`▶ Aucune sauvegarde au format du site : conversion de ${beta} (gardée telle quelle)...`);
    run(`npx --yes tsx scripts/site-backup.ts convert "${BACKUP_DIR}/${beta}"`, "");
    files = backups("bbfrance-site-backup-", ".json");
  }
  return files.at(-1);
}

const server = `site-${profile}`;
const backup = profile === "prod" ? latestSiteBackup() : null;
const expectedMarker = backup ? `prod:${backup}` : profile;

console.log(`\n▶ Profil de base : ${profile}${reset ? " (recréé)" : ""}`);
let url = reset ? freshLocalDatabase(server) : startLocalDatabase(server);
const marker = readMarker(url);

if (profile === "prod" && marker !== expectedMarker) {
  // La restauration demande une base neuve : elle applique elle-même les migrations
  if (marker) console.log(`▶ Nouvelle sauvegarde (${backup}) : la base prod locale est recréée.`);
  if (!reset) url = freshLocalDatabase(server);
  console.log(`▶ Restauration de ${backup}...`);
  run(`npx --yes tsx scripts/site-backup.ts restore "${BACKUP_DIR}/${backup}"`, url);
  run("npx --yes tsx prisma/firstSetup.ts", url);
  run(`npx --yes tsx scripts/dev-profile.ts write "${expectedMarker}"`, url);
} else {
  run("npx prisma migrate deploy", url);
  if (!marker) {
    console.log("▶ Remplissage de la base (premier lancement de ce profil)...");
    run("npx --yes tsx prisma/firstSetup.ts", url);
    if (profile === "exemple") run("npx --yes tsx prisma/seedScript/exampleData.ts", url);
    run(`npx --yes tsx scripts/dev-profile.ts write "${expectedMarker}"`, url);
  }
}

console.log(`▶ Site sur http://localhost:3000 (profil ${profile}). Connexion : bouton de développement de la page de connexion.\n`);
// Une seule connexion à la fois vers la base : la base locale `prisma dev` coupe la connexion quand une page lance
// plusieurs requêtes en parallèle (« Server has closed the connection », lib/prisma.ts, DATABASE_POOL_MAX)
const child = spawn(["npx", "next", "dev", ...nextArgs].join(" "), {
  cwd: SITE,
  stdio: "inherit",
  shell: true,
  env: { ...process.env, DATABASE_POOL_MAX: process.env.DATABASE_POOL_MAX ?? "1" },
});
child.on("exit", (code) => process.exit(code ?? 0));
