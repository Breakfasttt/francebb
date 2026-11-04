/**
 * Tests unitaires de la lecture des mentions d'un message du forum (carte 167) : pas de doublon, jamais l'auteur
 * lui-même, et au plus 10 membres pris en compte par message.
 * Lancement : `pnpm test:unit` dans apps/site.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { extractMentionIds, MAX_MENTIONS_PER_POST } from "../../lib/mentionRules.ts";

const mention = (id) => `[mention=${id}]@${id}[/mention]`;

test("les mentions sont lues dans l'ordre, sans doublon", () => {
  const content = `Salut ${mention("bob")} et ${mention("alice")}, ${mention("bob")} encore`;
  assert.deepEqual(extractMentionIds(content, "auteur"), ["bob", "alice"]);
});

test("l'auteur qui se mentionne lui-même n'est pas pris en compte", () => {
  assert.deepEqual(extractMentionIds(`${mention("auteur")} ${mention("bob")}`, "auteur"), ["bob"]);
});

test("au plus 10 membres par message", () => {
  assert.equal(MAX_MENTIONS_PER_POST, 10);
  const content = Array.from({ length: 500 }, (_, i) => mention(`membre${i}`)).join(" ");
  const ids = extractMentionIds(content, "auteur");
  assert.equal(ids.length, 10);
  assert.deepEqual(ids, Array.from({ length: 10 }, (_, i) => `membre${i}`));
});

test("la limite compte les membres distincts, pas les répétitions", () => {
  const content = [mention("bob"), mention("bob"), mention("bob"), ...Array.from({ length: 12 }, (_, i) => mention(`m${i}`))].join(" ");
  const ids = extractMentionIds(content, "auteur");
  assert.equal(ids.length, 10);
  assert.equal(ids[0], "bob");
});

test("un texte sans mention ne donne personne", () => {
  assert.deepEqual(extractMentionIds("[b]Bonjour[/b] @bob", "auteur"), []);
});

test("un identifiant avec des caractères interdits n'est pas lu", () => {
  assert.deepEqual(extractMentionIds("[mention=bob\"onerror]x[/mention]", "auteur"), []);
});
