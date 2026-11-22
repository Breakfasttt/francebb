/**
 * Règles pures du bannissement temporaire (carte 222), utilisables par le serveur et par l'écran : durées proposées,
 * date de fin, bannissement échu, et date de fin écrite pour un humain (heure de Paris).
 */

/** Durées proposées à la modération, en jours. Un bannissement sans durée est définitif. */
export const BAN_DURATION_DAYS = [1, 7, 30] as const;
export type BanDurationDays = (typeof BAN_DURATION_DAYS)[number];

const DAY_MS = 24 * 60 * 60 * 1000;

/** Durée reçue d'une action serveur : une des durées proposées, ou `null` pour un bannissement définitif. */
export function parseBanDuration(value: unknown): BanDurationDays | null | undefined {
  if (value === null || value === undefined) return null;
  return BAN_DURATION_DAYS.find((days) => days === value);
}

/** Date de fin d'un bannissement de `days` jours commencé à `now` ; `null` pour un bannissement définitif. */
export function banEndDate(days: BanDurationDays | null, now: Date): Date | null {
  return days === null ? null : new Date(now.getTime() + days * DAY_MS);
}

/** Le bannissement est temporaire et sa date de fin est passée : il doit être levé. */
export function isBanExpired(isBanned: boolean, bannedUntil: Date | null | undefined, now: Date): boolean {
  return isBanned && !!bannedUntil && bannedUntil.getTime() <= now.getTime();
}

const banEndFormatter = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "Europe/Paris",
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** « 29/11/2026 à 14:32 », heure de Paris. */
export function formatBanEnd(date: Date): string {
  return banEndFormatter.format(date).replace(" ", " à ");
}

/** Libellé d'une durée pour les boutons et le journal : « 1 jour », « 7 jours », « Définitif ». */
export function banDurationLabel(days: BanDurationDays | null): string {
  return days === null ? "Définitif" : `${days} jour${days > 1 ? "s" : ""}`;
}
