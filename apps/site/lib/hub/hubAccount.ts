/**
 * Lien entre un membre du site et son passeport sur le hub (mode hub, ADR-0007, carte 122).
 * - Le membre est rattaché au coach du hub par l'identifiant du hub (`sub`), rangé dans Account.providerAccountId
 *   (provider « hub ») : jamais par le pseudo ni par l'email, qui peuvent changer.
 * - Les champs du passeport (pseudo, avatar, NAF, région) se modifient au hub par PATCH /api/v1/profile, avec le jeton
 *   d'accès du membre ; le site garde une copie, tenue à jour par les événements du hub (lib/hub/hubEvents.ts).
 * Fichier volontairement PAS « use server » : fonctions internes, l'appelant vérifie les droits.
 */
import { prisma } from "@/lib/prisma";

const HUB_PROVIDER = "hub";

/** Adresse du hub (sans /api/auth), déduite de HUB_ISSUER. */
export function hubOrigin() {
  return process.env.HUB_ISSUER ? new URL(process.env.HUB_ISSUER).origin : null;
}

/** Membre du site rattaché à ce coach du hub, ou null. */
export async function findUserByHubId(hubUserId: string) {
  const account = await prisma.account.findUnique({
    where: { provider_providerAccountId: { provider: HUB_PROVIDER, providerAccountId: hubUserId } },
    select: { userId: true },
  });
  return account?.userId ?? null;
}

/** Jeton d'accès du membre auprès du hub, renouvelé avec le jeton de rafraîchissement s'il a expiré. */
async function getHubAccessToken(userId: string) {
  const account = await prisma.account.findFirst({ where: { userId, provider: HUB_PROVIDER } });
  if (!account?.access_token) return null;
  const stillValid = account.expires_at && account.expires_at * 1000 > Date.now() + 30_000;
  if (stillValid) return account.access_token;
  if (!account.refresh_token || !process.env.HUB_ISSUER) return null;

  const credentials = Buffer.from(`${process.env.HUB_CLIENT_ID}:${process.env.HUB_CLIENT_SECRET}`).toString("base64");
  const response = await fetch(`${process.env.HUB_ISSUER}/oauth2/token`, {
    method: "POST",
    headers: { authorization: `Basic ${credentials}`, "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: account.refresh_token }),
  });
  if (!response.ok) return null;
  const tokens = (await response.json()) as { access_token: string; refresh_token?: string; expires_in?: number };
  await prisma.account.update({
    where: { id: account.id },
    data: {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token ?? account.refresh_token,
      expires_at: tokens.expires_in ? Math.floor(Date.now() / 1000) + tokens.expires_in : null,
    },
  });
  return tokens.access_token;
}

export type HubProfileUpdate = { name?: string; image?: string | null; naf?: string | null; region?: string | null };

/**
 * Envoie au hub une modification du passeport faite depuis le profil du site.
 * Renvoie une erreur lisible (pseudo déjà pris, NAF invalide…) ou null si le hub a accepté.
 */
export async function updateHubProfile(userId: string, update: HubProfileUpdate): Promise<string | null> {
  const token = await getHubAccessToken(userId);
  if (!token) return "Ta connexion au passeport a expiré : déconnecte-toi puis reconnecte-toi.";
  const response = await fetch(`${hubOrigin()}/api/v1/profile`, {
    method: "PATCH",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(update),
  });
  if (response.ok) return null;
  const body = (await response.json().catch(() => ({}))) as { message?: string; errors?: Record<string, string> };
  return Object.values(body.errors ?? {})[0] ?? body.message ?? "Le passeport n'a pas accepté la modification.";
}
