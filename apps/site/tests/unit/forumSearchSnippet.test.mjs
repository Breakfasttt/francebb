/**
 * Tests unitaires de l'extrait des résultats de la recherche du forum (carte 191) : découpage de l'extrait préparé par
 * Postgres en morceaux à surligner ou non, points de suspension, retrait des balises BBCode.
 * Lancement : `pnpm test:unit` dans apps/site.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { HEADLINE_START, HEADLINE_STOP, headlineSnippet, plainSnippet, stripBBCode } from "../../lib/forumSearchSnippet.ts";

const mark = (word) => `${HEADLINE_START}${word}${HEADLINE_STOP}`;

test("les balises BBCode sont retirées et les espaces réduites", () => {
  assert.equal(stripBBCode("[b]Nains[/b] du  [url=https://exemple.fr]Chaos[/url]"), "Nains du Chaos");
});

test("les mots marqués par Postgres sont les morceaux à surligner", () => {
  const content = "Les Nains du Chaos sont là";
  const parts = headlineSnippet(`Les ${mark("Nains")} du ${mark("Chaos")} sont là`, content);
  assert.deepEqual(parts, [
    { text: "Les ", match: false },
    { text: "Nains", match: true },
    { text: " du ", match: false },
    { text: "Chaos", match: true },
    { text: " sont là", match: false },
  ]);
});

test("un extrait pris au milieu du message est entouré de points de suspension", () => {
  const content = `Début du message. ${"Bla ".repeat(50)}Mes ${"équipes"} préférées. ${"Fin ".repeat(50)}`;
  const parts = headlineSnippet(`Bla Bla Mes ${mark("équipes")} préférées. Fin Fin`, content);
  assert.equal(parts[0].text, "… ");
  assert.equal(parts.at(-1).text, " …");
  assert.ok(parts.some((part) => part.match && part.text === "équipes"));
});

test("un message entier ne reçoit pas de points de suspension, même sans sa ponctuation finale", () => {
  const parts = headlineSnippet(`Une ${mark("equipe")} solide`, "[i]Une equipe solide.[/i]");
  assert.equal(parts[0].text, "Une ");
  assert.equal(parts.at(-1).text, " solide");
});

test("une balise HTML écrite dans un message reste du texte (aucun morceau n'est du HTML)", () => {
  const parts = headlineSnippet(`<b>${mark("Nuffle")}</b>`, "<b>Nuffle</b>");
  assert.ok(parts.every((part) => typeof part.text === "string"));
  assert.ok(parts.some((part) => part.text.includes("<b>")));
});

test("un extrait vide redonne le début du message", () => {
  assert.deepEqual(headlineSnippet("", "[b]Bonjour[/b]"), [{ text: "Bonjour", match: false }]);
});

test("sans mot-clé, l'extrait est le début du message, coupé à 200 caractères", () => {
  const long = "a".repeat(250);
  assert.equal(plainSnippet(long)[0].text, `${"a".repeat(200)}…`);
  assert.equal(plainSnippet("[b]court[/b]")[0].text, "court");
});
