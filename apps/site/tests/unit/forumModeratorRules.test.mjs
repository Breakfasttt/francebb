/**
 * Tests unitaires des modérateurs propres à un forum (carte 225) : un forum, ses sous-forums, jamais un forum voisin.
 * Lancement : `pnpm test:unit` dans apps/site.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { isForumInModeratorScope } from "../../lib/forumModeratorRules.ts";

// ligue -> ligue-annonces -> ligue-archives ; tournois à part
const PARENTS = new Map([["ligue", null], ["ligue-annonces", "ligue"], ["ligue-archives", "ligue-annonces"], ["tournois", null]]);
const parentOf = (id) => PARENTS.get(id);

test("le forum lui-même et tous ses sous-forums", () => {
  const assigned = new Set(["ligue"]);
  assert.equal(isForumInModeratorScope("ligue", assigned, parentOf), true);
  assert.equal(isForumInModeratorScope("ligue-annonces", assigned, parentOf), true);
  assert.equal(isForumInModeratorScope("ligue-archives", assigned, parentOf), true);
});

test("jamais un forum voisin ni un forum parent", () => {
  assert.equal(isForumInModeratorScope("tournois", new Set(["ligue"]), parentOf), false);
  assert.equal(isForumInModeratorScope("ligue", new Set(["ligue-annonces"]), parentOf), false);
  assert.equal(isForumInModeratorScope("ligue", new Set(), parentOf), false);
});

test("une boucle de parents s'arrête", () => {
  const loop = new Map([["a", "b"], ["b", "a"]]);
  assert.equal(isForumInModeratorScope("a", new Set(["z"]), (id) => loop.get(id)), false);
});
