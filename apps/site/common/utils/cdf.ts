/**
 * Utilitaire de calcul des points pour le Classement National CDF
 * Basé sur le règlement officiel : https://teamfrancebb.1fr1.net/t2706-reglement-championnat-de-france
 */

export type CdfTournamentType = "INDIVIDUEL" | "EQUIPE_PARTIELLE" | "EQUIPE_TOTALE";

/**
 * Calcule les points CDF pour un participant.
 * 
 * @param type Le type de tournoi (INDIVIDUEL, EQUIPE_PARTIELLE, EQUIPE_TOTALE)
 * @param numRounds Le nombre de rondes du tournoi
 * @param numParticipants Le nombre total de participants (Nc)
 * @param rank Le rang final du participant (Pl)
 * @returns Les points calculés, arrondis à 4 décimales.
 */
export function calculateCdfPoints(
  type: CdfTournamentType,
  numRounds: number,
  numParticipants: number,
  rank: number
): number {
  if (numParticipants < 2) return 0;
  if (rank < 1) rank = 1;
  if (rank > numParticipants) rank = numParticipants;

  // 1. Détermination de R_ref (pour 51-60 participants et 5 rondes)
  let rRef = 100;
  let roundDeltaLarge = 10;
  let roundDeltaSmall = 1;
  let bracketDelta = 1;

  if (type === "EQUIPE_PARTIELLE") {
    rRef = 98;
    roundDeltaLarge = 9.8;
    roundDeltaSmall = 0.98;
    bracketDelta = 0.98;
  } else if (type === "EQUIPE_TOTALE") {
    rRef = 92;
    roundDeltaLarge = 10;
    roundDeltaSmall = 1;
    bracketDelta = 0.92;
  }

  // 2. Ajustement par rapport au nombre de rondes (par rapport à 5 rondes)
  let rAtRounds = rRef;
  if (numRounds < 5) {
    rAtRounds = rRef - (5 - numRounds) * roundDeltaLarge;
  } else if (numRounds > 5) {
    rAtRounds = rRef + (numRounds - 5) * roundDeltaSmall;
  }

  // 3. Ajustement par tranche de 10 participants (Bracket Adjustment)
  // L'index B vaut 0 pour 51-60 joueurs
  const b = Math.floor((numParticipants - 1) / 10) - 5;
  const rFinal = rAtRounds + (b * bracketDelta);

  // 4. Application de la formule CDF
  // Points = R * (Nc - Pl) / (Nc + Pl - 2)
  if (numParticipants + rank - 2 === 0) {
     // Cas Nc=1, Pl=1 (mais on a géré numParticipants < 2 au début)
     return parseFloat(rFinal.toFixed(4));
  }

  const points = rFinal * (numParticipants - rank) / (numParticipants + rank - 2);

  // Le vainqueur (Pl=1) doit avoir exactement Rfinal
  if (rank === 1) return parseFloat(rFinal.toFixed(4));

  return parseFloat(points.toFixed(4));
}

/**
 * Nombre de rondes utilisé dans le calcul des points CDF (carte 162), dans cet ordre de préférence :
 * 1. le nombre de rondes annoncé par l'organisateur dans la fiche du tournoi (`totalMatches`) ;
 * 2. sinon, le nombre de rondes saisies avec les résultats (onglet « Matchs ») ;
 * 3. sinon seulement, une estimation de 3 rondes par jour de tournoi ;
 * 4. et 5 rondes si même la durée est inconnue.
 * Avant la carte 162, les rondes saisies avec les résultats étaient ignorées et l'estimation de 3 par jour l'emportait.
 */
export function cdfRoundsCount(
  totalMatches: number | null | undefined,
  enteredRounds: number,
  days: string | null | undefined
): number {
  if (totalMatches && totalMatches > 0) return totalMatches;
  if (enteredRounds > 0) return enteredRounds;
  const estimated = parseInt(days || "1", 10) * 3;
  return estimated > 0 ? estimated : 5;
}

/**
 * Vrai si le rang saisi est un nombre entier à partir de 1. Un rang vide, nul ou négatif est refusé à l'enregistrement
 * des résultats d'un tournoi CDF (carte 162) : auparavant, le calcul le ramenait à 1 et le coach recevait les points
 * du vainqueur.
 */
export function isValidRank(rank: unknown): boolean {
  if (rank === null || rank === undefined || rank === "") return false;
  const value = Number(rank);
  return Number.isInteger(value) && value >= 1;
}
