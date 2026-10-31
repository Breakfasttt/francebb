/**
 * Signature des événements envoyés aux applications (carte 121) : HMAC SHA-256 de « <timestamp>.<corps> » avec le
 * secret d'événements de l'application. Fichier sans dépendance, partagé par lib/events.mjs et les tests.
 */
import { createHmac } from "node:crypto";

export function signEvent(secret, timestamp, body) {
  return `v1=${createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex")}`;
}
