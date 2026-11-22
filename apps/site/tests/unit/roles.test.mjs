/**
 * Tests unitaires du changement de rôle et de la suppression d'un compte (`lib/roles.ts`, carte 221).
 * Lancement : `pnpm test:unit` dans apps/site.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { canBanMember, canDeleteMember, roleChangeRefusal } from "../../lib/roles.ts";

const change = (actorRole, targetRole, newRole, extra = {}) =>
  roleChangeRefusal({ actorId: "moi", actorRole, targetId: "cible", targetRole, newRole, newRoleExists: true, ...extra });

test("un coach ne change aucun rôle", () => {
  assert.notEqual(change("COACH", "COACH", "RTC"), null);
});

test("un rôle inventé est refusé, même pour le Super Admin", () => {
  assert.equal(change("SUPERADMIN", "COACH", "PIRATE", { newRoleExists: false }), "Ce rôle n'existe pas.");
});

test("personne ne change son propre rôle", () => {
  assert.notEqual(change("SUPERADMIN", "SUPERADMIN", "COACH", { targetId: "moi" }), null);
});

test("un modérateur nomme RTC un coach, mais ne nomme pas un modérateur ni ne touche un égal", () => {
  assert.equal(change("MODERATOR", "COACH", "RTC"), null);
  assert.notEqual(change("MODERATOR", "COACH", "MODERATOR"), null);
  assert.notEqual(change("MODERATOR", "MODERATOR", "COACH"), null);
});

test("un admin ne touche pas un autre admin ; le Super Admin touche tout le monde", () => {
  assert.notEqual(change("ADMIN", "ADMIN", "COACH"), null);
  assert.equal(change("SUPERADMIN", "ADMIN", "COACH"), null);
});

test("un rôle personnalisé compte comme coach : un modérateur peut le donner", () => {
  assert.equal(change("MODERATOR", "COACH", "ARBITRE"), null);
});

test("seuls les admins suppriment un compte, sur un rang inférieur, jamais le leur", () => {
  assert.equal(canDeleteMember("MODERATOR", "COACH"), false);
  assert.equal(canDeleteMember("ADMIN", "MODERATOR"), true);
  assert.equal(canDeleteMember("ADMIN", "ADMIN"), false);
  assert.equal(canDeleteMember("SUPERADMIN", "ADMIN"), true);
  assert.equal(canDeleteMember("SUPERADMIN", "SUPERADMIN", true), false);
});

test("personne ne se bannit soi-même ni ne bannit ou supprime un compte technique (carte 221)", () => {
  assert.equal(canBanMember("SUPERADMIN", "SUPERADMIN", true), false);
  assert.equal(canBanMember("SUPERADMIN", "SUPERADMIN", false, "system"), false);
  assert.equal(canDeleteMember("SUPERADMIN", "COACH", false, "ghost_coach"), false);
  assert.equal(canBanMember("MODERATOR", "COACH"), true);
  assert.equal(canBanMember("MODERATOR", "MODERATOR"), false);
  assert.equal(canBanMember("SUPERADMIN", "ADMIN"), true);
  assert.equal(canBanMember("COACH", "COACH"), false);
});
