/**
 * Purge quotidienne de la base du hub (carte 118, ADR-0007) : on ne garde pas les données plus longtemps qu'utile.
 * - journal d'audit : lignes de plus d'un an ;
 * - sessions et vérifications (liens magiques) expirées, avec l'adresse IP et le navigateur qu'elles contiennent ;
 * - compteurs de la limite de requêtes inactifs depuis un jour.
 * Appelée chaque nuit par la tâche planifiée de Vercel (app/api/cron/purge/route.ts, vercel.json).
 */
import { prisma } from "./prisma.mjs";

const DAY_MS = 24 * 60 * 60 * 1000;
export const AUDIT_RETENTION_DAYS = 365;

export async function purgeExpiredData(now = new Date()) {
  const [auditLogs, sessions, verifications, rateLimits] = await prisma.$transaction([
    prisma.auditLog.deleteMany({ where: { createdAt: { lt: new Date(now.getTime() - AUDIT_RETENTION_DAYS * DAY_MS) } } }),
    prisma.session.deleteMany({ where: { expiresAt: { lt: now } } }),
    prisma.verification.deleteMany({ where: { expiresAt: { lt: now } } }),
    // lastRequest est un nombre de millisecondes (format de Better Auth)
    prisma.rateLimit.deleteMany({ where: { lastRequest: { lt: BigInt(now.getTime() - DAY_MS) } } }),
  ]);
  return { auditLogs: auditLogs.count, sessions: sessions.count, verifications: verifications.count, rateLimits: rateLimits.count };
}
