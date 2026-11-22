/**
 * Tests unitaires des chaînes de la page Médias (`lib/mediaChannels.ts`).
 * Lancement : `pnpm test:unit` dans apps/site.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseTwitchChannelInput, parseTwitchChannels, parseYoutubeChannelInput, parseYoutubeChannels, serializeYoutubeChannels, uploadsPlaylistId,
} from "../../lib/mediaChannels.ts";

const ID = "UCJBrT8VzthslAZKNKooHHtg";

test("le réglage YouTube se lit ligne par ligne, avec le nom, et l'ancienne forme reste lue", () => {
  assert.deepEqual(parseYoutubeChannels(`${ID}|Dré dans l'pentu\nUCeIAjAKjxxUk2sPWPoxG2Ug|Breakyt`), [
    { id: ID, name: "Dré dans l'pentu" },
    { id: "UCeIAjAKjxxUk2sPWPoxG2Ug", name: "Breakyt" },
  ]);
  // Ancienne forme : identifiants séparés par des virgules, sans nom
  assert.deepEqual(parseYoutubeChannels(`${ID}, UCeIAjAKjxxUk2sPWPoxG2Ug`).map((c) => c.name), [ID, "UCeIAjAKjxxUk2sPWPoxG2Ug"]);
  // Ligne invalide ou doublon ignorés
  assert.equal(parseYoutubeChannels(`pas un id|X\n${ID}|A\n${ID}|B`).length, 1);
  assert.equal(parseYoutubeChannels(null).length, 0);
});

test("l'écriture du réglage retire les caractères qui casseraient le format", () => {
  assert.equal(serializeYoutubeChannels([{ id: ID, name: "Nom | avec\nretour" }]), `${ID}|Nom avec retour`);
});

test("ce qu'on colle pour une chaîne YouTube : identifiant, adresse /channel/ ou @nom", () => {
  assert.deepEqual(parseYoutubeChannelInput(ID), { id: ID });
  assert.deepEqual(parseYoutubeChannelInput(`https://www.youtube.com/channel/${ID}`), { id: ID });
  assert.deepEqual(parseYoutubeChannelInput("https://www.youtube.com/@Breakytt"), { handle: "@Breakytt" });
  assert.deepEqual(parseYoutubeChannelInput("@-netblitz-7507"), { handle: "@-netblitz-7507" });
  assert.equal(parseYoutubeChannelInput("https://evil.example/@Breakytt"), null);
  assert.equal(parseYoutubeChannelInput("http://www.youtube.com/@Breakytt"), null);
});

test("chaînes Twitch : nom ou adresse, en minuscules et sans doublon", () => {
  assert.equal(parseTwitchChannelInput("https://www.twitch.tv/BBFrance_TV?x=1"), "bbfrance_tv");
  assert.equal(parseTwitchChannelInput("ab"), null);
  assert.deepEqual(parseTwitchChannels("Alpha\nalpha\nbeta"), ["alpha", "beta"]);
});

test("la liste « Uploads » remplace UC par UU", () => {
  assert.equal(uploadsPlaylistId(ID), "UUJBrT8VzthslAZKNKooHHtg");
});

test("page /live de YouTube : direct en cours reconnu, chaîne hors ligne ou direct programmé ignorés", async () => {
  const { parseYoutubeLivePage } = await import("../../lib/mediaChannels.ts");
  const live = '<link rel="canonical" href="https://www.youtube.com/watch?v=4t4AQ15yj1M"><meta name="title" content="Finale &amp; co">"isLive":true';
  assert.deepEqual(parseYoutubeLivePage(live), { videoId: "4t4AQ15yj1M", title: "Finale &amp; co" });
  assert.equal(parseYoutubeLivePage('<link rel="canonical" href="https://www.youtube.com/channel/UCeIAjAKjxxUk2sPWPoxG2Ug">'), null);
  assert.equal(parseYoutubeLivePage(live + '"isUpcoming":true'), null);
});
