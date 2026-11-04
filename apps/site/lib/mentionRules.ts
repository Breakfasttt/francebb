/**
 * Lecture des mentions d'un message du forum (carte 167). Une mention s'écrit `[mention=<identifiant du membre>]` dans
 * le BBCode du message. Au plus MAX_MENTIONS_PER_POST membres sont pris en compte par message : au-delà, les mentions
 * restent affichées dans le texte mais ne préviennent personne (audit du 4 novembre 2026, section 2.6 : un message avec
 * 500 mentions envoyait 500 e-mails).
 * Fichier sans dépendance, pour être testé directement par Node (tests/unit/mentionRules.test.mjs).
 */
export const MAX_MENTIONS_PER_POST = 10;

const MENTION_PATTERN = /\[mention=([a-zA-Z0-9_-]+)\]/gi;

/**
 * Identifiants des membres mentionnés dans `content`, dans l'ordre d'apparition, sans doublon, sans l'auteur du
 * message lui-même, et au plus MAX_MENTIONS_PER_POST.
 */
export function extractMentionIds(content: string, authorId: string): string[] {
  const ids: string[] = [];
  for (const match of content.matchAll(MENTION_PATTERN)) {
    const id = match[1];
    if (id === authorId || ids.includes(id)) continue;
    ids.push(id);
    if (ids.length === MAX_MENTIONS_PER_POST) break;
  }
  return ids;
}
