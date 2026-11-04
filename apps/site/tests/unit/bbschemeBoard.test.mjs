/**
 * Tests unitaires de la lecture d'un schéma BBScheme auprès de l'application BBScheme (carte 179) : forme de
 * l'identifiant, adresse appelée, et réponse `null` (« Schéma indisponible ») pour toute panne.
 * Lancement : `pnpm test:unit` dans apps/site (lanceur de tests intégré à Node, sans navigateur ni serveur).
 * L'appel réseau est remplacé par une fausse fonction `fetch` : aucun serveur n'est contacté.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { boardApiUrl, fetchBoardData, isValidBoardId } from "../../lib/bbschemeBoard.ts";

const BASE = "https://bbscheme.example";

/** Remplace `fetch` le temps d'un test ; renvoie la liste des adresses demandées. */
function stubFetch(t, answer) {
  const calls = [];
  const original = globalThis.fetch;
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    return answer();
  };
  t.after(() => {
    globalThis.fetch = original;
  });
  return calls;
}

test("un identifiant est fait de lettres, chiffres, tirets et soulignements", () => {
  assert.equal(isValidBoardId("cmo94vnd6000004l8ekjewfnb"), true);
  assert.equal(isValidBoardId("a3132e081edd2916ba847deebe6f9f4f"), true);
  assert.equal(isValidBoardId("e2e_audit-board"), true);
  for (const bad of ["", "../secret", "a/b", "a?b=1", "a b", "é", "x".repeat(65), null, undefined, 42]) {
    assert.equal(isValidBoardId(bad), false, `refusé : ${String(bad)}`);
  }
});

test("l'adresse appelée est celle de l'application BBScheme, sans double barre oblique", () => {
  assert.equal(boardApiUrl(BASE, "abc"), "https://bbscheme.example/api/boards/abc");
  assert.equal(boardApiUrl(`${BASE}/`, "abc"), "https://bbscheme.example/api/boards/abc");
  assert.equal(boardApiUrl(undefined, "abc"), null);
  assert.equal(boardApiUrl("", "abc"), null);
  assert.equal(boardApiUrl(BASE, "../abc"), null);
});

test("sans réglage BBSCHEME_URL ou avec un identifiant refusé, rien n'est demandé et la réponse est null", async (t) => {
  const calls = stubFetch(t, () => Response.json({ data: "{}" }));
  assert.equal(await fetchBoardData("abc", undefined), null);
  assert.equal(await fetchBoardData("a/b", BASE), null);
  assert.deepEqual(calls, []);
});

test("un schéma trouvé renvoie son contenu JSON", async (t) => {
  const calls = stubFetch(t, () => Response.json({ data: '{"frames":[]}' }));
  assert.equal(await fetchBoardData("abc", BASE), '{"frames":[]}');
  assert.deepEqual(calls, ["https://bbscheme.example/api/boards/abc"]);
});

test("schéma inconnu, réponse illisible ou application injoignable : null", async (t) => {
  let answer = () => Response.json({ error: "Schéma introuvable" }, { status: 404 });
  stubFetch(t, () => answer());
  assert.equal(await fetchBoardData("abc", BASE), null);
  answer = () => new Response("pas du JSON");
  assert.equal(await fetchBoardData("abc", BASE), null);
  answer = () => Response.json({ data: 42 });
  assert.equal(await fetchBoardData("abc", BASE), null);
  answer = () => {
    throw new TypeError("fetch failed");
  };
  assert.equal(await fetchBoardData("abc", BASE), null);
});
