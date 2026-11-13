/**
 * Tests unitaires des droits sur un sujet ou un message du forum (`lib/forumRights.ts`, carte 200). Le fichier importe
 * `lib/forumWriteRules.ts` par l'alias `@/`, que le chargeur des tests résout (carte 198).
 * Lancement : `pnpm test:unit` dans apps/site.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { canEditPost, canReplyToTopic } from "../../lib/forumRights.ts";

const open = { isLocked: false, isArchived: false, forumIsLocked: false, isDeleted: false };
const member = { id: "coach", isModerator: false };
const moderator = { id: "modo", isModerator: true };
const visitor = { id: null, isModerator: false };

test("un membre répond à un sujet ouvert, pas un visiteur", () => {
  assert.equal(canReplyToTopic(member, open), true);
  assert.equal(canReplyToTopic(visitor, open), false);
});

test("un sujet archivé, verrouillé ou dans un forum verrouillé est fermé aux membres, pas aux modérateurs", () => {
  for (const closed of [{ ...open, isArchived: true }, { ...open, isLocked: true }, { ...open, forumIsLocked: true }]) {
    assert.equal(canReplyToTopic(member, closed), false);
    assert.equal(canReplyToTopic(moderator, closed), true);
  }
});

test("personne ne répond à un sujet supprimé, même un modérateur", () => {
  assert.equal(canReplyToTopic(moderator, { ...open, isDeleted: true }), false);
});

test("l'auteur modifie son message tant que le sujet est ouvert ; un modérateur toujours", () => {
  assert.equal(canEditPost(member, false, "coach"), true);
  assert.equal(canEditPost(member, true, "coach"), false);
  assert.equal(canEditPost(member, false, "autre"), false);
  assert.equal(canEditPost(moderator, true, "autre"), true);
  assert.equal(canEditPost(visitor, false, "coach"), false);
});
