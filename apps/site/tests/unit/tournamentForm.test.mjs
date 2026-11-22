/**
 * Tests unitaires de la lecture du formulaire de tournoi (`lib/tournamentForm.ts`, carte 201), commune à la création et
 * à la modification : valeurs par défaut identiques, dates, nombres vides, et géocodage avec un faux appel réseau.
 * Lancement : `pnpm test:unit` dans apps/site.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_GAME_EDITION, DEFAULT_PLATFORM, geocodeAddress, readTournamentForm, withCoordinates } from "../../lib/tournamentForm.ts";

function form(values) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}

test("sans édition ni plateforme, les valeurs par défaut sont posées (création comme modification)", () => {
  const result = readTournamentForm(form({ tDate: "2027-03-06" }));
  assert.ok("fields" in result);
  assert.equal(result.fields.gameEdition, DEFAULT_GAME_EDITION);
  assert.equal(result.fields.platform, DEFAULT_PLATFORM);
  assert.equal(result.fields.tournamentType, "SWISS");
  assert.equal(result.fields.days, "1");
  assert.equal(result.fields.location, "Lieu non précisé");
});

test("un tournoi sans date de début, ou qui finit avant de commencer, est refusé", () => {
  assert.deepEqual(readTournamentForm(form({})), { error: "La date de début du tournoi est obligatoire." });
  assert.ok("error" in readTournamentForm(form({ tDate: "2027-03-07", tEndDate: "2027-03-06" })));
});

test("deux jours de tournoi, équipe de 3, prix et places vides", () => {
  const result = readTournamentForm(form({ tDate: "2027-03-06", tEndDate: "2027-03-07", isTeam: "on", tCoachsPerTeam: "3", tPrice: "", tMax: "0" }));
  assert.ok("fields" in result);
  assert.equal(result.fields.days, "2");
  assert.equal(result.fields.isTeam, true);
  assert.equal(result.fields.coachsPerTeam, 3);
  assert.equal(result.fields.price, null);
  assert.equal(result.fields.maxParticipants, null);
});

test("les commissaires et la case CDF sont rendus à part, pour les règles de chaque action", () => {
  const result = readTournamentForm(form({ tDate: "2027-03-06", commissaireIds: "a, b,,", championships: "CDF", typeCDF: "EQUIPE" }));
  assert.ok("requests" in result);
  assert.deepEqual(result.requests, { wantsCdf: true, typeCDF: "EQUIPE", commissaireIds: ["a", "b"] });
  // Le CDF n'est pas dans la liste des autres championnats : chaque action le traite selon ses règles (carte 227)
  assert.deepEqual(result.fields.championships, []);
});

test("les championnats cochés sont nettoyés : capitales, sans doublon ni valeur bizarre (carte 227)", () => {
  const data = form({ tDate: "2027-03-06" });
  for (const key of ["naf", "CGO", "NAF", "<script>", "CDF"]) data.append("championships", key);
  const result = readTournamentForm(data);
  assert.ok("fields" in result);
  assert.deepEqual(result.fields.championships, ["NAF", "CGO"]);
  assert.equal(result.requests.wantsCdf, true);
});

test("le géocodage remplit les coordonnées absentes, et seulement elles", async () => {
  const fakeFetch = async () => ({ json: async () => [{ lat: "48.11", lon: "-1.68" }] });
  const result = readTournamentForm(form({ tDate: "2027-03-06", tAddress: "Place de la Mairie", tVille: "Rennes" }));
  assert.ok("fields" in result);
  const located = await withCoordinates(result.fields, fakeFetch);
  assert.equal(located.lat, 48.11);
  assert.equal(located.lng, -1.68);

  const given = readTournamentForm(form({ tDate: "2027-03-06", tLat: "45", tLng: "5" }));
  assert.ok("fields" in given);
  const kept = await withCoordinates(given.fields, async () => assert.fail("pas d'appel réseau"));
  assert.equal(kept.lat, 45);
});

test("une adresse introuvable ou un service en panne laisse le tournoi sans position", async () => {
  assert.equal(await geocodeAddress("Nulle part", async () => ({ json: async () => [] })), null);
  assert.equal(await geocodeAddress("Rennes", async () => { throw new Error("panne"); }), null);
  assert.equal(await geocodeAddress("   ", async () => assert.fail("pas d'appel réseau")), null);
});
