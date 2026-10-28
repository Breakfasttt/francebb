/**
 * Enregistre (une fois) une app BBFrance comme cliente OIDC de confiance du hub et affiche ses identifiants.
 * Usage : node --env-file=.env scripts/register-client.mjs <nom> <redirect_uri> [sortie.json]
 * Écriture directe en base : l'API admin du plugin exige une session admin, inexistante au premier démarrage.
 * Le secret n'est affiché qu'à la création (stocké haché) : le copier dans le .env de l'app cliente
 * (HUB_CLIENT_ID / HUB_CLIENT_SECRET). Relancé avec un nom existant : ne recrée rien.
 */
import { randomBytes, randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";
import { prisma } from "../lib/prisma.mjs";
import { hashClientSecret } from "../lib/clientSecret.mjs";

const [name, redirectUri, outputFile] = process.argv.slice(2);
if (!name || !redirectUri) {
  console.error("Usage : register-client.mjs <nom> <redirect_uri> [sortie.json]");
  process.exit(1);
}

const existing = await prisma.oauthClient.findFirst({ where: { name } });
if (existing) {
  console.log(`Client "${name}" déjà enregistré : ${existing.clientId} (secret non réaffichable)`);
  process.exit(0);
}

const clientId = randomBytes(16).toString("base64url");
const clientSecret = randomBytes(32).toString("base64url");
const now = new Date();
// Tableaux stockés en JSON texte (SQLite), comme le fait l'adapter Prisma de Better Auth
await prisma.oauthClient.create({
  data: {
    id: randomUUID(),
    clientId,
    clientSecret: await hashClientSecret(clientSecret),
    name,
    redirectUris: JSON.stringify([redirectUri]),
    tokenEndpointAuthMethod: "client_secret_basic",
    grantTypes: JSON.stringify(["authorization_code", "refresh_token"]),
    responseTypes: JSON.stringify(["code"]),
    // App BBFrance : pas d'écran de consentement, déconnexion globale autorisée
    skipConsent: true,
    enableEndSession: true,
    requirePKCE: true,
    disabled: false,
    createdAt: now,
    updatedAt: now,
  },
});
console.log(`Client "${name}" créé.\nHUB_CLIENT_ID=${clientId}\nHUB_CLIENT_SECRET=${clientSecret}`);
if (outputFile) writeFileSync(outputFile, JSON.stringify({ clientId, clientSecret }));
