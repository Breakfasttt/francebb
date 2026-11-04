/**
 * Tests unitaires du moteur BBCode (carte 159) : aucune formule, même en imbriquant des balises, ne doit produire
 * un attribut HTML actif (onerror, onmouseover…) ni une adresse javascript:.
 * Lancement : `pnpm test:unit` dans apps/site (lanceur de tests intégré à Node, sans navigateur ni serveur).
 * Le fichier est en .mjs pour être lu directement par Node, qui sait retirer les types de lib/bbcode.ts.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseBBCode, parseInlineBBCode } from "../../lib/bbcode.ts";

/** Formules piégées relevées par l'audit du 4 novembre 2026 (section 2.1), et variantes. */
const TRAPS = [
  "[gallery][color=rgb( onerror=alert(1) x=)]a[/color][/gallery]",
  "[img][color=rgb(/onerror=alert(1)//x=)]a[/color][/img]",
  "[url][color=rgb( onmouseover=alert(1) x=)]a[/color][/url]",
  "[url=[color=rgb( onmouseover=alert(1) x=)]a[/color]]lien[/url]",
  "[quote=[color=rgb( onmouseover=alert(1) x=)]a[/color]|p1]texte[/quote]",
  "[bbscheme][color=rgb( onerror=alert(1) x=)]a[/color][/bbscheme]",
  "[gallery][size=12]a[/size][/gallery]",
  "[img][b]x[/b][/img]",
  "[gallery]x\" onerror=alert(1) x=\"[/gallery]",
  "[url=javascript:alert(1)]lien[/url]",
  "[img]javascript:alert(1)[/img]",
  "[color=red\" onmouseover=\"alert(1)]texte[/color]",
  "[size=12px;background:url(javascript:alert(1))]texte[/size]",
  "<img src=x onerror=alert(1)>",
];

/** Un attribut d'événement (on…=) placé dans une balise HTML produite ; le navigateur accepte aussi « / » comme séparateur. */
const EVENT_ATTRIBUTE = /<[^>]*[\s/"']on[a-z]+\s*=/i;

for (const trap of TRAPS) {
  test(`aucun code actif : ${trap}`, () => {
    for (const html of [parseBBCode(trap), parseInlineBBCode(trap)]) {
      assert.doesNotMatch(html, EVENT_ATTRIBUTE, html);
      assert.doesNotMatch(html, /(href|src)\s*=\s*"\s*javascript:/i, html);
    }
  });
}

test("les spoilers n'utilisent plus d'attribut onclick", () => {
  const html = parseBBCode("[spoiler=Titre]caché[/spoiler]");
  assert.match(html, /bb-spoiler-box/);
  assert.doesNotMatch(html, /onclick/i);
});

test("les balises ordinaires fonctionnent toujours", () => {
  assert.match(parseBBCode("[color=#ff0000]rouge[/color]"), /<span style="color: #ff0000">rouge<\/span>/);
  assert.match(parseBBCode("[color=rgb(10, 20, 30)]x[/color]"), /color: rgb\(10, 20, 30\)/);
  assert.match(parseBBCode("[img]https://exemple.fr/a.png[/img]"), /<img src="https:\/\/exemple\.fr\/a\.png"/);
  assert.match(parseBBCode("[url=https://exemple.fr]lien[/url]"), /<a href="https:\/\/exemple\.fr"/);
  assert.match(parseBBCode("[gallery]https://exemple.fr/a.png,https://exemple.fr/b.png[/gallery]"), /<img src="https:\/\/exemple\.fr\/b\.png"/);
  assert.match(parseBBCode("[quote=user_1|post_1|Jean]bonjour[/quote]"), /@Jean/);
  assert.match(parseBBCode("[bbscheme]abc123[/bbscheme]"), /data-board-id="abc123"/);
});

test("citations (carte 169) : lien permanent vers le message cité", () => {
  const html = parseBBCode("[quote=user_1|post_1|Jean]bonjour[/quote]");
  assert.match(html, /href="\/forum\/post\/post_1"/);
  assert.doesNotMatch(html, /href="#post-/);
});

test("citations (carte 169) : « Par @… » seulement si l'auteur du message cité correspond", () => {
  const map = { post_1: { isDeleted: false, isModerated: false, authorId: "user_1", authorName: "Jean <b>" } };
  // Bon auteur : l'onglet affiche le pseudo de la base (échappé), pas celui écrit dans la balise
  const genuine = parseBBCode("[quote=user_1|post_1|Faux nom]bonjour[/quote]", map);
  assert.match(genuine, /@Jean &lt;b&gt;/);
  assert.doesNotMatch(genuine, /Faux nom/);
  // Citation forgée : le message existe mais n'est pas de ce membre
  const forged = parseBBCode("[quote=user_2|post_1|Paul]texte inventé[/quote]", map);
  assert.doesNotMatch(forged, /Par&nbsp;/);
  assert.match(forged, /texte inventé/);
  // Message cité inconnu, ou citation sans message : pas d'onglet « Par @… » sur les pages du forum
  assert.doesNotMatch(parseBBCode("[quote=user_1|inconnu|Jean]x[/quote]", map), /Par&nbsp;/);
  assert.doesNotMatch(parseBBCode("[quote=user_1||Jean]x[/quote]", map), /Par&nbsp;/);
  // Sans état des messages cités (aperçu, messagerie), la balise reste affichée telle qu'elle est écrite
  assert.match(parseBBCode("[quote=user_2|post_1|Paul]x[/quote]"), /@Paul/);
});
