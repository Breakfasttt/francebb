/**
 * Nombre de places prises d'un tournoi (cartes 130 et 150). Le filtre « Places restantes » de `/tournois` et
 * l'affichage « x / y places » des listes de tournois utilisent ce même calcul, pour ne jamais se contredire.
 */

/**
 * Comptages à demander à la base pour calculer les places prises : à placer sous `_count` dans le `select` ou
 * l'`include` d'une requête Prisma sur les tournois. Les inscriptions en liste d'attente ne prennent pas de place.
 */
export const TAKEN_PLACES_COUNT = {
  select: {
    registrations: { where: { status: { not: "WAITING_LIST" as const } } },
    teams: { where: { status: { not: "WAITING_LIST" as const } } },
  },
};

/** Champs du tournoi nécessaires au calcul des places prises. */
export interface TournamentPlacesFields {
  isTeam: boolean;
  currentParticipants: number;
  _count: { registrations: number; teams: number };
}

/**
 * Places prises : inscriptions individuelles (ou équipes, pour un tournoi par équipes) hors liste d'attente.
 * `currentParticipants` est un nombre importé de l'ancien site, que les inscriptions faites sur le nouveau site ne
 * mettent pas à jour : il ne compte que s'il est plus grand, pour les anciens tournois dont les inscriptions n'ont
 * pas été importées.
 */
export function takenPlaces(tournament: TournamentPlacesFields): number {
  const counted = tournament.isTeam ? tournament._count.teams : tournament._count.registrations;
  return Math.max(counted, tournament.currentParticipants);
}

/**
 * Places encore libres (carte 186) : places maximales moins places prises. Un tournoi sans nombre maximal de places
 * est illimité (`Infinity`). Les inscriptions (`joinTournament`, `createTeam`) et la montée de la liste d'attente
 * utilisent ce calcul, le même que l'affichage : un tournoi affiché « 30 / 30 » n'accepte plus de pré-inscription.
 */
export function freePlaces(tournament: TournamentPlacesFields & { maxParticipants: number | null }): number {
  if (tournament.maxParticipants == null) return Infinity;
  return Math.max(0, tournament.maxParticipants - takenPlaces(tournament));
}
