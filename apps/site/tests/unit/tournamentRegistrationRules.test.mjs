/**
 * Tests unitaires des règles d'inscription et des équipes d'un tournoi (carte 186) : inscriptions refusées pour un
 * tournoi annulé, terminé, passé ou fermé ; taille d'une équipe, coach dans une seule équipe, membres volontaires.
 * Lancement : `pnpm test:unit` dans apps/site.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanTeamMemberIds, formatChangeLossCount, formatChangeLossText, registrationRefusal, teamCompositionError } from "../../lib/tournamentRegistrationRules.ts";

const open = { isCancelled: false, isFinished: false, registrationsLocked: false, isOver: false };

test("un tournoi ouvert accepte les inscriptions", () => {
  assert.equal(registrationRefusal(open), null);
});

test("un tournoi annulé, terminé, passé ou fermé refuse les inscriptions", () => {
  assert.match(registrationRefusal({ ...open, isCancelled: true }), /annulé/);
  assert.match(registrationRefusal({ ...open, isFinished: true }), /terminé/);
  assert.match(registrationRefusal({ ...open, isOver: true }), /passé/);
  assert.match(registrationRefusal({ ...open, registrationsLocked: true }), /fermées/);
});

test("les membres demandés sont nettoyés : sans doublon et sans le capitaine", () => {
  assert.deepEqual(cleanTeamMemberIds("cap", ["a", "cap", "a", "b", "", 3]), ["a", "b"]);
  assert.deepEqual(cleanTeamMemberIds("cap", "a"), []);
});

const team = {
  isTeamTournament: true,
  coachsPerTeam: 3,
  name: "Les Gorets",
  memberIds: ["a", "b"],
  currentMemberIds: [],
  mercenaryIds: ["a", "b", "c"],
  captainId: "cap",
  otherTeamCoachIds: ["x", "y"],
};

test("une équipe complète de volontaires est acceptée, une équipe incomplète aussi", () => {
  assert.equal(teamCompositionError(team), null);
  assert.equal(teamCompositionError({ ...team, memberIds: ["a"] }), null);
});

test("une équipe dans un tournoi individuel est refusée", () => {
  assert.match(teamCompositionError({ ...team, isTeamTournament: false }), /individuel/);
});

test("une équipe sans nom est refusée", () => {
  assert.match(teamCompositionError({ ...team, name: "   " }), /obligatoire/);
});

test("une équipe trop grande est refusée, capitaine compris", () => {
  assert.match(teamCompositionError({ ...team, memberIds: ["a", "b", "c"] }), /au plus 3 coachs/);
});

test("un coach déjà dans une autre équipe du tournoi est refusé, capitaine compris", () => {
  assert.match(teamCompositionError({ ...team, captainId: "x" }), /Vous faites déjà partie/);
  assert.match(teamCompositionError({ ...team, memberIds: ["a", "y"], mercenaryIds: ["a", "y"] }), /autre équipe/);
});

test("un capitaine n'ajoute que des mercenaires, ou des membres déjà dans son équipe", () => {
  assert.match(teamCompositionError({ ...team, memberIds: ["a", "z"] }), /mercenaires/);
  assert.equal(teamCompositionError({ ...team, memberIds: ["a", "z"], currentMemberIds: ["z"] }), null);
});

test("le texte d'un changement de format annonce les inscriptions supprimées", () => {
  assert.equal(formatChangeLossText({ registrations: 3, teams: 0, mercenaries: 0 }), "3 inscriptions individuelles");
  assert.equal(formatChangeLossText({ registrations: 0, teams: 2, mercenaries: 1 }), "2 équipes et 1 mercenaire");
  assert.equal(formatChangeLossText({ registrations: 1, teams: 1, mercenaries: 2 }), "1 inscription individuelle, 1 équipe et 2 mercenaires");
  assert.equal(formatChangeLossText({ registrations: 0, teams: 0, mercenaries: 0 }), "aucune inscription");
  assert.equal(formatChangeLossCount({ registrations: 1, teams: 2, mercenaries: 3 }), 6);
});
