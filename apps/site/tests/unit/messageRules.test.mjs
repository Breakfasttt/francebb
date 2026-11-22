/**
 * Tests unitaires des règles de la messagerie (`lib/messageRules.ts`, carte 221).
 * Lancement : `pnpm test:unit` dans apps/site.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  GROUP_MAX_PARTICIPANTS, GROUP_NAME_MAX_LENGTH, MESSAGE_MAX_LENGTH, groupNameError, messageContentError, participantsError,
} from "../../lib/messageRules.ts";

test("un message vide ou trop long est refusé", () => {
  assert.equal(messageContentError("Salut !"), null);
  assert.notEqual(messageContentError("   "), null);
  assert.notEqual(messageContentError("x".repeat(MESSAGE_MAX_LENGTH + 1)), null);
  assert.notEqual(messageContentError(undefined), null);
});

test("un groupe a une taille et un nom bornés", () => {
  assert.equal(participantsError(["a", "b"], 3), null);
  assert.notEqual(participantsError(["a"], GROUP_MAX_PARTICIPANTS + 1), null);
  assert.notEqual(participantsError("a", 2), null);
  assert.equal(groupNameError(undefined), null);
  assert.notEqual(groupNameError("x".repeat(GROUP_NAME_MAX_LENGTH + 1)), null);
});
