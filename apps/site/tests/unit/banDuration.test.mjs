/**
 * Tests unitaires du bannissement temporaire (carte 222) : durées acceptées, date de fin, levée à l'échéance,
 * date écrite en heure de Paris.
 * Lancement : `pnpm test:unit` dans apps/site.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { banDurationLabel, banEndDate, formatBanEnd, isBanExpired, parseBanDuration } from "../../lib/banDuration.ts";

const NOW = new Date("2026-11-22T12:00:00Z");

test("seules les durées proposées passent ; rien veut dire définitif", () => {
  assert.equal(parseBanDuration(7), 7);
  assert.equal(parseBanDuration(null), null);
  assert.equal(parseBanDuration(undefined), null);
  assert.equal(parseBanDuration(3), undefined);
  assert.equal(parseBanDuration("7"), undefined);
});

test("date de fin : maintenant plus la durée ; aucune pour un bannissement définitif", () => {
  assert.equal(banEndDate(7, NOW)?.toISOString(), "2026-11-29T12:00:00.000Z");
  assert.equal(banEndDate(null, NOW), null);
});

test("levée : seulement un bannissement temporaire dont la date est passée", () => {
  assert.equal(isBanExpired(true, new Date("2026-11-22T11:59:59Z"), NOW), true);
  assert.equal(isBanExpired(true, NOW, NOW), true);
  assert.equal(isBanExpired(true, new Date("2026-11-22T12:00:01Z"), NOW), false);
  assert.equal(isBanExpired(true, null, NOW), false);
  assert.equal(isBanExpired(false, new Date("2026-11-01T00:00:00Z"), NOW), false);
});

test("date écrite en heure de Paris, et libellés des durées", () => {
  assert.equal(formatBanEnd(new Date("2026-11-29T13:32:00Z")), "29/11/2026 à 14:32");
  assert.equal(banDurationLabel(1), "1 jour");
  assert.equal(banDurationLabel(30), "30 jours");
  assert.equal(banDurationLabel(null), "Définitif");
});
