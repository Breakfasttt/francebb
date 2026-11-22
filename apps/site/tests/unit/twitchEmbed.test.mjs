/**
 * Tests unitaires des lecteurs Twitch (`lib/twitchEmbed.ts`) et de la balise BBCode `[twitch]`.
 * Lancement : `pnpm test:unit` dans apps/site.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { isTwitchConsentValid, parseTwitchInput, twitchPageUrl, twitchPlayerUrl } from "../../lib/twitchEmbed.ts";
import { parseBBCode } from "../../lib/bbcode.ts";

test("nom de chaîne, adresse de chaîne, de vidéo et de clip sont reconnus", () => {
  assert.deepEqual(parseTwitchInput("BBFrance_TV"), { kind: "channel", id: "bbfrance_tv" });
  assert.deepEqual(parseTwitchInput("https://www.twitch.tv/BBFrance_TV"), { kind: "channel", id: "bbfrance_tv" });
  assert.deepEqual(parseTwitchInput("https://www.twitch.tv/videos/2345678901"), { kind: "video", id: "2345678901" });
  assert.deepEqual(parseTwitchInput("https://clips.twitch.tv/FunnyClipSlug-abc123"), { kind: "clip", id: "FunnyClipSlug-abc123" });
  assert.deepEqual(parseTwitchInput("https://www.twitch.tv/bbfrance/clip/FunnyClipSlug-abc123"), { kind: "clip", id: "FunnyClipSlug-abc123" });
});

test("une adresse étrangère ou malformée est refusée", () => {
  assert.equal(parseTwitchInput("https://evil.example/bbfrance"), null);
  assert.equal(parseTwitchInput("javascript:alert(1)"), null);
  assert.equal(parseTwitchInput("ab"), null);
  assert.equal(parseTwitchInput("https://www.twitch.tv/directory/game/Blood%20Bowl"), null);
});

test("adresses du lecteur et de la page Twitch", () => {
  assert.equal(twitchPlayerUrl({ kind: "channel", id: "bbf" }, "bbfrance.fr"), "https://player.twitch.tv/?channel=bbf&parent=bbfrance.fr&autoplay=false");
  assert.equal(twitchPlayerUrl({ kind: "video", id: "123456" }, "bbfrance.fr"), "https://player.twitch.tv/?video=123456&parent=bbfrance.fr&autoplay=false");
  assert.equal(twitchPlayerUrl({ kind: "clip", id: "Slug-1" }, "bbfrance.fr"), "https://clips.twitch.tv/embed?clip=Slug-1&parent=bbfrance.fr&autoplay=false");
  assert.equal(twitchPageUrl({ kind: "video", id: "123456" }), "https://www.twitch.tv/videos/123456");
});

test("l'accord « toujours afficher » dure 6 mois", () => {
  const now = new Date("2026-11-22T12:00:00Z");
  assert.equal(isTwitchConsentValid(null, now), false);
  assert.equal(isTwitchConsentValid("pas une date", now), false);
  assert.equal(isTwitchConsentValid("2026-10-01T00:00:00Z", now), true);
  assert.equal(isTwitchConsentValid("2026-04-01T00:00:00Z", now), false);
});

test("la balise [twitch] produit un cadre bb-twitch, jamais un lecteur chargé d'office", () => {
  const html = parseBBCode("[twitch]https://www.twitch.tv/videos/2345678901[/twitch]");
  assert.match(html, /<bb-twitch data-kind="video" data-id="2345678901"/);
  assert.doesNotMatch(html, /player\.twitch\.tv/);
  // Contenu non reconnu : la balise reste en texte
  assert.match(parseBBCode("[twitch]https://evil.example/x[/twitch]"), /\[twitch\]/);
});
