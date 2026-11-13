/**
 * Droits d'un membre sur un tournoi (carte 201), écrits à un seul endroit.
 *
 * Avant cette carte, la règle « organisateur, commissaire ou modérateur » était recopiée douze fois (actions du forum
 * et des tournois, pages de modification, de résultats et du sujet), et celle du paiement deux fois. Règles pures,
 * sans accès à la base : l'appelant lit le tournoi avec son organisateur et ses commissaires, puis demande ici.
 * Vérifiées par `tests/unit/tournamentRights.test.mjs`.
 */

/** Membre qui agit : `id` absent pour un visiteur. */
export interface TournamentViewer {
  id?: string | null;
  isModerator?: boolean;
}

/** Ce qu'il faut savoir d'un tournoi pour décider : son organisateur et ses commissaires. */
export interface TournamentStaff {
  organizerId: string;
  commissaires: { id: string }[];
}

/** Organisateur ou commissaire du tournoi. */
export function isTournamentStaff(viewer: TournamentViewer, tournament: TournamentStaff): boolean {
  if (!viewer.id) return false;
  return tournament.organizerId === viewer.id || tournament.commissaires.some((commissaire) => commissaire.id === viewer.id);
}

/**
 * Peut gérer le tournoi (le modifier, saisir les résultats, le terminer, l'annuler, gérer les inscriptions) :
 * organisateur, commissaire ou modérateur du site.
 */
export function canManageTournament(viewer: TournamentViewer, tournament: TournamentStaff): boolean {
  return !!viewer.id && (!!viewer.isModerator || isTournamentStaff(viewer, tournament));
}

/**
 * Peut voir et modifier l'état de paiement des inscrits : l'organisateur et les commissaires seulement, pas la
 * modération du site (décision du responsable du projet, carte 177). Un modérateur peut nommer un commissaire si
 * l'organisateur est absent.
 */
export function canManagePayments(viewer: TournamentViewer, tournament: TournamentStaff): boolean {
  return isTournamentStaff(viewer, tournament);
}
