/**
 * Tests unitaires des règles de suppression du forum (carte 165) : qui peut supprimer un sujet ou un message, et
 * dans quels cas la suppression est refusée.
 * Lancement : `pnpm test:unit` dans apps/site (lanceur de tests intégré à Node, sans navigateur ni serveur).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { canRestorePost, decidePostDeletion, postDeletedBy, topicDeletionRefusal } from "../../lib/forumDeletion.ts";

const base = {
  viewerId: "auteur",
  viewerIsModerator: false,
  post: { authorId: "auteur", isDeleted: false },
  isFirstPost: false,
  otherVisiblePosts: 3,
  topicHasTournament: false,
};

test("l'auteur supprime sa réponse : seule la réponse est supprimée", () => {
  assert.deepEqual(decidePostDeletion(base), { kind: "deletePost", byModeration: false });
});

test("l'auteur supprime le premier message d'un sujet sans réponse : le sujet est supprimé", () => {
  assert.deepEqual(decidePostDeletion({ ...base, isFirstPost: true, otherVisiblePosts: 0 }), { kind: "deleteTopic" });
});

test("l'auteur ne peut pas supprimer le premier message d'un sujet qui a des réponses, ni celui d'un tournoi", () => {
  assert.equal(decidePostDeletion({ ...base, isFirstPost: true }).kind, "refuse");
  assert.equal(decidePostDeletion({ ...base, isFirstPost: true, otherVisiblePosts: 0, topicHasTournament: true }).kind, "refuse");
});

test("un membre ne peut pas supprimer le message d'un autre", () => {
  assert.equal(decidePostDeletion({ ...base, viewerId: "autre" }).kind, "refuse");
});

test("un modérateur supprime le message d'un autre avec une raison, pas sans", () => {
  const moderator = { ...base, viewerId: "modo", viewerIsModerator: true };
  assert.equal(decidePostDeletion(moderator).kind, "refuse");
  assert.equal(decidePostDeletion({ ...moderator, reason: "   " }).kind, "refuse");
  assert.deepEqual(decidePostDeletion({ ...moderator, reason: "Spam" }), { kind: "deletePost", byModeration: true });
  // Le premier message se retire en supprimant le sujet
  assert.equal(decidePostDeletion({ ...moderator, reason: "Spam", isFirstPost: true }).kind, "refuse");
});

test("un message déjà supprimé ne se supprime pas une seconde fois", () => {
  assert.equal(decidePostDeletion({ ...base, post: { authorId: "auteur", isDeleted: true } }).kind, "refuse");
});

test("seul un modérateur supprime un sujet, et pas s'il porte un tournoi avec des résultats non annulé", () => {
  const ok = { viewerIsModerator: true, isDeleted: false, tournament: null };
  assert.equal(topicDeletionRefusal(ok), null);
  assert.notEqual(topicDeletionRefusal({ ...ok, viewerIsModerator: false }), null);
  assert.notEqual(topicDeletionRefusal({ ...ok, isDeleted: true }), null);
  assert.notEqual(topicDeletionRefusal({ ...ok, tournament: { isCancelled: false, resultCount: 8 } }), null);
  assert.equal(topicDeletionRefusal({ ...ok, tournament: { isCancelled: true, resultCount: 8 } }), null);
  assert.equal(topicDeletionRefusal({ ...ok, tournament: { isCancelled: false, resultCount: 0 } }), null);
});

test("on distingue un message supprimé par son auteur et par la modération", () => {
  assert.equal(postDeletedBy({ isDeleted: false, authorId: "a", deletedById: null }), null);
  assert.equal(postDeletedBy({ isDeleted: true, authorId: "a", deletedById: null }), "author");
  assert.equal(postDeletedBy({ isDeleted: true, authorId: "a", deletedById: "a" }), "author");
  assert.equal(postDeletedBy({ isDeleted: true, authorId: "a", deletedById: "modo" }), "moderation");
  assert.equal(canRestorePost({ isDeleted: true, authorId: "a", deletedById: "modo" }, true), true);
  assert.equal(canRestorePost({ isDeleted: true, authorId: "a", deletedById: "a" }, true), false);
  assert.equal(canRestorePost({ isDeleted: true, authorId: "a", deletedById: "modo" }, false), false);
});
