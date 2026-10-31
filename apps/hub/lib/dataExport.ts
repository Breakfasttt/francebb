/**
 * Export des données personnelles d'un coach (carte 125, droit d'accès et de portabilité du RGPD).
 * Le hub rassemble ses propres données, puis demande les leurs à chaque application qui connaît le coach et qui a
 * déclaré une adresse d'export (scripts/client-hooks.mjs). La demande est un message signé, comme les événements :
 * { id, type: "user.export", version, createdAt, data: { userId } }. L'application répond en JSON avec ses données.
 * Une application injoignable n'empêche pas l'export : sa partie indique l'erreur.
 */
import { randomUUID } from "node:crypto";
import { prisma } from "./prisma.mjs";
import { auditHash, writeAudit } from "./audit.mjs";
import { EVENT_VERSION, clientsKnowingUser, signedPost } from "./events.mjs";
import { publicProfile } from "./profile";
import { listUserApplications } from "./applications";

const EXPORT_TIMEOUT_MS = 10_000;

/** Ce que le hub sait du coach. Ni secret, ni jeton : seulement des informations lisibles. */
async function hubData(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const accounts = await prisma.account.findMany({ where: { userId }, select: { providerId: true, createdAt: true } });
  const sessions = await prisma.session.findMany({ where: { userId }, select: { createdAt: true, expiresAt: true, ipAddress: true, userAgent: true } });
  const audit = await prisma.auditLog.findMany({ where: { userHash: auditHash(userId) }, select: { action: true, createdAt: true }, orderBy: { createdAt: "asc" } });
  return {
    profile: { ...publicProfile(user), email: user.email, emailVerified: user.emailVerified, banned: Boolean(user.banned), deletionScheduledAt: user.deletionScheduledAt },
    connectionMethods: accounts,
    sessions,
    applications: await listUserApplications(userId),
    securityLog: audit,
  };
}

export async function exportUserData(userId: string) {
  const apps: Record<string, unknown> = {};
  const clientIds = await clientsKnowingUser(userId);
  const hooks = await prisma.clientHook.findMany({ where: { clientId: { in: clientIds }, exportUrl: { not: null } } });
  for (const hook of hooks) {
    const client = await prisma.oauthClient.findUnique({ where: { clientId: hook.clientId }, select: { name: true } });
    const label = client?.name ?? hook.clientId;
    const payload = { id: randomUUID(), type: "user.export", version: EVENT_VERSION, createdAt: new Date().toISOString(), data: { userId } };
    try {
      const response = await signedPost(hook.exportUrl!, hook, payload, EXPORT_TIMEOUT_MS);
      apps[label] = response.ok ? await response.json() : { error: `L'application a répondu ${response.status}.` };
    } catch {
      apps[label] = { error: "L'application n'a pas répondu. Réessaie plus tard ou contacte-la." };
    }
  }
  await writeAudit({ action: "export des données", userId });
  return { exportedAt: new Date().toISOString(), hub: await hubData(userId), applications: apps };
}
