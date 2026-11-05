/**
 * Dates des tournois (carte 187) : une seule règle, partagée par l'accueil, la carte, la liste `/tournois`, la fiche
 * d'une ligue, les badges « Passé » et le module d'inscription. Ce fichier n'importe rien, pour pouvoir être testé
 * directement par Node (`tests/unit/tournamentDates.test.mjs`).
 *
 * La règle : un tournoi est « à venir ou en cours » tant que son dernier jour (sa date de fin, ou sa date de début
 * s'il n'a pas de date de fin) n'est pas passé, en jour de Paris. Il reste donc affiché pendant tout son dernier jour,
 * jusqu'à minuit heure de Paris. Avant cette carte, l'accueil et la carte le retiraient dès l'heure de son premier
 * jour, la liste dès son deuxième jour, et la fiche d'une ligue ne regardait pas la date du tout.
 *
 * Le formulaire enregistre les dates à minuit en temps universel (`new Date("AAAA-MM-JJ")`), ce qui tombe le même jour
 * à Paris (1 heure ou 2 heures du matin). D'anciens tournois importés ont une heure : la règle compare des jours,
 * pas des heures, et reste juste pour eux.
 */

const PARIS_TIME_ZONE = "Europe/Paris";

/** Formateur qui donne le jour de Paris d'un instant, sous la forme « AAAA-MM-JJ » (le format canadien est celui-là). */
const parisDayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: PARIS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Formateur qui donne l'heure de Paris d'un instant (0 à 23). */
const parisHourFormatter = new Intl.DateTimeFormat("en-GB", { timeZone: PARIS_TIME_ZONE, hour: "2-digit", hourCycle: "h23" });

/** Jour de Paris d'une date, sous la forme « AAAA-MM-JJ » : deux jours se comparent comme deux textes. */
export function parisDayKey(date: Date | string): string {
  return parisDayFormatter.format(new Date(date));
}

/** Champs d'un tournoi utiles à la règle des dates. */
export interface TournamentDates {
  date: Date | string;
  endDate?: Date | string | null;
}

/** Dernier jour du tournoi : sa date de fin, ou sa date de début s'il n'en a pas. */
export function tournamentLastDay(tournament: TournamentDates): Date {
  return new Date(tournament.endDate ?? tournament.date);
}

/** Vrai tant que le dernier jour du tournoi n'est pas passé, en jour de Paris (le tournoi est à venir ou en cours). */
export function isTournamentUpcomingOrOngoing(tournament: TournamentDates, now: Date = new Date()): boolean {
  return parisDayKey(tournamentLastDay(tournament)) >= parisDayKey(now);
}

/** Vrai quand le dernier jour du tournoi est passé : le tournoi est fini, que ses résultats aient été saisis ou non. */
export function isTournamentOver(tournament: TournamentDates, now: Date = new Date()): boolean {
  return !isTournamentUpcomingOrOngoing(tournament, now);
}

/**
 * Instant où commence le jour de Paris de `now` (minuit, heure de Paris). Un dernier jour enregistré à cet instant
 * ou après n'est pas encore passé : c'est la limite utilisée dans les requêtes à la base.
 */
export function parisDayStart(now: Date = new Date()): Date {
  const [year, month, day] = parisDayKey(now).split("-").map(Number);
  const utcMidnight = Date.UTC(year, month - 1, day);
  // À minuit en temps universel, il est 1 heure (heure d'hiver) ou 2 heures (heure d'été) à Paris : c'est le décalage.
  // Les changements d'heure se font à 1 heure du matin en temps universel, donc après cet instant : le décalage lu
  // ici est bien celui de minuit à Paris.
  const offsetHours = Number(parisHourFormatter.format(new Date(utcMidnight)));
  return new Date(utcMidnight - offsetHours * 60 * 60 * 1000);
}

/**
 * Condition à ajouter à une requête Prisma sur les tournois pour ne garder que ceux à venir ou en cours (même règle
 * que `isTournamentUpcomingOrOngoing`) : date de fin pas encore passée, ou, sans date de fin, date de début pas encore
 * passée. À placer dans un `AND` pour ne pas écraser un autre `OR` de la requête.
 */
export function upcomingTournamentWhere(now: Date = new Date()) {
  const dayStart = parisDayStart(now);
  return {
    OR: [{ endDate: { gte: dayStart } }, { endDate: null, date: { gte: dayStart } }],
  };
}

/**
 * Raison du refus des dates d'un tournoi, ou `null` si elles sont acceptées : la date de début est obligatoire et
 * valide, et la date de fin, si elle est donnée, ne tombe pas avant la date de début.
 */
export function tournamentDatesError(start: Date, end: Date | null): string | null {
  if (Number.isNaN(start.getTime())) return "La date de début du tournoi est obligatoire.";
  if (end && Number.isNaN(end.getTime())) return "La date de fin du tournoi n'est pas valide.";
  if (end && parisDayKey(end) < parisDayKey(start)) return "La date de fin ne peut pas être avant la date de début.";
  return null;
}
