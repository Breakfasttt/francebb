/**
 * Suppression d'un compte, orchestrée par le hub (carte 123, ADR-0007, droit à l'effacement du RGPD).
 *
 * 1. Le coach demande la suppression depuis son passeport : effacement prévu dans 30 jours (délai de grâce). Les
 *    applications perdent l'accès (jetons révoqués, événement `user.deletion_scheduled`) et ne peuvent plus obtenir
 *    de connexion. Le coach peut encore se connecter au passeport, seulement pour annuler. Un email le confirme.
 * 2. Sept jours avant l'effacement, un email de rappel part (tâche quotidienne).
 * 3. À la date prévue, la tâche quotidienne envoie `user.deleted` à chaque application qui connaît le coach. Chacune
 *    efface ou anonymise ses données à sa façon, puis accuse réception.
 * 4. Quand toutes les applications ont accusé réception, le hub efface ses propres données. Il garde seulement :
 *    l'empreinte du pseudo (il reste réservé), celle de l'email si le compte était banni (pas de retour par un nouveau
 *    compte), et le journal d'audit, où le compte n'apparaît que sous forme d'empreinte (effacé après un an).
 *    Si une application ne répond pas, l'effacement attend et une alerte est écrite.
 */
import { prisma } from "./prisma.mjs";
import { auditHash, writeAudit } from "./audit.mjs";
import { emitUserEvent } from "./events.mjs";
import { sendAccountEmail } from "./mail";

const DAY_MS = 24 * 60 * 60 * 1000;
export const DELETION_GRACE_DAYS = 30;
const REMINDER_DAYS_BEFORE = 7;

const formatDate = (date: Date) => date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" });

/** Retire l'accès de toutes les applications : jetons révoqués, consentements effacés. */
async function revokeAllApplications(userId: string) {
  const now = new Date();
  await prisma.oauthAccessToken.updateMany({ where: { userId, revoked: null }, data: { revoked: now } });
  await prisma.oauthRefreshToken.updateMany({ where: { userId, revoked: null }, data: { revoked: now } });
  await prisma.oauthConsent.deleteMany({ where: { userId } });
}

export async function requestDeletion(userId: string, currentSessionToken?: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (user.deletionScheduledAt) return user.deletionScheduledAt;
  const scheduledAt = new Date(Date.now() + DELETION_GRACE_DAYS * DAY_MS);
  await prisma.user.update({ where: { id: userId }, data: { deletionScheduledAt: scheduledAt, deletionReminderSentAt: null } });
  // Les autres appareils sont déconnectés ; celui qui fait la demande reste connecté, pour pouvoir annuler
  await prisma.session.deleteMany({ where: { userId, ...(currentSessionToken ? { token: { not: currentSessionToken } } : {}) } });
  await emitUserEvent("user.deletion_scheduled", userId, { scheduledAt: scheduledAt.toISOString() });
  await revokeAllApplications(userId);
  await writeAudit({ action: "suppression demandée", userId });
  await sendAccountEmail(
    user.email,
    "Suppression de ton compte BBFrance",
    `Bonjour ${user.name},\n\nTu as demandé la suppression de ton compte BBFrance. Il sera effacé le ${formatDate(scheduledAt)}, ainsi que tes données dans toutes les applications BBFrance.\n\nD'ici là, tu peux annuler : connecte-toi à ton passeport Blood Bowl (${process.env.BETTER_AUTH_URL}) et clique sur « Annuler la suppression ».\n\nSi tu n'as rien demandé, connecte-toi tout de suite pour annuler.`,
  );
  return scheduledAt;
}

export async function cancelDeletion(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.deletionScheduledAt || user.deletionEventId) return false;
  await prisma.user.update({ where: { id: userId }, data: { deletionScheduledAt: null, deletionReminderSentAt: null } });
  await emitUserEvent("user.deletion_cancelled", userId, {});
  await writeAudit({ action: "suppression annulée", userId });
  return true;
}

