/**
 * Neutralisation d'un texte avant de l'insérer dans du HTML (carte 167, audit du 4 novembre 2026, section 2.6).
 * Un titre de sujet, un pseudo ou un extrait de message écrit par un membre peut contenir des caractères qui ont un
 * sens en HTML (`<`, `>`, `&`, guillemets). Sans précaution, un titre piégé glisserait par exemple un faux lien dans un
 * e-mail (hameçonnage). Chaque caractère sensible est donc remplacé par son équivalent affichable (« entité HTML »).
 * Fichier sans dépendance, pour être testé directement par Node (tests/unit/htmlEscape.test.mjs).
 */
const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Texte prêt à être inséré dans du HTML, entre deux balises ou dans un attribut entre guillemets. */
export function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (char) => HTML_ENTITIES[char]);
}

/** Comme escapeHtml, en gardant les retours à la ligne du texte (transformés en balise `<br>`). */
export function escapeHtmlMultiline(value: unknown): string {
  return escapeHtml(value).replace(/\r?\n/g, "<br>");
}
