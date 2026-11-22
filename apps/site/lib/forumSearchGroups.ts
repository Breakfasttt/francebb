/**
 * Regroupement des résultats de la recherche du forum par sujet (revue 221) : un sujet où le mot revient douze fois
 * n'occupe plus douze lignes, mais une seule (« 12 messages trouvés dans ce sujet »). Règle pure, sans accès à la base,
 * testée par `tests/unit/forumSearchGroups.test.mjs`.
 */

/** Un message trouvé, dans l'ordre d'affichage (pertinence ou date). */
export interface SearchHit {
  id: string;
  topicId: string;
}

/** Un sujet des résultats : ses messages trouvés, le premier étant celui qui le représente (le mieux placé). */
export interface SearchTopicGroup {
  topicId: string;
  postIds: string[];
}

/** Regroupe les messages par sujet, dans l'ordre où chaque sujet apparaît pour la première fois. */
export function groupHitsByTopic(hits: SearchHit[]): SearchTopicGroup[] {
  const groups = new Map<string, SearchTopicGroup>();
  for (const hit of hits) {
    const group = groups.get(hit.topicId);
    if (group) group.postIds.push(hit.id);
    else groups.set(hit.topicId, { topicId: hit.topicId, postIds: [hit.id] });
  }
  return [...groups.values()];
}

/** « 12 messages trouvés dans ce sujet » ; rien pour un seul message. */
export function topicHitsLabel(count: number): string | null {
  return count > 1 ? `${count.toLocaleString("fr-FR")} messages trouvés dans ce sujet` : null;
}
