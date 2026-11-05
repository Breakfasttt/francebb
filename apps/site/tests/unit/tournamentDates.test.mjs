/**
 * Tests unitaires de la règle des dates des tournois (carte 187) : un tournoi est à venir ou en cours jusqu'à la fin
 * de son dernier jour, heure de Paris, et une date de fin avant la date de début est refusée.
 * Lancement : `pnpm test:unit` dans apps/site.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  isTournamentOver,
  isTournamentUpcomingOrOngoing,
  parisDayKey,
  parisDayStart,
  tournamentDatesError,
  upcomingTournamentWhere,
} from "../../lib/tournamentDates.ts";

// Dates enregistrées comme le fait le formulaire : minuit en temps universel
const day = (text) => new Date(text);

test("le jour de Paris d'une date enregistrée à minuit en temps universel est le même jour", () => {
  assert.equal(parisDayKey(day("2026-11-07")), "2026-11-07");
  assert.equal(parisDayKey(day("2026-07-14")), "2026-07-14");
});

test("un tournoi d'un jour reste à venir pendant toute sa journée, heure de Paris", () => {
  const tournament = { date: day("2026-11-07"), endDate: null };
  assert.equal(isTournamentUpcomingOrOngoing(tournament, new Date("2026-11-06T22:00:00Z")), true);
  // 23 h 30 à Paris le 7 novembre (heure d'hiver, temps universel + 1 heure)
  assert.equal(isTournamentUpcomingOrOngoing(tournament, new Date("2026-11-07T22:30:00Z")), true);
  // 0 h 30 à Paris le 8 novembre
  assert.equal(isTournamentUpcomingOrOngoing(tournament, new Date("2026-11-07T23:30:00Z")), false);
  assert.equal(isTournamentOver(tournament, new Date("2026-11-07T23:30:00Z")), true);
});

test("un tournoi de deux jours est en cours pendant son premier jour et son dernier jour", () => {
  const tournament = { date: day("2026-11-07"), endDate: day("2026-11-08") };
  assert.equal(isTournamentUpcomingOrOngoing(tournament, new Date("2026-11-07T15:00:00Z")), true);
  assert.equal(isTournamentUpcomingOrOngoing(tournament, new Date("2026-11-08T15:00:00Z")), true);
  assert.equal(isTournamentUpcomingOrOngoing(tournament, new Date("2026-11-09T08:00:00Z")), false);
});

test("en heure d'été, le jour de Paris commence à 22 heures en temps universel", () => {
  const tournament = { date: day("2026-07-14") };
  assert.equal(isTournamentUpcomingOrOngoing(tournament, new Date("2026-07-14T21:59:00Z")), true);
  assert.equal(isTournamentUpcomingOrOngoing(tournament, new Date("2026-07-14T22:01:00Z")), false);
});

test("le début du jour de Paris est minuit heure de Paris", () => {
  assert.equal(parisDayStart(new Date("2026-11-05T10:00:00Z")).toISOString(), "2026-11-04T23:00:00.000Z");
  assert.equal(parisDayStart(new Date("2026-07-14T10:00:00Z")).toISOString(), "2026-07-13T22:00:00.000Z");
  // 23 h 30 en temps universel le 5 novembre : il est déjà 0 h 30 le 6 novembre à Paris
  assert.equal(parisDayStart(new Date("2026-11-05T23:30:00Z")).toISOString(), "2026-11-05T23:00:00.000Z");
});

test("la condition de requête garde le dernier jour d'aujourd'hui et écarte celui d'hier", () => {
  const now = new Date("2026-11-07T15:00:00Z");
  const where = upcomingTournamentWhere(now);
  const limit = where.OR[0].endDate.gte;
  assert.equal(limit.getTime() <= day("2026-11-07").getTime(), true);
  assert.equal(limit.getTime() > day("2026-11-06").getTime(), true);
  assert.deepEqual(where.OR[1], { endDate: null, date: { gte: limit } });
});

test("une date de fin avant la date de début est refusée", () => {
  assert.equal(tournamentDatesError(day("2026-11-07"), day("2026-11-08")), null);
  assert.equal(tournamentDatesError(day("2026-11-07"), day("2026-11-07")), null);
  assert.equal(tournamentDatesError(day("2026-11-07"), null), null);
  assert.match(tournamentDatesError(day("2026-11-07"), day("2026-11-06")), /avant la date de début/);
  assert.match(tournamentDatesError(new Date(""), null), /obligatoire/);
});
