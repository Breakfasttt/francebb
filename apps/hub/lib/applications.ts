/**
 * Applications qui ont accès au compte d'un coach (carte 120) : celles qui ont un jeton encore valable ou un
 * consentement. Le coach peut leur retirer l'accès depuis son passeport.
 */
import { prisma } from "./prisma.mjs";

export type LinkedApplication = { clientId: string; name: string; scopes: string[] };

export async function listUserApplications(userId: string): Promise<LinkedApplication[]> {
  const now = new Date();
  // Lectures l'une après l'autre : la base locale de développement (prisma dev) ne sert qu'une requête à la fois
  const refresh = await prisma.oauthRefreshToken.findMany({ where: { userId, revoked: null, expiresAt: { gt: now } }, select: { clientId: true, scopes: true } });
  const access = await prisma.oauthAccessToken.findMany({ where: { userId, revoked: null, expiresAt: { gt: now } }, select: { clientId: true, scopes: true } });
  const consents = await prisma.oauthConsent.findMany({ where: { userId }, select: { clientId: true, scopes: true } });
  const scopesByClient = new Map<string, Set<string>>();
  for (const row of [...refresh, ...access, ...consents]) {
    const scopes = scopesByClient.get(row.clientId) ?? new Set<string>();
    row.scopes.forEach((scope) => scopes.add(scope));
    scopesByClient.set(row.clientId, scopes);
  }
  const clients = await prisma.oauthClient.findMany({ where: { clientId: { in: [...scopesByClient.keys()] } }, select: { clientId: true, name: true } });
  return clients.map((client) => ({ clientId: client.clientId, name: client.name ?? client.clientId, scopes: [...(scopesByClient.get(client.clientId) ?? [])] }));
}

/** Retire l'accès d'une application : jetons révoqués et consentement effacé. Elle devra redemander la connexion. */
export async function revokeUserApplication(userId: string, clientId: string) {
  const now = new Date();
  await prisma.$transaction([
    prisma.oauthAccessToken.updateMany({ where: { userId, clientId, revoked: null }, data: { revoked: now } }),
    prisma.oauthRefreshToken.updateMany({ where: { userId, clientId, revoked: null }, data: { revoked: now } }),
    prisma.oauthConsent.deleteMany({ where: { userId, clientId } }),
  ]);
}

/**
 * Adresse de retour vers l'application qui a ouvert le passeport, seulement si elle appartient à un client enregistré
 * (même origine qu'une de ses adresses de retour). Sinon `null` : le hub n'affiche aucun lien vers une application.
 */
export async function validReturnLink(clientId: unknown, returnTo: unknown) {
  if (typeof clientId !== "string" || typeof returnTo !== "string") return null;
  let target: URL;
  try {
    target = new URL(returnTo);
  } catch {
    return null;
  }
  if (target.protocol !== "https:" && target.hostname !== "localhost") return null;
  const client = await prisma.oauthClient.findUnique({ where: { clientId }, select: { name: true, redirectUris: true, postLogoutRedirectUris: true, disabled: true } });
  if (!client || client.disabled) return null;
  const origins = [...client.redirectUris, ...client.postLogoutRedirectUris].map((uri) => {
    try {
      return new URL(uri).origin;
    } catch {
      return null;
    }
  });
  return origins.includes(target.origin) ? { name: client.name ?? "l'application", url: target.toString() } : null;
}
