/**
 * Vérification d'un message signé du hub (événement ou demande d'export), recopiée du code de référence du hub
 * (apps/hub/lib/verifyEvent.mjs, carte 121) : le site n'importe jamais le code du hub, il en garde sa copie.
 * Refuse une signature fausse, un envoi de plus de 5 minutes et un identifiant déjà traité.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

export const MAX_EVENT_AGE_SECONDS = 5 * 60;

export type HubEvent = { id: string; type: string; version: number; createdAt: string; data: Record<string, unknown> & { userId: string } };

// Identifiants déjà traités par ce serveur. Mémoire limitée à une instance : les traitements sont de toute façon
// sans effet s'ils sont rejoués (ils écrivent l'état reçu), et un vieux message est refusé par sa date.
const seen = new Set<string>();

export function verifyHubEvent(
  secret: string,
  body: string,
  headers: Headers,
  now = Date.now(),
): { ok: true; event: HubEvent } | { ok: false; reason: string } {
  const eventId = headers.get("x-bbfrance-event-id");
  const timestamp = headers.get("x-bbfrance-timestamp");
  const signature = headers.get("x-bbfrance-signature");
  if (!eventId || !timestamp || !signature) return { ok: false, reason: "en-têtes de signature manquants" };

  const expected = Buffer.from(`v1=${createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex")}`);
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return { ok: false, reason: "signature invalide" };

  const age = Math.abs(now / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > MAX_EVENT_AGE_SECONDS) return { ok: false, reason: "envoi trop ancien" };

  const event = JSON.parse(body) as HubEvent;
  if (event.id !== eventId) return { ok: false, reason: "identifiant incohérent" };
  if (seen.has(eventId)) return { ok: false, reason: "événement déjà reçu" };
  return { ok: true, event };
}

/** À appeler une fois l'événement traité avec succès (un échec doit pouvoir être renvoyé par le hub). */
export function markHubEventHandled(eventId: string) {
  seen.add(eventId);
  if (seen.size > 5000) seen.delete(seen.values().next().value!);
}
