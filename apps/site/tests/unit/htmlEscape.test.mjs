/**
 * Tests unitaires de la neutralisation des textes insérés dans les e-mails (carte 167) : un titre de sujet, un pseudo
 * ou un extrait de message ne doit jamais pouvoir ajouter une balise ou un lien dans le HTML d'un e-mail.
 * Lancement : `pnpm test:unit` dans apps/site.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { escapeHtml, escapeHtmlMultiline } from "../../lib/htmlEscape.ts";

test("les caractères sensibles du HTML sont remplacés", () => {
  assert.equal(escapeHtml(`<a href="https://piege.example">Cliquez</a> & 'co'`),
    "&lt;a href=&quot;https://piege.example&quot;&gt;Cliquez&lt;/a&gt; &amp; &#39;co&#39;");
});

test("un texte sans caractère sensible reste identique", () => {
  assert.equal(escapeHtml("Tournoi de Nuffle 2026 — inscriptions ouvertes"), "Tournoi de Nuffle 2026 — inscriptions ouvertes");
});

test("une valeur vide ou non textuelle devient un texte", () => {
  assert.equal(escapeHtml(null), "");
  assert.equal(escapeHtml(undefined), "");
  assert.equal(escapeHtml(42), "42");
});

test("une entité déjà écrite est neutralisée aussi (pas de double sens)", () => {
  assert.equal(escapeHtml("&lt;script&gt;"), "&amp;lt;script&amp;gt;");
});

test("la version multiligne garde les retours à la ligne", () => {
  assert.equal(escapeHtmlMultiline("Ligne 1\nLigne <2>\r\nLigne 3"), "Ligne 1<br>Ligne &lt;2&gt;<br>Ligne 3");
});
