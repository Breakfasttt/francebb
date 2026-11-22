/**
 * Championnats des tournois (carte 227) : NAF, CDF, CGO… Ce sont des données de référence (groupe CHAMPIONSHIP,
 * `lib/referenceData.ts`), modifiables dans l'administration ; un tournoi garde la liste de leurs clés
 * (`Tournament.championships`).
 *
 * Une seule clé a un rôle dans le code : CDF, le Championnat de France, qui porte le classement, le calcul des points
 * et la validation des résultats par la modération. Elle est protégée dans l'administration : son nom et sa
 * description se modifient, mais on ne peut ni la supprimer, ni la désactiver, ni changer sa clé.
 *
 * Fichier sans accès à la base : ses fonctions servent côté serveur comme côté navigateur.
 */

/** Groupe des championnats dans les données de référence. */
export const CHAMPIONSHIP_GROUP = "CHAMPIONSHIP";

/** Clé du Championnat de France. */
export const CDF_KEY = "CDF";

/** Préfixe du paramètre de l'adresse d'un filtre de championnat sur /tournois (`ch_CDF=true`). */
export const CHAMPIONSHIP_PARAM_PREFIX = "ch_";

/** Clés protégées : elles ne se suppriment pas, ne se désactivent pas et ne changent pas de clé. */
export const PROTECTED_REFERENCE_KEYS: Record<string, string[]> = { [CHAMPIONSHIP_GROUP]: [CDF_KEY] };

/** Le tournoi compte-t-il pour le Championnat de France ? */
export function isCdf(tournament: { championships: string[] }): boolean {
  return tournament.championships.includes(CDF_KEY);
}

/**
 * Clés de championnats lues dans un formulaire, nettoyées : en capitales, lettres, chiffres, tiret et soulignement
 * seulement, sans doublon, 20 au plus. Ne garantit pas qu'elles existent : l'action les compare aux données de
 * référence.
 */
export function cleanChampionshipKeys(raw: unknown[]): string[] {
  const keys = raw
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim().toUpperCase())
    .filter((value) => /^[A-Z0-9_-]{1,20}$/.test(value));
  return [...new Set(keys)].slice(0, 20);
}

/** Liste des championnats avec ou sans le CDF, les autres clés gardées dans leur ordre. */
export function withCdf(keys: string[], cdf: boolean): string[] {
  const others = keys.filter((key) => key !== CDF_KEY);
  return cdf ? [CDF_KEY, ...others] : others;
}
