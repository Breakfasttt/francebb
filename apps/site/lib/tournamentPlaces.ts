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

/**
 * Libellé unique des places prises (revue 221), le même dans la liste `/tournois`, la fiche et le module
 * d'inscription : « 4 / 24 places », ou « 2 / 8 équipes » pour un tournoi par équipes (on compte alors en équipes).
 * Les pré-inscrits prennent une place, la liste d'attente non.
 */
export function placesLabel(taken: number, maxParticipants: number | null, isTeam: boolean): string {
  const unit = isTeam ? "équipes" : "places";
  return maxParticipants ? `${taken} / ${maxParticipants} ${unit}` : `${taken} ${isTeam ? (taken > 1 ? "équipes" : "équipe") : taken > 1 ? "inscrits" : "inscrit"}, sans limite`;
}

/** Tournoi complet : un nombre maximal de places, toutes prises. */
export function isFull(tournament: TournamentPlacesFields & { maxParticipants: number | null }): boolean {
  return tournament.maxParticipants != null && tournament.maxParticipants > 0 && freePlaces(tournament) === 0;
}
