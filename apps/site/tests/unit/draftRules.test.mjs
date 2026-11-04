/**
 * Tests unitaires des règles des brouillons de message (carte 181) : nom de la case, expiration après 7 jours,
 * lecture d'une case abîmée et choix du texte à restaurer.
 * Lancement : `pnpm test:unit` dans apps/site (lanceur de tests intégré à Node, sans navigateur ni serveur).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DRAFT_KEY_PREFIX,
  DRAFT_MAX_AGE_MS,
  draftStorageKey,
  draftToRestore,
  hasDraftChanges,
  isDraftExpired,
  parseStoredDraft,
  serializeDraft,
} from "../../common/utils/draftRules.ts";

const NOW = Date.UTC(2026, 10, 4, 12, 0, 0);

test("nom de la case : un par membre et par écran, « visiteur » sans membre", () => {
  assert.equal(draftStorageKey("reply:t1", "u1"), `${DRAFT_KEY_PREFIX}u1:reply:t1`);
  assert.equal(draftStorageKey("reply:t1", null), `${DRAFT_KEY_PREFIX}visiteur:reply:t1`);
  assert.notEqual(draftStorageKey("reply:t1", "u1"), draftStorageKey("quick-reply:t1", "u1"));
  assert.notEqual(draftStorageKey("reply:t1", "u1"), draftStorageKey("reply:t1", "u2"));
});

test("un texte vide ou identique au départ n'est pas un brouillon", () => {
  assert.equal(hasDraftChanges("", ""), false);
  assert.equal(hasDraftChanges("   \n ", ""), false);
  assert.equal(hasDraftChanges("Message d'origine", "Message d'origine"), false);
  assert.equal(hasDraftChanges("Message modifié", "Message d'origine"), true);
  assert.equal(hasDraftChanges("Bonjour", ""), true);
});

test("expiration après 7 jours, date illisible comptée comme expirée", () => {
  assert.equal(isDraftExpired(NOW - DRAFT_MAX_AGE_MS + 1000, NOW), false);
  assert.equal(isDraftExpired(NOW - DRAFT_MAX_AGE_MS - 1000, NOW), true);
  assert.equal(isDraftExpired(Number.NaN, NOW), true);
});

test("lecture d'une case : format enregistré relu, case vide ou abîmée ignorée", () => {
  assert.deepEqual(parseStoredDraft(serializeDraft("Texte", NOW)), { text: "Texte", savedAt: NOW });
  assert.equal(parseStoredDraft(null), null);
  assert.equal(parseStoredDraft("pas du JSON"), null);
  assert.equal(parseStoredDraft(JSON.stringify({ text: 3, savedAt: NOW })), null);
  assert.equal(parseStoredDraft("null"), null);
});

test("texte restauré : seulement un brouillon récent, non vide et différent du départ", () => {
  assert.equal(draftToRestore(serializeDraft("Long compte rendu", NOW - 60_000), "", NOW), "Long compte rendu");
  assert.equal(draftToRestore(serializeDraft("Long compte rendu", NOW - DRAFT_MAX_AGE_MS - 1), "", NOW), null);
  assert.equal(draftToRestore(serializeDraft("  ", NOW), "", NOW), null);
  assert.equal(draftToRestore(serializeDraft("Message d'origine", NOW), "Message d'origine", NOW), null);
  assert.equal(draftToRestore(null, "", NOW), null);
});
