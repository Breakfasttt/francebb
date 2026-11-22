/**
 * Règle pure des modérateurs propres à un forum (carte 225), sans base de données : un membre inscrit comme
 * modérateur d'un forum modère ce forum et tous ses sous-forums. Testée par `tests/unit/forumModeratorRules.test.mjs`.
 */

/**
 * Le forum `forumId` est-il dans le périmètre d'un membre qui modère les forums `assigned` ? On remonte les forums
 * parents (`parentOf` : forum vers son parent, `null` pour un forum de premier niveau) ; une boucle est arrêtée.
 */
export function isForumInModeratorScope(forumId: string, assigned: ReadonlySet<string>, parentOf: (id: string) => string | null | undefined): boolean {
  const seen = new Set<string>();
  let current: string | null | undefined = forumId;
  while (current && !seen.has(current)) {
    if (assigned.has(current)) return true;
    seen.add(current);
    current = parentOf(current);
  }
  return false;
}
