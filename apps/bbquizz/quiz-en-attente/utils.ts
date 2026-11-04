/**
 * Utilitaires pour le système de Quizz Blood Bowl.
 */

/**
 * Traduit les catégories de l'anglais vers le français.
 */
export function translateCategory(category: string): string {
  if (!category) return "Autre";
  
  const mapping: Record<string, string> = {
    "rules": "Règles",
    "rosters": "Équipes",
    "positionals": "Positionnels",
    "starplayers": "Star Players",
    "star player": "Star Players",
    "skills": "Compétences",
    "divers": "Autre",
    "miscellaneous": "Autre",
    "misc": "Autre",
    "other": "Autre"
  };

  const key = String(category).trim().toLowerCase();
  
  // Recherche directe ou recherche partielle
  if (mapping[key]) return mapping[key];
  
  // Fallbacks basés sur le contenu
  if (key.includes("rule")) return "Règles";
  if (key.includes("roster")) return "Équipes";
  if (key.includes("skill")) return "Compétences";
  if (key.includes("star")) return "Star Players";
  if (key.includes("misc") || key.includes("divers") || key.includes("other")) return "Autre";

  return category;
}

/** Durée de lecture d'une question avant de pouvoir répondre (secondes). Partagée par le jeu et le serveur. */
export const QUIZ_READ_TIME = 5;

/** Durée pour répondre, après la lecture (secondes). Le bonus de rapidité vaut le nombre de secondes restantes. */
export const QUIZ_ANSWER_TIME = 30;

/** Nombre de questions d'une partie. */
export const QUIZ_LENGTH = 20;

/** Fuseau horaire des classements du BBQuizz : les journées et les semaines sont celles de la France. */
const QUIZ_TIME_ZONE = "Europe/Paris";

/**
 * Écart, en millisecondes, entre l'heure de Paris et l'heure universelle (UTC) à l'instant `date` : une heure en
 * hiver, deux heures en été. Calculé avec `Intl`, intégré à JavaScript, sans bibliothèque de fuseaux horaires.
 */
function parisOffsetMs(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: QUIZ_TIME_ZONE,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/**
 * Minuit, heure de Paris, du jour où tombe `now` (à Paris), reculé de `daysBack` jours. Le résultat est un instant
 * ordinaire (`Date`), utilisable dans une requête à la base, quelle que soit l'heure réglée sur le serveur.
 */
function parisMidnight(now: Date, daysBack: number): Date {
  const parisNow = new Date(now.getTime() + parisOffsetMs(now));
  const midnightAsUtc = Date.UTC(parisNow.getUTCFullYear(), parisNow.getUTCMonth(), parisNow.getUTCDate() - daysBack);
  // L'écart peut changer entre minuit et maintenant (passage à l'heure d'été) : on le recalcule à minuit même
  const firstGuess = midnightAsUtc - parisOffsetMs(new Date(midnightAsUtc));
  return new Date(midnightAsUtc - parisOffsetMs(new Date(firstGuess)));
}

/** Début du classement « Du jour » : aujourd'hui à minuit, heure de Paris (carte 143). */
export function startOfQuizDay(now: Date = new Date()): Date {
  return parisMidnight(now, 0);
}

/** Début du classement « Semaine » : le lundi de la semaine en cours à minuit, heure de Paris (carte 143). */
export function startOfQuizWeek(now: Date = new Date()): Date {
  const parisNow = new Date(now.getTime() + parisOffsetMs(now));
  const daysSinceMonday = (parisNow.getUTCDay() + 6) % 7; // getUTCDay : 0 pour dimanche, 1 pour lundi…
  return parisMidnight(now, daysSinceMonday);
}
