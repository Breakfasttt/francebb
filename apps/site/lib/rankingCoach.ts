/**
 * Reconnaître un coach dans les résultats de tournoi, pour le classement national (carte 163).
 * Fichier sans dépendance (ni base de données ni autre fichier du projet) : il est testé seul par
 * `tests/unit/rankingCoach.test.mjs`.
 *
 * Un même coach peut apparaître dans plusieurs tournois sous des formes différentes : lié à son compte du site, avec
 * seulement son numéro NAF (le numéro de l'association internationale des joueurs de tournoi), ou avec seulement son
 * nom. Le classement le reconnaît dans cet ordre : son compte, puis son numéro NAF, puis son nom.
 *
 * Quand un membre supprime son compte, ses résultats sont gardés mais rattachés au compte fantôme et renommés
 * « Coach anonyme » suivi de quatre caractères (lib/accountDeletion.ts). Ces résultats anonymisés ne comptent plus au
 * classement : on ne sait plus à qui ils appartiennent, et les additionner fabriquerait un faux coach.
 */

/** Identifiant du compte fantôme « Coach Inconnu », qui reçoit les contenus des comptes supprimés. */
export const GHOST_USER_ID = "ghost_coach";

/** Début du nom donné à un coach supprimé dans les résultats et les matchs de tournoi. */
export const ANONYMOUS_COACH_NAME = "Coach anonyme";

/**
 * Nom anonyme d'un résultat de tournoi : « Coach anonyme » suivi des 4 derniers caractères de l'identifiant du
 * résultat (par exemple « Coach anonyme 7f3a »). Le nom est différent pour chaque résultat, parce que la base interdit
 * deux résultats au même nom dans un même tournoi. On prend la fin de l'identifiant, et non le début : le début d'un
 * identifiant dépend de l'heure de création et se ressemble d'une ligne à l'autre.
 */
export function anonymousCoachName(resultId: string): string {
  return `${ANONYMOUS_COACH_NAME} ${resultId.slice(-4)}`;
}

export interface RankingResultIdentity {
  userId: string | null;
  nafNumber: string | null;
  coachName: string;
}

/**
 * Vrai pour un résultat dont le coach a supprimé son compte : rattaché au compte fantôme, ou renommé « Coach anonyme »
 * (y compris les résultats anonymisés avant la carte 163, qui portent le nom seul, sans les quatre caractères).
 */
export function isAnonymizedResult(result: RankingResultIdentity): boolean {
  if (result.userId === GHOST_USER_ID) return true;
  return result.coachName === ANONYMOUS_COACH_NAME || result.coachName.startsWith(`${ANONYMOUS_COACH_NAME} `);
}

/**
 * Clé qui regroupe les résultats d'un même coach au classement : le compte lié s'il existe (et n'est pas le compte
 * fantôme), sinon le numéro NAF, sinon le nom.
 */
export function rankingCoachKey(result: RankingResultIdentity): string {
  if (result.userId && result.userId !== GHOST_USER_ID) return `USER-${result.userId}`;
  if (result.nafNumber) return `NAF-${result.nafNumber}`;
  return `NAME-${result.coachName}`;
}
