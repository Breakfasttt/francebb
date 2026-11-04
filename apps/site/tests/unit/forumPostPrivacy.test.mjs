/**
 * Tests unitaires des règles de lecture d'un message du forum (carte 164) : le texte d'un message supprimé n'est
 * envoyé à personne, celui d'un message masqué par la modération seulement à son auteur et aux modérateurs, et aucun
 * des deux ne peut être cité.
 * Lancement : `pnpm test:unit` dans apps/site (lanceur de tests intégré à Node, sans navigateur ni serveur).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { canQuotePost, hidePostContent } from "../../lib/forumPostPrivacy.ts";

const post = (flags) => ({ id: "p1", authorId: "auteur", content: "texte secret", isDeleted: false, isModerated: false, ...flags });
const visitor = { isModerator: false };
const member = { id: "autre", isModerator: false };
const author = { id: "auteur", isModerator: false };
const moderator = { id: "modo", isModerator: true };

test("un message ordinaire garde son texte pour tout le monde", () => {
  for (const viewer of [visitor, member, author, moderator]) {
    assert.equal(hidePostContent(post({}), viewer).content, "texte secret");
  }
  assert.equal(canQuotePost(post({})), true);
});

test("un message masqué n'est lisible que par son auteur et les modérateurs", () => {
  const hidden = post({ isModerated: true });
  assert.equal(hidePostContent(hidden, visitor).content, "");
  assert.equal(hidePostContent(hidden, member).content, "");
  assert.equal(hidePostContent(hidden, author).content, "texte secret");
  assert.equal(hidePostContent(hidden, moderator).content, "texte secret");
  assert.equal(canQuotePost(hidden), false);
});

test("un message supprimé n'est lisible par personne", () => {
  const deleted = post({ isDeleted: true });
  for (const viewer of [visitor, member, author, moderator]) {
    assert.equal(hidePostContent(deleted, viewer).content, "");
  }
  assert.equal(canQuotePost(deleted), false);
});

test("le message d'origine n'est pas modifié", () => {
  const hidden = post({ isModerated: true });
  hidePostContent(hidden, visitor);
  assert.equal(hidden.content, "texte secret");
});
