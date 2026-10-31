/**
 * Déclare (ou remplace) les adresses d'une application cliente du hub : où lui envoyer les événements signés, et où lui
 * demander les données d'un coach pour l'export (cartes 121 et 125). Crée un nouveau secret de signature à chaque appel.
 * Usage : node scripts/client-hooks.mjs "<nom du client>" <adresse des événements> [<adresse d'export>] [sortie.json]
 * Adresse de la base : HUB_DATABASE_URL (en local, lue dans .env.local écrit par `pnpm db:start`).
 *
 * Le secret n'est affiché qu'une fois : le copier dans l'application (HUB_EVENTS_SECRET), qui s'en sert pour vérifier
 * la signature des événements. Il est stocké chiffré avec BETTER_AUTH_SECRET.
 */
import { existsSync, writeFileSync } from "node:fs";
import { randomBytes, randomUUID } from "node:crypto";

for (const file of [".env.local", ".env"]) if (existsSync(file)) process.loadEnvFile(file);
const { prisma } = await import("../lib/prisma.mjs");
const { symmetricEncrypt } = await import("better-auth/crypto");

const [name, eventsUrl, exportUrl, outputFile] = process.argv.slice(2);
if (!name || !eventsUrl) {
  console.error('Usage : node scripts/client-hooks.mjs "<nom du client>" <adresse des événements> [<adresse d\'export>] [sortie.json]');
  process.exit(1);
}
for (const url of [eventsUrl, exportUrl].filter(Boolean)) {
  const { protocol, hostname } = new URL(url);
  if (protocol !== "https:" && hostname !== "localhost") {
    console.error(`Adresse refusée (https obligatoire hors de l'ordinateur local) : ${url}`);
    process.exit(1);
  }
}
if (!process.env.BETTER_AUTH_SECRET) {
  console.error("BETTER_AUTH_SECRET manquant : il sert à chiffrer le secret de signature.");
  process.exit(1);
}

const client = await prisma.oauthClient.findFirst({ where: { name }, select: { clientId: true } });
if (!client) {
  console.error(`Aucun client nommé "${name}" (l'enregistrer d'abord avec scripts/register-client.mjs).`);
  process.exit(1);
}

const secret = randomBytes(32).toString("base64url");
const encrypted = await symmetricEncrypt({ key: process.env.BETTER_AUTH_SECRET, data: secret });
await prisma.clientHook.upsert({
  where: { clientId: client.clientId },
  update: { eventsUrl, exportUrl: exportUrl || null, secret: encrypted },
  create: { id: randomUUID(), clientId: client.clientId, eventsUrl, exportUrl: exportUrl || null, secret: encrypted, createdAt: new Date() },
});
console.log(`Adresses du client "${name}" enregistrées.\nHUB_EVENTS_SECRET=${secret}`);
if (outputFile) writeFileSync(outputFile, JSON.stringify({ clientId: client.clientId, eventsSecret: secret }));
await prisma.$disconnect();
