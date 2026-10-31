/**
 * Vérification d'un événement signé du hub, côté application qui le reçoit (carte 121).
 * Fichier de référence, sans dépendance, à recopier dans chaque application cliente (le site : carte 122 ; plus tard
 * packages/auth-client, carte 039). Le hub ne l'utilise que dans ses tests.
 *
 * Refuse : une signature fausse, un envoi de plus de 5 minutes (rejeu d'un vieux message capturé), et un identifiant
 * d'événement déjà traité (l'application fournit `alreadySeen`, qui consulte sa propre mémoire des identifiants reçus).
 * L'application n'enregistre un identifiant qu'APRÈS avoir traité l'événement avec succès : un traitement raté doit
 * pouvoir être renvoyé par le hub sans être pris pour un doublon.
 */
import { createHmac, timingSafeEqual } from "node:crypto";

export const MAX_EVENT_AGE_SECONDS = 5 * 60;

/**
 * @param {{ secret: string, body: string, headers: { get(name: string): string | null },
 *           alreadySeen: (eventId: string) => boolean | Promise<boolean>, now?: number }} input
 *   `body` est le corps brut reçu, avant tout JSON.parse : la signature porte sur ces octets exacts.
 * @returns {Promise<{ ok: true, event: { id: string, type: string, version: number, createdAt: string, data: Record<string, unknown> } } | { ok: false, reason: string }>}
 */
export async function verifyHubEvent({ secret, body, headers, alreadySeen, now = Date.now() }) {
  const eventId = headers.get("x-bbfrance-event-id");
  const timestamp = headers.get("x-bbfrance-timestamp");
  const signature = headers.get("x-bbfrance-signature");
  if (!eventId || !timestamp || !signature) return { ok: false, reason: "en-têtes de signature manquants" };

  const expected = Buffer.from(`v1=${createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex")}`);
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return { ok: false, reason: "signature invalide" };

  const age = Math.abs(now / 1000 - Number(timestamp));
  if (!Number.isFinite(age) || age > MAX_EVENT_AGE_SECONDS) return { ok: false, reason: "envoi trop ancien" };

  const event = JSON.parse(body);
  if (event.id !== eventId) return { ok: false, reason: "identifiant incohérent" };
  if (await alreadySeen(eventId)) return { ok: false, reason: "événement déjà reçu" };
  return { ok: true, event };
}
