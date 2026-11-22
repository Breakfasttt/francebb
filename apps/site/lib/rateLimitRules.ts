/**
 * Règles pures de la limite d'actions par minute (carte 224), sans base de données : seuils par type d'action, minute
 * comptée, dépassement. Testées par `tests/unit/rateLimitRules.test.mjs`. Le compteur lui-même est dans `lib/rateLimit.ts`.
 */

/** Nombre d'actions permises par minute et par membre. Assez large pour un usage normal, bloquant pour un script. */
export const RATE_LIMITS = {
  TOPIC: 3,
  POST: 10,
  PRIVATE_MESSAGE: 20,
  REPORT: 5,
  REACTION: 30,
  SEARCH: 20,
} as const;

export type RateLimitedAction = keyof typeof RATE_LIMITS;

/** Message affiché au membre qui dépasse la limite. */
export const RATE_LIMIT_MESSAGE = "Doucement : attends une minute avant de recommencer.";

/** Début de la minute qui contient `now` (secondes et millisecondes à zéro). */
export function rateWindowStart(now: Date): Date {
  const start = new Date(now.getTime());
  start.setUTCSeconds(0, 0);
  return start;
}

/** Le compte `count`, une fois l'action en cours ajoutée, dépasse la limite de cette action. */
export function isOverRateLimit(action: RateLimitedAction, count: number): boolean {
  return count > RATE_LIMITS[action];
}
