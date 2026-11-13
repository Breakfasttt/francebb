/**
 * Tests unitaires des places et de la liste d'attente d'un tournoi (`lib/tournamentRegistrations.ts`, carte 186).
 * Premier test d'un fichier de `lib/` qui importe d'autres fichiers par l'alias `@/` (carte 198) : le chargeur
 * `alias-loader.mjs` les résout. La transaction de la base est remplacée par un faux objet en mémoire, qui ne garde
 * que les tables et les colonnes utilisées par ces fonctions.
 * Lancement : `pnpm test:unit` dans apps/site.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { nextRegistrationStatus, promoteFromWaitingList } from "../../lib/tournamentRegistrations.ts";

const FUTURE = new Date(Date.now() + 30 * 24 * 3600 * 1000);

/**
 * Fausse transaction : un tournoi individuel et ses inscriptions. `_count.registrations` est recalculé à chaque
 * lecture, comme le ferait la base avec `TAKEN_PLACES_COUNT` (inscriptions hors liste d'attente).
 */
function fakeTx({ maxParticipants, registrations, tournament = {} }) {
  const rows = registrations.map((row, index) => ({ id: `r${index}`, createdAt: new Date(2026, 0, index + 1), ...row }));
  return {
    rows,
    tournament: {
      findUnique: async () => ({
        maxParticipants,
        currentParticipants: 0,
        isTeam: false,
        isCancelled: false,
        isFinished: false,
        date: FUTURE,
        endDate: null,
        ...tournament,
        _count: { registrations: rows.filter((row) => row.status !== "WAITING_LIST").length, teams: 0 },
      }),
    },
    tournamentRegistration: {
      findMany: async ({ take }) =>
        rows
          .filter((row) => row.status === "WAITING_LIST")
          .sort((a, b) => a.createdAt - b.createdAt)
          .slice(0, take ?? undefined)
          .map(({ id, userId }) => ({ id, userId })),
      updateMany: async ({ where, data }) => {
        for (const row of rows) if (where.id.in.includes(row.id)) Object.assign(row, data);
      },
    },
  };
}

test("une place libre donne une pré-inscription", async () => {
  const tx = fakeTx({ maxParticipants: 2, registrations: [{ userId: "a", status: "PRE_REGISTERED" }] });
  assert.equal(await nextRegistrationStatus(tx, "t1"), "PRE_REGISTERED");
});

test("un tournoi complet envoie en liste d'attente, qui ne prend pas de place", async () => {
  const tx = fakeTx({
    maxParticipants: 1,
    registrations: [{ userId: "a", status: "PRE_REGISTERED" }, { userId: "b", status: "WAITING_LIST" }],
  });
  assert.equal(await nextRegistrationStatus(tx, "t1"), "WAITING_LIST");
});

test("un tournoi sans nombre maximal de places accepte toujours", async () => {
  const tx = fakeTx({ maxParticipants: null, registrations: [{ userId: "a", status: "PRE_REGISTERED" }] });
  assert.equal(await nextRegistrationStatus(tx, "t1"), "PRE_REGISTERED");
});

test("une place libérée fait monter le plus ancien de la liste d'attente, et lui seul", async () => {
  const tx = fakeTx({
    maxParticipants: 2,
    registrations: [
      { userId: "a", status: "PRE_REGISTERED" },
      { userId: "b", status: "WAITING_LIST" },
      { userId: "c", status: "WAITING_LIST" },
    ],
  });
  assert.deepEqual(await promoteFromWaitingList(tx, "t1"), ["b"]);
  assert.equal(tx.rows.find((row) => row.userId === "b").status, "PRE_REGISTERED");
  assert.equal(tx.rows.find((row) => row.userId === "c").status, "WAITING_LIST");
});

test("rien ne monte de la liste d'attente d'un tournoi annulé", async () => {
  const tx = fakeTx({
    maxParticipants: 5,
    registrations: [{ userId: "b", status: "WAITING_LIST" }],
    tournament: { isCancelled: true },
  });
  assert.deepEqual(await promoteFromWaitingList(tx, "t1"), []);
});
