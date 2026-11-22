/**
 * Tests unitaires des règles d'un signalement (`lib/reportRules.ts`, carte 221).
 * Lancement : `pnpm test:unit` dans apps/site.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { REPORT_DETAILS_MAX, reportInputRefusal } from "../../lib/reportRules.ts";

const valid = { reporterId: "moi", targetType: "POST", targetId: "message-1", reason: "Spam / Publicité" };

test("un signalement complet est accepté", () => {
  assert.equal(reportInputRefusal(valid), null);
});

test("un type inconnu, une raison vide ou des précisions trop longues sont refusés", () => {
  assert.notEqual(reportInputRefusal({ ...valid, targetType: "MESSAGE" }), null);
  assert.notEqual(reportInputRefusal({ ...valid, reason: "   " }), null);
  assert.notEqual(reportInputRefusal({ ...valid, details: "x".repeat(REPORT_DETAILS_MAX + 1) }), null);
  assert.notEqual(reportInputRefusal({ ...valid, targetId: 42 }), null);
});

test("une conversation privée peut être signalée (carte 223)", () => {
  assert.equal(reportInputRefusal({ ...valid, targetType: "CONVERSATION", targetId: "conversation-1" }), null);
});

test("on ne se signale pas soi-même", () => {
  assert.notEqual(reportInputRefusal({ ...valid, targetType: "USER", targetId: "moi" }), null);
});
