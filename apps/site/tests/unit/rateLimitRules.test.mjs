/**
 * Tests unitaires de la limite d'actions par minute (carte 224) : minute comptée et dépassement des seuils.
 * Lancement : `pnpm test:unit` dans apps/site.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { isOverRateLimit, RATE_LIMITS, rateWindowStart } from "../../lib/rateLimitRules.ts";

test("la minute comptée commence à la seconde zéro", () => {
  assert.equal(rateWindowStart(new Date("2026-11-22T14:32:47.123Z")).toISOString(), "2026-11-22T14:32:00.000Z");
  assert.equal(rateWindowStart(new Date("2026-11-22T14:32:00.000Z")).toISOString(), "2026-11-22T14:32:00.000Z");
});

test("la limite est atteinte au seuil, dépassée juste après", () => {
  assert.equal(isOverRateLimit("TOPIC", RATE_LIMITS.TOPIC), false);
  assert.equal(isOverRateLimit("TOPIC", RATE_LIMITS.TOPIC + 1), true);
  assert.equal(isOverRateLimit("REACTION", 1), false);
});

test("chaque seuil laisse un usage normal", () => {
  for (const limit of Object.values(RATE_LIMITS)) assert.ok(limit >= 3);
});