/** Efface les données du hub pour ce compte, une fois que toutes les applications ont traité `user.deleted`. */
async function eraseFromHub(user: { id: string; email: string; nameKey: string | null; banned: boolean | null }) {
  const now = new Date();
  if (user.nameKey) {
    const nameHash = auditHash(user.nameKey)!;
    await prisma.reservedName.upsert({ where: { nameHash }, update: {}, create: { id: crypto.randomUUID(), nameHash, createdAt: now } });
  }
  if (user.banned) {
    const emailHash = auditHash(user.email.toLowerCase())!;
    await prisma.bannedEmail.upsert({ where: { emailHash }, update: {}, create: { id: crypto.randomUUID(), emailHash, createdAt: now } });
  }
  await prisma.$transaction([
    prisma.oauthAccessToken.deleteMany({ where: { userId: user.id } }),
    prisma.oauthRefreshToken.deleteMany({ where: { userId: user.id } }),
    prisma.oauthConsent.deleteMany({ where: { userId: user.id } }),
    prisma.session.deleteMany({ where: { userId: user.id } }),
    prisma.account.deleteMany({ where: { userId: user.id } }),
    // Liens magiques encore en attente : l'email est rangé dans la valeur de la vérification
    prisma.verification.deleteMany({ where: { value: { contains: user.email } } }),
    // Les événements déjà envoyés contiennent l'identifiant et le profil du coach
    prisma.outboundEvent.deleteMany({ where: { payload: { path: ["data", "userId"], equals: user.id } } }),
    prisma.user.delete({ where: { id: user.id } }),
  ]);
  await writeAudit({ action: "compte effacé", userId: user.id });
}

/**
 * Tâche quotidienne : rappels, envoi de `user.deleted` aux comptes arrivés à échéance, puis effacement au hub des
 * comptes dont toutes les applications ont accusé réception.
 */
export async function processDeletions(now = new Date()) {
  const result = { reminders: 0, started: 0, erased: 0, blocked: 0 };

  const toRemind = await prisma.user.findMany({
    where: { deletionScheduledAt: { lte: new Date(now.getTime() + REMINDER_DAYS_BEFORE * DAY_MS), gt: now }, deletionReminderSentAt: null },
  });
  for (const user of toRemind) {
    await sendAccountEmail(
      user.email,
      "Ton compte BBFrance sera effacé bientôt",
      `Bonjour ${user.name},\n\nComme demandé, ton compte BBFrance sera effacé le ${formatDate(user.deletionScheduledAt!)}. Pour annuler, connecte-toi à ton passeport Blood Bowl (${process.env.BETTER_AUTH_URL}).`,
    );
    await prisma.user.update({ where: { id: user.id }, data: { deletionReminderSentAt: now } });
    result.reminders++;
  }

  const due = await prisma.user.findMany({ where: { deletionScheduledAt: { lte: now }, deletionEventId: null } });
  for (const user of due) {
    const eventId = await emitUserEvent("user.deleted", user.id, {});
    await prisma.user.update({ where: { id: user.id }, data: { deletionEventId: eventId } });
    result.started++;
  }

  const inProgress = await prisma.user.findMany({ where: { deletionEventId: { not: null } } });
  for (const user of inProgress) {
    const deliveries = await prisma.outboundEvent.findMany({ where: { eventId: user.deletionEventId! }, select: { clientId: true, status: true } });
    if (deliveries.every((delivery) => delivery.status === "delivered")) {
      await eraseFromHub(user);
      result.erased++;
    } else if (deliveries.some((delivery) => delivery.status === "failed")) {
      const clients = deliveries.filter((delivery) => delivery.status === "failed").map((delivery) => delivery.clientId);
      console.error(`Suppression bloquée : l'application ${clients.join(", ")} n'a pas accusé réception de user.deleted.`);
      await writeAudit({ action: `suppression bloquée (client ${clients.join(", ")})`, userId: user.id });
      result.blocked++;
    }
  }
  return result;
}

/** Vrai si l'email appartenait à un compte banni puis supprimé : il ne peut pas servir à un nouveau compte. */
export async function isBannedEmail(email: string) {
  return Boolean(await prisma.bannedEmail.findUnique({ where: { emailHash: auditHash(email.toLowerCase()) ?? "" } }));
}
