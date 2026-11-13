/**
 * Tests unitaires de la pile des pages visitées dans le site (carte 196), qui décide si le bouton retour peut revenir
 * à la page précédente sans quitter le site.
 * Lancement : `pnpm test:unit` dans apps/site (lanceur de tests intégré à Node, sans navigateur ni serveur).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { canGoBackInApp, nextHistoryStack } from "../../common/utils/inAppHistory.ts";

/** Pile obtenue en visitant les adresses dans l'ordre. */
function visit(...pathnames) {
  return pathnames.reduce((stack, pathname) => nextHistoryStack(stack, pathname), []);
}

test("une page ouverte directement n'a pas de page précédente dans le site", () => {
  assert.deepEqual(visit("/statistiques"), ["/statistiques"]);
  assert.equal(canGoBackInApp(visit("/statistiques")), false);
});

test("une page atteinte depuis une autre page du site peut y revenir", () => {
  assert.deepEqual(visit("/forum", "/statistiques"), ["/forum", "/statistiques"]);
  assert.equal(canGoBackInApp(visit("/forum", "/statistiques")), true);
});

test("revenir à l'avant-dernière page retire une page de la pile", () => {
  const stack = visit("/forum", "/statistiques", "/forum");
  assert.deepEqual(stack, ["/forum"]);
  assert.equal(canGoBackInApp(stack), false);
});

test("un changement des seuls paramètres de l'adresse ne compte pas comme une page", () => {
  assert.deepEqual(visit("/membres", "/membres"), ["/membres"]);
});

test("la pile d'origine n'est pas modifiée", () => {
  const stack = ["/forum"];
  nextHistoryStack(stack, "/membres");
  assert.deepEqual(stack, ["/forum"]);
});
