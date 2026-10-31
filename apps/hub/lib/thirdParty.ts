/**
 * Applications tierces (carte 127, ADR-0007) : outils de la communauté (bots Discord, outils de ligue) qui utilisent
 * le passeport avec l'accord du coach.
 * - Une application tierce est un client enregistré avec écran de consentement (`skipConsent` faux). Elle est créée
 *   désactivée (`register-client.mjs --tiers`) et n'est activée qu'après validation à la main (`validate-client.mjs`).
 * - Le réglage HUB_THIRD_PARTY_APPS=1 ouvre le hub aux applications tierces ; sans lui, elles sont toutes refusées.
 * - Quota : HUB_THIRD_PARTY_QUOTA demandes par heure et par application sur /api/v1/profile (1000 par défaut).
 */
import { prisma } from "./prisma.mjs";

const QUOTA_WINDOW_MS = 60 * 60 * 1000;

export const thirdPartyAppsEnabled = () => process.env.HUB_THIRD_PARTY_APPS === "1";

/** Vrai si ce client est une application tierce (avec écran de consentement). */
export async function isThirdPartyClient(clientId: string) {
  const client = await prisma.oauthClient.findUnique({ where: { clientId }, select: { skipConsent: true } });
  return Boolean(client && !client.skipConsent);
}

/**
 * Compte une demande d'une application tierce ; renvoie faux si son quota de l'heure est dépassé.
 * Les compteurs sont rangés dans la table de la limite de requêtes (clé « quota:<client> »).
 */
export async function consumeThirdPartyQuota(clientId: string, now = Date.now()) {
  const max = Number(process.env.HUB_THIRD_PARTY_QUOTA || 1000);
  const key = `quota:${clientId}`;
  const row = await prisma.rateLimit.findUnique({ where: { key } });
  if (!row || now - Number(row.lastRequest) >= QUOTA_WINDOW_MS) {
    await prisma.rateLimit.upsert({
      where: { key },
      update: { count: 1, lastRequest: BigInt(now) },
      create: { id: crypto.randomUUID(), key, count: 1, lastRequest: BigInt(now) },
    });
    return true;
  }
  if (row.count >= max) return false;
  await prisma.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
  return true;
}
