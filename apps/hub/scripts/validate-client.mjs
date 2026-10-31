/**
 * Active une application tierce après validation à la main (carte 127), ou la désactive.
 * Usage : node scripts/validate-client.mjs "<nom du client>"            → active
 *         node scripts/validate-client.mjs "<nom du client>" --disable  → désactive
 * Adresse de la base : HUB_DATABASE_URL (en local, lue dans .env.local écrit par `pnpm db:start`).
 */
import { existsSync } from "node:fs";

for (const file of [".env.local", ".env"]) if (existsSync(file)) process.loadEnvFile(file);
const { prisma } = await import("../lib/prisma.mjs");
const { writeAudit } = await import("../lib/audit.mjs");

const [name, flag] = process.argv.slice(2);
if (!name) {
  console.error('Usage : node scripts/validate-client.mjs "<nom du client>" [--disable]');
  process.exit(1);
}
const client = await prisma.oauthClient.findFirst({ where: { name }, select: { id: true, clientId: true, skipConsent: true } });
if (!client) {
  console.error(`Aucun client nommé "${name}".`);
  process.exit(1);
}
const disabled = flag === "--disable";
await prisma.oauthClient.update({ where: { id: client.id }, data: { disabled, updatedAt: new Date() } });
await writeAudit({ action: `application ${client.clientId} ${disabled ? "désactivée" : "validée"}` });
const reminder = client.skipConsent ? "" : " (application tierce : le réglage HUB_THIRD_PARTY_APPS=1 doit aussi être actif)";
console.log(`Client "${name}" ${disabled ? "désactivé" : "validé et activé"}.${reminder}`);
await prisma.$disconnect();
