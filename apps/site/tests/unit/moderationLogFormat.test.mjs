/**
 * Tests unitaires de l'affichage du journal de modération (carte 221) : libellés des rôles et groupes du filtre.
 * Lancement : `pnpm test:unit` dans apps/site.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { formatRoleChangeDetails, isLogGroup, LOG_GROUP_ACTIONS } from "../../lib/moderationLogFormat.ts";

test("un changement de rôle s'affiche avec les libellés", () => {
  assert.equal(formatRoleChangeDetails("Changement de rôle : COACH → MODERATOR"), "Changement de rôle : Coach → Modérateur");
  assert.equal(formatRoleChangeDetails("CHEF_LIGUE -> RTC"), "Chef de ligue → RTC");
});

test("un rôle personnalisé prend le libellé lu en base", () => {
  assert.equal(formatRoleChangeDetails("COACH → ARBITRE", { ARBITRE: "Arbitre" }), "Coach → Arbitre");
});

test("un texte libre sans changement de rôle reste identique", () => {
  assert.equal(formatRoleChangeDetails("Propos insultants (exemple)"), "Propos insultants (exemple)");
  assert.equal(formatRoleChangeDetails("Déplacé depuis « La brocante »"), "Déplacé depuis « La brocante »");
});

test("groupes du filtre : valeurs connues, aucune action dans deux groupes", () => {
  assert.ok(isLogGroup("forum"));
  assert.ok(!isLogGroup("toString"));
  assert.ok(!isLogGroup(undefined));
  const all = Object.values(LOG_GROUP_ACTIONS).flat();
  assert.equal(new Set(all).size, all.length);
});
