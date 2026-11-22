/**
 * Tests unitaires du corps d'une annonce par e-mail (carte 221) : gras, italique, liens http(s) et retours à la ligne
 * passent ; tout le reste est neutralisé ou retiré.
 * Lancement : `pnpm test:unit` dans apps/site.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { announcementBodyHtml } from "../../lib/announcementMail.ts";

const A = (href, label = href) => `<a href="${href}" style="color:#c8102e;">${label}</a>`;

test("gras, italique et retours à la ligne", () => {
  assert.equal(announcementBodyHtml("[b]Salut[/b]\n[i]coach[/i]"), "<strong>Salut</strong><br><em>coach</em>");
});

test("lien BBCode avec texte et lien seul", () => {
  assert.equal(announcementBodyHtml("[url=https://bbfrance.fr/tournois]Les tournois[/url]"), A("https://bbfrance.fr/tournois", "Les tournois"));
  assert.equal(announcementBodyHtml("[url]https://bbfrance.fr[/url]"), A("https://bbfrance.fr"));
});

test("lien écrit en clair, sans la ponctuation finale", () => {
  assert.equal(announcementBodyHtml("Va voir https://bbfrance.fr/forum."), `Va voir ${A("https://bbfrance.fr/forum")}.`);
});

test("une adresse javascript ne devient jamais un lien", () => {
  assert.equal(announcementBodyHtml("[url=javascript:alert(1)]clic[/url]"), "clic");
});

test("le HTML écrit à la main est neutralisé", () => {
  assert.equal(announcementBodyHtml(`<a href="x">piège</a>`), "&lt;a href=&quot;x&quot;&gt;piège&lt;/a&gt;");
});

test("un guillemet ne sort pas de l'attribut du lien", () => {
  assert.equal(announcementBodyHtml(`https://a.fr/"onmouseover="x`), `${A("https://a.fr/")}&quot;onmouseover=&quot;x`);
});

test("les autres balises BBCode sont retirées, leur texte reste", () => {
  assert.equal(announcementBodyHtml("[color=red]Rouge[/color] [spoiler]caché[/spoiler]"), "Rouge caché");
});
