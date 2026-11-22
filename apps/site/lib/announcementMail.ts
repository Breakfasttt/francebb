/**
 * Corps HTML d'une annonce par e-mail de l'administration (carte 221). Le texte est d'abord neutralisé (`escapeHtml`),
 * puis un petit sous-ensemble sûr de BBCode est converti : gras `[b]`, italique `[i]`, liens `[url]` en http(s)
 * seulement, liens écrits en clair et retours à la ligne. Toute autre balise BBCode est retirée (un e-mail ne sait
 * pas afficher un spoiler ou une galerie). Fichier pur, testé par tests/unit/announcementMail.test.mjs.
 */
import { escapeHtml } from "./htmlEscape";

/** Adresse http(s) dans un texte déjà neutralisé : s'arrête aux espaces, crochets et entités de guillemet ou chevron. */
const URL_BODY = String.raw`https?:\/\/(?:(?!&quot;|&#39;|&lt;|&gt;)[^\s\[\]])+`;
const TRAILING_PUNCTUATION = /[.,;:!?)]+$/;

/** Balises BBCode que l'annonce sait rendre, rappelées sous le champ du formulaire. */
export const ANNOUNCEMENT_FORMAT_HELP = "[b]gras[/b], [i]italique[/i], [url=https://…]texte du lien[/url]";

function link(href: string, label: string): string {
  return `<a href="${href}" style="color:#c8102e;">${label}</a>`;
}

export function announcementBodyHtml(text: string): string {
  const links: string[] = [];
  const keep = (html: string) => `\u0000${links.push(html) - 1}\u0000`;
  let html = escapeHtml(text.replace(/\u0000/g, ""));

  // Liens BBCode : [url=https://…]texte[/url] et [url]https://…[/url]. Une adresse autre que http(s) perd son lien.
  html = html.replace(new RegExp(String.raw`\[url=(${URL_BODY})\]([\s\S]*?)\[\/url\]`, "gi"), (_m, href: string, label: string) =>
    keep(link(href, label.trim() || href)));
  html = html.replace(new RegExp(String.raw`\[url\](${URL_BODY})\[\/url\]`, "gi"), (_m, href: string) => keep(link(href, href)));

  // Liens écrits en clair, sans la ponctuation qui les suit.
  html = html.replace(new RegExp(URL_BODY, "gi"), (match: string) => {
    const trailing = match.match(TRAILING_PUNCTUATION)?.[0] ?? "";
    const href = match.slice(0, match.length - trailing.length);
    return keep(link(href, href)) + trailing;
  });

  html = html
    .replace(/\[b\]([\s\S]*?)\[\/b\]/gi, "<strong>$1</strong>")
    .replace(/\[i\]([\s\S]*?)\[\/i\]/gi, "<em>$1</em>")
    // Toute autre balise BBCode (ouvrante ou fermante) disparaît, son texte reste.
    .replace(/\[\/?[a-z*]+(?:=[^\]]*)?\]/gi, "")
    .replace(/\u0000(\d+)\u0000/g, (_m, index: string) => links[Number(index)])
    .trim()
    .replace(/\r?\n/g, "<br>");
  return html;
}
