/**
 * Tests unitaires du regroupement des résultats de la recherche par sujet (revue 221).
 * Lancement : `pnpm test:unit` dans apps/site.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { groupHitsByTopic, topicHitsLabel } from "../../lib/forumSearchGroups.ts";

test("les messages d'un même sujet sont regroupés, dans l'ordre de la première apparition", () => {
  const groups = groupHitsByTopic([
    { id: "a1", topicId: "A" },
    { id: "b1", topicId: "B" },
    { id: "a2", topicId: "A" },
    { id: "c1", topicId: "C" },
    { id: "b2", topicId: "B" },
  ]);
  assert.deepEqual(groups, [
    { topicId: "A", postIds: ["a1", "a2"] },
    { topicId: "B", postIds: ["b1", "b2"] },
    { topicId: "C", postIds: ["c1"] },
  ]);
  assert.deepEqual(groupHitsByTopic([]), []);
});

test("libellé du nombre de messages trouvés dans un sujet", () => {
  assert.equal(topicHitsLabel(1), null);
  assert.equal(topicHitsLabel(12), "12 messages trouvés dans ce sujet");
  assert.equal(topicHitsLabel(1200), `${(1200).toLocaleString("fr-FR")} messages trouvés dans ce sujet`);
});
