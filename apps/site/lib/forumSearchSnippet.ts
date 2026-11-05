/**
 * Extrait d'un message affiché dans les résultats de la recherche du forum (carte 191).
 * L'extrait est préparé par Postgres (fonction `ts_headline`, voir app/forum/search/page.tsx) : il choisit les passages
 * qui contiennent les mots cherchés et entoure chaque mot trouvé de deux caractères de contrôle invisibles,
 * HEADLINE_START et HEADLINE_STOP. Comme la recherche, il ignore les accents et les pluriels : chercher « équipe »
 * surligne « equipes ».
 * Les fonctions ci-dessous découpent cet extrait en morceaux de texte, dont certains sont à surligner. Les morceaux
 * sont affichés comme du texte, jamais comme du HTML : une balise écrite dans un message ne peut rien exécuter.
 * Ce fichier n'importe rien, pour être testé seul (tests/unit/forumSearchSnippet.test.mjs).
 */

/** Caractère placé par Postgres juste avant un mot trouvé (caractère de contrôle, absent d'un message normal). */
export const HEADLINE_START = "\u0002";
/** Caractère placé par Postgres juste après un mot trouvé. */
export const HEADLINE_STOP = "\u0003";

/**
 * Réglages de `ts_headline` : marques des mots trouvés, jusqu'à deux passages de 12 à 30 mots, séparés par « … ».
 * Les valeurs entre guillemets doubles peuvent contenir n'importe quel caractère.
 */
export const HEADLINE_OPTIONS = `StartSel="${HEADLINE_START}", StopSel="${HEADLINE_STOP}", MaxWords=30, MinWords=12, ShortWord=2, MaxFragments=2, FragmentDelimiter=" … "`;

/**
 * Motif (expression régulière de Postgres) d'une balise BBCode, comme « [b] », « [/url] » ou « [img=200] ». Le même
 * motif sert à la colonne de recherche (migration 20261105150000_recherche_plein_texte) et à l'extrait.
 */
export const BBCODE_TAG_PATTERN = "\\[[^\\]]*\\]";

/** Longueur de l'extrait quand on cherche sans mot-clé (seulement par auteur ou par forum). */
const SNIPPET_LENGTH = 200;

/** Nombre de caractères comparés pour savoir si l'extrait commence au début du message ou finit à sa fin. */
const EDGE_LENGTH = 20;

export type SnippetPart = { text: string; match: boolean };

/** Texte d'un message sans ses balises BBCode, chaque balise remplacée par une espace, espaces multiples réduites. */
export function stripBBCode(content: string): string {
  return content.replace(new RegExp(BBCODE_TAG_PATTERN, "g"), " ").replace(/\s+/g, " ").trim();
}

/** Extrait sans mot-clé : le début du message, sans BBCode, coupé à 200 caractères. */
export function plainSnippet(content: string): SnippetPart[] {
  const stripped = stripBBCode(content);
  return [{ text: stripped.length > SNIPPET_LENGTH ? `${stripped.substring(0, SNIPPET_LENGTH)}…` : stripped, match: false }];
}

/**
 * Découpe l'extrait rendu par `ts_headline` en morceaux, les mots trouvés étant marqués `match`. Des points de
 * suspension sont ajoutés au début (ou à la fin) quand l'extrait ne commence pas au début du message (ou ne finit pas à
 * sa fin). `content` est le message d'origine, avec son BBCode.
 */
export function headlineSnippet(headline: string, content: string): SnippetPart[] {
  const parts: SnippetPart[] = [];
  let match = false;
  let current = "";
  const flush = () => {
    if (current !== "") parts.push({ text: current, match });
    current = "";
  };
  for (const char of headline.replace(/\s+/g, " ").trim()) {
    if (char === HEADLINE_START || char === HEADLINE_STOP) {
      flush();
      match = char === HEADLINE_START;
    } else {
      current += char;
    }
  }
  flush();
  if (parts.length === 0) return plainSnippet(content);

  // Comparaison sur les seules lettres et chiffres : Postgres retire de l'extrait la ponctuation finale et les balises
  // HTML écrites dans le message, qui ne doivent pas faire croire à un passage coupé.
  const shown = lettersOnly(parts.map((part) => part.text).join(""));
  const full = lettersOnly(content.replace(new RegExp(BBCODE_TAG_PATTERN, "g"), " "));
  if (!full.startsWith(shown.substring(0, EDGE_LENGTH))) parts.unshift({ text: "… ", match: false });
  if (!full.endsWith(shown.substring(shown.length - EDGE_LENGTH))) parts.push({ text: " …", match: false });
  return parts;
}

/** Lettres et chiffres d'un texte, en minuscules, sans rien d'autre. */
function lettersOnly(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
}
