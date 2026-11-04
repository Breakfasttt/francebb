/**
 * Citations du forum (carte 183) : fabrication du texte BBCode d'une citation, et retrait des citations imbriquées.
 *
 * Quand un coach cite un message entier, les citations que ce message contenait déjà sont retirées : sans cela, les
 * citations s'empilent en pyramide (une citation dans une citation dans une citation…) et le coach doit les effacer à
 * la main. Quand il cite un passage qu'il a sélectionné, le passage est repris tel qu'il est affiché (du texte brut,
 * sans les balises BBCode du message d'origine).
 *
 * Ce fichier n'importe aucun autre fichier du site, pour que les tests unitaires (tests/unit/forumQuote.test.mjs)
 * puissent le lire directement. Il sert au navigateur (bouton « Citer ») comme au serveur (page de réponse).
 */

/** Une balise d'ouverture `[quote]` ou `[quote=…]`, ou une balise de fermeture `[/quote]`, en majuscules ou non. */
const QUOTE_TAG = /\[quote(?:=[^\]]*)?\]|\[\/quote\]/gi;

/**
 * Retire du texte BBCode les blocs `[quote…]…[/quote]`, y compris les citations placées les unes dans les autres.
 * Une balise de fermeture orpheline est gardée telle quelle ; une citation jamais refermée est gardée aussi, pour ne
 * perdre aucun texte du message. Les lignes vides laissées par les blocs retirés sont réduites à une seule.
 */
export function stripNestedQuotes(content: string): string {
  let result = "";
  let depth = 0;
  // Début du texte à garder (en dehors de toute citation), et début de la citation ouverte la plus extérieure
  let keepFrom = 0;
  let openedAt = 0;

  for (const match of content.matchAll(QUOTE_TAG)) {
    const index = match.index ?? 0;
    const isClosing = match[0].startsWith("[/");
    if (!isClosing) {
      if (depth === 0) {
        result += content.slice(keepFrom, index);
        openedAt = index;
      }
      depth++;
    } else if (depth > 0) {
      depth--;
      if (depth === 0) keepFrom = index + match[0].length;
    }
  }

  // Citation jamais refermée : son texte est gardé ; sinon, la fin du message après la dernière citation
  result += depth > 0 ? content.slice(openedAt) : content.slice(keepFrom);
  return result.replace(/\n{3,}/g, "\n\n").trim();
}

/** Ce qu'il faut savoir du message cité pour écrire la balise `[quote=idDuMembre|idDuMessage|Pseudo]`. */
export interface QuoteSource {
  authorId: string;
  postId: string;
  authorName: string;
}

/** Texte BBCode d'une citation, suivi d'un retour à la ligne pour que le coach écrive sa réponse dessous. */
export function buildQuote(source: QuoteSource, text: string): string {
  return `[quote=${source.authorId}|${source.postId}|${source.authorName}]${text.trim()}[/quote]\n`;
}

/** Citation d'un message entier, sans les citations qu'il contient. */
export function buildFullPostQuote(source: QuoteSource, content: string): string {
  return buildQuote(source, stripNestedQuotes(content));
}

/**
 * Ajoute une citation à la fin du texte déjà écrit dans l'éditeur, sans rien remplacer : un retour à la ligne la
 * sépare du texte existant s'il n'en finit pas déjà par un.
 */
export function appendQuote(current: string, quote: string): string {
  if (!current) return quote;
  return current.endsWith("\n") ? current + quote : `${current}\n${quote}`;
}
