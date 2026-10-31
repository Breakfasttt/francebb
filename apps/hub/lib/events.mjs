/**
 * Événements signés (webhooks) envoyés par le hub aux applications clientes (carte 121, ADR-0007).
 *
 * Le hub ne connaît aucune application en particulier : il prévient chaque client enregistré qui a une adresse
 * d'événements (table clientHook) et qui connaît déjà le coach concerné (il a reçu un jeton ou un consentement pour lui).
 *
 * Format d'un envoi : POST JSON { id, type, version, createdAt, data } avec les en-têtes
 *   X-BBFrance-Event-Id   identifiant unique de l'événement (le client ignore un identifiant déjà traité) ;
 *   X-BBFrance-Timestamp  date d'envoi en secondes (le client refuse un envoi de plus de 5 minutes) ;
 *   X-BBFrance-Signature  « v1=<empreinte> » : HMAC SHA-256 de « <timestamp>.<corps> » avec le secret du client.
 * Une réponse 2xx vaut accusé de réception. Sinon l'envoi est retenté plus tard (à chaque nouvel événement et par la
 * tâche planifiée quotidienne), puis abandonné après MAX_ATTEMPTS essais avec une alerte dans le journal.
 */
import { randomUUID } from "node:crypto";
import { symmetricDecrypt } from "better-auth/crypto";
import { prisma } from "./prisma.mjs";
import { writeAudit } from "./audit.mjs";
import { signEvent } from "./eventSignature.mjs";

export const EVENT_VERSION = 1;
const MAX_ATTEMPTS = 10;
const SEND_TIMEOUT_MS = 5000;
// Attente avant le prochain essai, selon le nombre d'essais déjà faits : 1 min, 5 min, 30 min, 2 h, puis 12 h
const RETRY_DELAYS_MS = [60_000, 5 * 60_000, 30 * 60_000, 2 * 3600_000, 12 * 3600_000];

/** Applications qui connaissent ce coach : un jeton, un jeton de rafraîchissement ou un consentement pour lui. */
async function clientsKnowingUser(userId) {
  // Lectures l'une après l'autre : la base locale de développement (prisma dev) ne sert qu'une requête à la fois
  const access = await prisma.oauthAccessToken.findMany({ where: { userId }, select: { clientId: true }, distinct: ["clientId"] });
  const refresh = await prisma.oauthRefreshToken.findMany({ where: { userId }, select: { clientId: true }, distinct: ["clientId"] });
  const consents = await prisma.oauthConsent.findMany({ where: { userId }, select: { clientId: true }, distinct: ["clientId"] });
  return [...new Set([...access, ...refresh, ...consents].map((row) => row.clientId))];
}

/**
 * Prépare un événement pour chaque application concernée, puis tente l'envoi tout de suite.
 * @param {string} type par exemple « user.updated »
 * @param {string} userId identifiant du coach concerné
 * @param {Record<string, unknown>} data contenu de l'événement
 * @returns {Promise<string>} identifiant de l'événement
 */
export async function emitUserEvent(type, userId, data) {
  const eventId = randomUUID();
  const clientIds = await clientsKnowingUser(userId);
  const hooks = await prisma.clientHook.findMany({ where: { clientId: { in: clientIds }, eventsUrl: { not: null } } });
  const now = new Date();
  for (const hook of hooks) {
    await prisma.outboundEvent.create({
      data: {
        id: randomUUID(),
        eventId,
        clientId: hook.clientId,
        type,
        version: EVENT_VERSION,
        payload: { id: eventId, type, version: EVENT_VERSION, createdAt: now.toISOString(), data: { userId, ...data } },
        status: "pending",
        attempts: 0,
        nextAttemptAt: now,
        createdAt: now,
      },
    });
  }
  await deliverDueEvents();
  return eventId;
}

/** Envoie un événement à son application ; renvoie le message d'erreur, ou `null` si l'application a accusé réception. */
async function send(event, hook) {
  const secret = await symmetricDecrypt({ key: process.env.BETTER_AUTH_SECRET ?? "", data: hook.secret });
  const body = JSON.stringify(event.payload);
  const timestamp = Math.floor(Date.now() / 1000).toString();
  try {
    const response = await fetch(hook.eventsUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-bbfrance-event-id": event.eventId,
        "x-bbfrance-timestamp": timestamp,
        "x-bbfrance-signature": signEvent(secret, timestamp, body),
      },
      body,
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
      redirect: "error",
    });
    return response.ok ? null : `réponse ${response.status}`;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

/** Envoie tous les événements en attente dont l'heure est venue. Appelée après chaque événement et chaque nuit. */
export async function deliverDueEvents(now = new Date()) {
  const due = await prisma.outboundEvent.findMany({
    where: { status: "pending", nextAttemptAt: { lte: now } },
    orderBy: { createdAt: "asc" },
    take: 100,
  });
  let delivered = 0;
  for (const event of due) {
    const hook = await prisma.clientHook.findUnique({ where: { clientId: event.clientId } });
    const error = hook?.eventsUrl ? await send(event, hook) : "adresse d'événements retirée";
    const attempts = event.attempts + 1;
    if (!error) {
      delivered++;
      await prisma.outboundEvent.update({ where: { id: event.id }, data: { status: "delivered", attempts, deliveredAt: new Date(), lastError: null } });
    } else if (attempts >= MAX_ATTEMPTS) {
      await prisma.outboundEvent.update({ where: { id: event.id }, data: { status: "failed", attempts, lastError: error } });
      console.error(`Événement ${event.type} abandonné pour le client ${event.clientId} après ${attempts} essais : ${error}`);
      await writeAudit({ action: `événement abandonné (${event.type}, client ${event.clientId})` });
    } else {
      const delay = RETRY_DELAYS_MS[Math.min(attempts - 1, RETRY_DELAYS_MS.length - 1)];
      await prisma.outboundEvent.update({
        where: { id: event.id },
        data: { attempts, lastError: error, nextAttemptAt: new Date(Date.now() + delay) },
      });
    }
  }
  return { due: due.length, delivered };
}
