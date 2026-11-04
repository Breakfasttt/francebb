/**
 * Tests unitaires du classement de la Coupe de France (cartes 162 et 163) :
 * - un coach est reconnu par son compte, puis son numéro NAF, puis son nom ; les coachs supprimés (anonymisés) sont
 *   écartés et reçoivent chacun un nom différent ;
 * - un rang vide est refusé, et le nombre de rondes saisies avec les résultats sert au calcul des points quand
 *   l'organisateur n'a pas annoncé le nombre de rondes.
 * Lancement : `pnpm test:unit` dans apps/site (lanceur de tests intégré à Node, sans navigateur ni serveur).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { anonymousCoachName, isAnonymizedResult, rankingCoachKey, GHOST_USER_ID } from "../../lib/rankingCoach.ts";
import { calculateCdfPoints, cdfRoundsCount, isValidRank } from "../../common/utils/cdf.ts";

const result = (fields) => ({ userId: null, nafNumber: null, coachName: "Grobi", ...fields });

test("un coach est reconnu par son compte, puis son numéro NAF, puis son nom", () => {
  assert.equal(rankingCoachKey(result({ userId: "u1", nafNumber: "123" })), "USER-u1");
  assert.equal(rankingCoachKey(result({ nafNumber: "123" })), "NAF-123");
  assert.equal(rankingCoachKey(result({})), "NAME-Grobi");
  // Le compte fantôme ne sert jamais de clé : il regroupe tous les comptes supprimés
  assert.equal(rankingCoachKey(result({ userId: GHOST_USER_ID, nafNumber: "9" })), "NAF-9");
});

test("les résultats d'un compte supprimé sont reconnus comme anonymisés", () => {
  assert.equal(isAnonymizedResult(result({ userId: GHOST_USER_ID })), true);
  assert.equal(isAnonymizedResult(result({ coachName: "Coach anonyme" })), true);
  assert.equal(isAnonymizedResult(result({ coachName: "Coach anonyme 7f3a" })), true);
  assert.equal(isAnonymizedResult(result({ userId: "u1" })), false);
  assert.equal(isAnonymizedResult(result({ coachName: "Coach anonymement célèbre" })), false);
});

test("chaque résultat anonymisé reçoit un nom différent", () => {
  assert.equal(anonymousCoachName("cmabc0001xyz7f3a"), "Coach anonyme 7f3a");
  assert.notEqual(anonymousCoachName("cmabc0001xyz7f3a"), anonymousCoachName("cmabc0001xyz8b2c"));
});

test("un rang vide, nul ou négatif est refusé", () => {
  for (const rank of [null, undefined, "", 0, -1, 1.5, "abc"]) assert.equal(isValidRank(rank), false, String(rank));
  for (const rank of [1, 2, "3"]) assert.equal(isValidRank(rank), true, String(rank));
});

test("le nombre de rondes : annoncé, sinon saisi, sinon 3 par jour", () => {
  assert.equal(cdfRoundsCount(6, 4, "2"), 6);
  assert.equal(cdfRoundsCount(null, 4, "2"), 4);
  assert.equal(cdfRoundsCount(null, 0, "2"), 6);
  assert.equal(cdfRoundsCount(null, 0, null), 3);
});

test("le vainqueur d'un tournoi de 51 à 60 coachs en 5 rondes reçoit 100 points", () => {
  assert.equal(calculateCdfPoints("INDIVIDUEL", 5, 55, 1), 100);
  assert.ok(calculateCdfPoints("INDIVIDUEL", 5, 55, 2) < 100);
});
