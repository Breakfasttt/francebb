/**
 * Tests unitaires des règles d'écriture du forum (carte 169) : longueur d'un titre et d'un message, sujet fermé
 * (verrouillé, archivé, forum verrouillé) et émojis acceptés en réaction.
 * Lancement : `pnpm test:unit` dans apps/site (lanceur de tests intégré à Node, sans navigateur ni serveur).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  POST_CONTENT_MAX_LENGTH,
  REACTION_EMOJIS,
  TOPIC_TITLE_MAX_LENGTH,
  closedTopicMessage,
  isAllowedReaction,
  isTopicClosedFor,
  postContentError,
  topicTitleError,
} from "../../lib/forumWriteRules.ts";

test("titre : obligatoire, de 3 à 150 caractères, espaces du bord non comptés", () => {
  assert.notEqual(topicTitleError(""), null);
  assert.notEqual(topicTitleError("    "), null);
  assert.notEqual(topicTitleError(" ab "), null);
  assert.notEqual(topicTitleError(undefined), null);
  assert.equal(topicTitleError("abc"), null);
  assert.equal(topicTitleError("  Règles du Nuffle  "), null);
  assert.equal(topicTitleError("x".repeat(TOPIC_TITLE_MAX_LENGTH)), null);
  assert.notEqual(topicTitleError("x".repeat(TOPIC_TITLE_MAX_LENGTH + 1)), null);
});

test("message : vide ou fait seulement d'espaces refusé, 30 000 caractères au plus", () => {
  assert.notEqual(postContentError(""), null);
  assert.notEqual(postContentError(" \n\t "), null);
  assert.notEqual(postContentError(null), null);
  assert.equal(postContentError("Bonjour"), null);
  assert.equal(postContentError("x".repeat(POST_CONTENT_MAX_LENGTH)), null);
  assert.match(postContentError("x".repeat(POST_CONTENT_MAX_LENGTH + 1)), /trop long/);
});

test("sujet fermé : verrouillé, archivé ou forum verrouillé, sauf pour un modérateur", () => {
  const open = { isLocked: false, isArchived: false, forumIsLocked: false };
  assert.equal(isTopicClosedFor(open, false), false);
  assert.equal(isTopicClosedFor({ ...open, isLocked: true }, false), true);
  assert.equal(isTopicClosedFor({ ...open, isArchived: true }, false), true);
  assert.equal(isTopicClosedFor({ ...open, forumIsLocked: true }, false), true);
  assert.equal(isTopicClosedFor({ isLocked: true, isArchived: true, forumIsLocked: true }, true), false);
  assert.match(closedTopicMessage({ ...open, isArchived: true }), /archivé/);
  assert.match(closedTopicMessage({ ...open, isLocked: true }), /verrouillé/);
});

test("réactions : seuls les émojis proposés sont acceptés", () => {
  for (const emoji of REACTION_EMOJIS) assert.equal(isAllowedReaction(emoji), true);
  assert.equal(isAllowedReaction("💩"), false);
  assert.equal(isAllowedReaction("<script>"), false);
  assert.equal(isAllowedReaction(""), false);
  assert.equal(isAllowedReaction(undefined), false);
});
