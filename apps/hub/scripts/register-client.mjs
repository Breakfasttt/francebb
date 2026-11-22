/**
 * Enregistre (une fois) une application cliente OIDC du hub et affiche ses identifiants.
 * Usage : node --env-file=.env scripts/register-client.mjs <nom> <redirect_uri> [sortie.json] [--tiers]
 * - Sans --tiers : application FranceBB de confiance, sans écran de consentement, active tout de suite.
 * - Avec --tiers : application tierce (carte 127). Écran de consentement, jamais l'email, et créée DÉSACTIVÉE :
 *   l'activer avec scripts/validate-client.mjs après l'avoir examinée (procédure : docs/features/hub/README.md).
 * Écriture directe en base : l'API admin du plugin exige une session admin, inexistante au premier démarrage.
 * Le secret n'est affiché qu'à la création (stocké haché) : le copier dans le .env de l'app cliente
 * (HUB_CLIENT_ID / HUB_CLIENT_SECRET). Relancé avec un nom existant : ne recrée rien et ne touche pas au secret, mais
 * complète les droits (portées) et les adresses de retour qui manqueraient (22/11/2026 : un client enregistré avant la
 * carte 119 n'avait pas les portées bbfrance:profile, et la connexion du site échouait en « invalid_scope »).
 */
import { randomBytes, randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";
import { prisma } from "../lib/prisma.mjs";
import { hashClientSecret } from "../lib/clientSecret.mjs";

const thirdParty = process.argv.includes("--tiers");
const [name, redirectUri, outputFile] = process.argv.slice(2).filter((arg) => arg !== "--tiers");
if (!name || !redirectUri) {
  console.error("Usage : register-client.mjs <nom> <redirect_uri> [sortie.json] [--tiers]");
  process.exit(1);
}

// Droits demandables par l'application : à lister explicitement (une liste vide n'en autorise aucun)
// Une application tierce ne peut jamais demander l'email du coach
const SCOPES = thirdParty
  ? ["openid", "profile", "offline_access", "bbfrance:profile", "bbfrance:profile:write"]
  : ["openid", "profile", "email", "offline_access", "bbfrance:profile", "bbfrance:profile:write"];
const postLogoutRedirectUri = `${new URL(redirectUri).origin}/`;

const existing = await prisma.oauthClient.findFirst({ where: { name } });
if (existing) {
  // Mise à niveau sans toucher au secret : seulement les droits et adresses qui manquent (jamais l'email pour une tierce)
  const allowed = existing.skipConsent ? SCOPES : SCOPES.filter((scope) => scope !== "email");
  const scopes = [...new Set([...existing.scopes, ...allowed])];
  const redirectUris = [...new Set([...existing.redirectUris, redirectUri])];
  const postLogoutRedirectUris = [...new Set([...(existing.postLogoutRedirectUris ?? []), postLogoutRedirectUri])];
  const changed =
    scopes.length !== existing.scopes.length ||
    redirectUris.length !== existing.redirectUris.length ||
    postLogoutRedirectUris.length !== (existing.postLogoutRedirectUris ?? []).length;
  if (changed) {
    await prisma.oauthClient.update({ where: { id: existing.id }, data: { scopes, redirectUris, postLogoutRedirectUris, updatedAt: new Date() } });
    console.log(`Client "${name}" déjà enregistré : ${existing.clientId}. Droits et adresses complétés (secret inchangé, non réaffichable).`);
  } else {
    console.log(`Client "${name}" déjà enregistré : ${existing.clientId}, déjà à jour (secret non réaffichable).`);
  }
  process.exit(0);
}

const clientId = randomBytes(16).toString("base64url");
const clientSecret = randomBytes(32).toString("base64url");
const now = new Date();
await prisma.oauthClient.create({
  data: {
    id: randomUUID(),
    clientId,
    clientSecret: await hashClientSecret(clientSecret),
    name,
    redirectUris: [redirectUri],
    // Après déconnexion globale (/auth/logout du site), le hub renvoie vers la page d'accueil de l'application
    postLogoutRedirectUris: [postLogoutRedirectUri],
    tokenEndpointAuthMethod: "client_secret_basic",
    grantTypes: ["authorization_code", "refresh_token"],
    responseTypes: ["code"],
    scopes: SCOPES,
    // Application FranceBB : pas d'écran de consentement ; application tierce : consentement du coach obligatoire
    skipConsent: !thirdParty,
    enableEndSession: true,
    requirePKCE: true,
    disabled: thirdParty,
    createdAt: now,
    updatedAt: now,
  },
});
console.log(`Client "${name}" créé.\nHUB_CLIENT_ID=${clientId}\nHUB_CLIENT_SECRET=${clientSecret}`);
if (thirdParty) console.log("Application tierce créée désactivée : l'activer avec scripts/validate-client.mjs après validation.");
if (outputFile) writeFileSync(outputFile, JSON.stringify({ clientId, clientSecret }));
