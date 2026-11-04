/**
 * Tests unitaires des règles de lecture du forum (carte 166) : la position de lecture ne recule jamais, et un sujet
 * est non lu quand son dernier message est plus récent que cette position (ou, pour un sujet jamais ouvert, que la
 * date « tout est lu avant le… » du membre).
 * Lancement : `pnpm test:unit` dans apps/site (lanceur de tests intégré à Node, sans navigateur ni serveur).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { advanceReadPosition, effectiveReadPosition, isPositionAfter, isTopicUnread, shouldCountTopicView } from "../../lib/forumReadPosition.ts";

const at = (minute) => new Date(Date.UTC(2026, 10, 4, 12, minute));
const position = (minute, postId) => ({ at: at(minute), postId });

test("une position plus tardive est après, la même date se départage par l'identifiant du message", () => {
  assert.equal(isPositionAfter(position(5, "a"), position(4, "z")), true);
  assert.equal(isPositionAfter(position(4, "z"), position(5, "a")), false);
  assert.equal(isPositionAfter(position(5, "b"), position(5, "a")), true);
  assert.equal(isPositionAfter(position(5, "a"), position(5, "a")), false);
  // Un identifiant vide (« tout est lu jusqu'à cette date ») passe avant les messages de la même date
  assert.equal(isPositionAfter(position(5, "a"), position(5, null)), true);
});

test("la première lecture enregistre le dernier message affiché", () => {
  assert.deepEqual(advanceReadPosition(null, position(3, "p20")), position(3, "p20"));
});

test("lire la page suivante fait avancer la position", () => {
  assert.deepEqual(advanceReadPosition(position(3, "p20"), position(9, "p40")), position(9, "p40"));
});

test("revenir sur une page déjà lue ne fait pas reculer la position", () => {
  assert.equal(advanceReadPosition(position(9, "p40"), position(3, "p20")), null);
  assert.equal(advanceReadPosition(position(9, "p40"), position(9, "p40")), null);
});

test("un sujet jamais ouvert suit la date « tout est lu avant le… »", () => {
  const readAllAt = at(30);
  assert.equal(isTopicUnread(at(10), null, readAllAt), false, "dernier message avant cette date : lu");
  assert.equal(isTopicUnread(at(31), null, readAllAt), true, "dernier message après cette date : non lu");
});

test("un sujet déjà ouvert suit sa propre position, même plus ancienne que « tout est lu avant le… »", () => {
  const readAllAt = at(30);
  // Lu jusqu'à la minute 5, dernier message à la minute 10 : reste non lu (ce qui n'avait pas été lu ne change pas)
  assert.equal(isTopicUnread(at(10), position(5, "p1"), readAllAt), true);
  assert.equal(isTopicUnread(at(10), position(10, "p2"), readAllAt), false);
  // « Marquer non lu à partir du premier message » : position à la date zéro
  assert.equal(isTopicUnread(at(10), { at: new Date(0), postId: null }, readAllAt), true);
});

test("la position effective d'un sujet jamais ouvert est la date « tout est lu avant le… »", () => {
  assert.deepEqual(effectiveReadPosition(null, at(30)), { at: at(30), postId: null });
  assert.deepEqual(effectiveReadPosition(position(5, "p1"), at(30)), position(5, "p1"));
});

test("compteur de vues (carte 169) : une vue par visite où le membre lit du nouveau", () => {
  const now = new Date(Date.UTC(2026, 10, 4, 12, 0));
  const minutesAgo = (minutes) => new Date(now.getTime() - minutes * 60_000);
  // Première ouverture du sujet
  assert.equal(shouldCountTopicView(null, true, now), true);
  assert.equal(shouldCountTopicView(null, false, now), true);
  // Pages suivantes pendant la même visite : pas de nouvelle vue
  assert.equal(shouldCountTopicView(minutesAgo(2), true, now), false);
  // Retour plus tard sans nouveau message lu (rechargement, page déjà lue) : pas de nouvelle vue
  assert.equal(shouldCountTopicView(minutesAgo(120), false, now), false);
  // Retour plus tard pour lire de nouveaux messages : une vue
  assert.equal(shouldCountTopicView(minutesAgo(120), true, now), true);
});
