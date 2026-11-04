/**
 * Tests unitaires des citations du forum (carte 183) : retrait des citations imbriquées, texte d'une citation et
 * ajout d'une citation à la fin d'une réponse déjà commencée.
 * Lancement : `pnpm test:unit` dans apps/site (lanceur de tests intégré à Node, sans navigateur ni serveur).
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { appendQuote, buildFullPostQuote, buildQuote, stripNestedQuotes } from "../../lib/forumQuote.ts";

const SOURCE = { authorId: "u1", postId: "p1", authorName: "Grombrindal" };

test("un message sans citation est gardé tel quel", () => {
  assert.equal(stripNestedQuotes("Bonjour à tous"), "Bonjour à tous");
});

test("une citation est retirée, le texte autour est gardé", () => {
  assert.equal(stripNestedQuotes("[quote=u2|p2|Bob]Avant[/quote]\nMa réponse"), "Ma réponse");
  assert.equal(stripNestedQuotes("Début [quote]milieu[/quote] fin"), "Début  fin");
});

test("des citations imbriquées sont retirées en entier", () => {
  const content = "[quote=u2|p2|Bob]Bob dit[quote=u3|p3|Ann]Ann dit[/quote]suite de Bob[/quote]\n\n\n\nMa réponse";
  assert.equal(stripNestedQuotes(content), "Ma réponse");
});

test("plusieurs citations à la suite sont retirées, en majuscules aussi", () => {
  assert.equal(stripNestedQuotes("A[QUOTE]x[/QUOTE]B[quote=u|p|n]y[/quote]C"), "ABC");
});

test("une balise de fermeture orpheline et une citation jamais refermée sont gardées", () => {
  assert.equal(stripNestedQuotes("texte [/quote] suite"), "texte [/quote] suite");
  assert.equal(stripNestedQuotes("texte [quote]jamais fermée"), "texte [quote]jamais fermée");
});

test("buildQuote écrit la balise avec l'auteur et le message, puis un retour à la ligne", () => {
  assert.equal(buildQuote(SOURCE, "  un passage  "), "[quote=u1|p1|Grombrindal]un passage[/quote]\n");
});

test("buildFullPostQuote cite un message sans ses citations", () => {
  assert.equal(
    buildFullPostQuote(SOURCE, "[quote=u2|p2|Bob]vieux[/quote]Mon avis"),
    "[quote=u1|p1|Grombrindal]Mon avis[/quote]\n"
  );
});

test("appendQuote ajoute la citation à la fin, sans remplacer le texte déjà écrit", () => {
  const quote = "[quote=u1|p1|G]x[/quote]\n";
  assert.equal(appendQuote("", quote), quote);
  assert.equal(appendQuote("Mon brouillon", quote), `Mon brouillon\n${quote}`);
  assert.equal(appendQuote("Mon brouillon\n", quote), `Mon brouillon\n${quote}`);
});
