/**
 * Tests unitaires des droits sur un tournoi (`lib/tournamentRights.ts`, carte 201) : gestion du tournoi
 * (organisateur, commissaire ou modérateur) et paiement (organisateur ou commissaire seulement, carte 177).
 * Lancement : `pnpm test:unit` dans apps/site.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { canManagePayments, canManageTournament, isTournamentStaff } from "../../lib/tournamentRights.ts";

const tournament = { organizerId: "orga", commissaires: [{ id: "commissaire" }] };

test("l'organisateur, un commissaire et un modérateur gèrent le tournoi ; un autre coach non", () => {
  assert.equal(canManageTournament({ id: "orga" }, tournament), true);
  assert.equal(canManageTournament({ id: "commissaire" }, tournament), true);
  assert.equal(canManageTournament({ id: "modo", isModerator: true }, tournament), true);
  assert.equal(canManageTournament({ id: "coach" }, tournament), false);
  assert.equal(canManageTournament({ id: null, isModerator: true }, tournament), false);
});

test("le paiement ne regarde que l'organisateur et les commissaires, pas la modération", () => {
  assert.equal(canManagePayments({ id: "orga" }, tournament), true);
  assert.equal(canManagePayments({ id: "commissaire" }, tournament), true);
  assert.equal(canManagePayments({ id: "modo", isModerator: true }, tournament), false);
});

test("un visiteur ne fait pas partie de l'équipe du tournoi", () => {
  assert.equal(isTournamentStaff({}, tournament), false);
});
