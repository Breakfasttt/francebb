/**
 * Règles des brouillons de message (carte 181), sans accès au navigateur : nom de la case de rangement, format
 * enregistré, expiration après 7 jours et choix du texte à restaurer. Le crochet `useDraft`
 * (`common/hooks/useDraft.ts`) s'en sert pour lire et écrire dans le stockage du navigateur (`localStorage`).
 * Vérifiées par `tests/unit/draftRules.test.mjs` : ce fichier n'importe rien d'autre du projet.
 */

/** Début du nom de toutes les cases de brouillon, pour les retrouver et effacer celles qui ont expiré. */
export const DRAFT_KEY_PREFIX = "bbfrance:draft:";

/** Un brouillon plus vieux que 7 jours n'est plus proposé, et il est effacé. */
export const DRAFT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/** Délai sans frappe avant d'enregistrer le brouillon (une écriture par pause, pas une par touche). */
export const DRAFT_SAVE_DELAY_MS = 1000;

/** Ce qui est enregistré : le texte et la date de l'enregistrement, en millisecondes. */
export type StoredDraft = { text: string; savedAt: number };

/**
 * Nom de la case d'un brouillon : un par membre, par écran et par sujet (ou message, ou forum).
 * `scope` décrit l'écran et l'élément, par exemple `reply:<sujet>` ou `edit:<message>`.
 */
export function draftStorageKey(scope: string, userId?: string | null): string {
  return `${DRAFT_KEY_PREFIX}${userId || "visiteur"}:${scope}`;
}

/** Vrai quand le texte mérite d'être gardé : ni vide, ni identique au texte de départ de l'écran. */
export function hasDraftChanges(text: string, initialValue: string): boolean {
  return text.trim() !== "" && text !== initialValue;
}

/** Vrai quand le brouillon a plus de 7 jours (ou une date illisible). */
export function isDraftExpired(savedAt: number, now: number): boolean {
  return !Number.isFinite(savedAt) || now - savedAt > DRAFT_MAX_AGE_MS;
}

/** Texte enregistré dans la case. */
export function serializeDraft(text: string, now: number): string {
  const draft: StoredDraft = { text, savedAt: now };
  return JSON.stringify(draft);
}

/** Relit une case ; renvoie `null` si elle est vide ou abîmée. */
export function parseStoredDraft(raw: string | null): StoredDraft | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<StoredDraft> | null;
    if (!value || typeof value.text !== "string" || typeof value.savedAt !== "number") return null;
    return { text: value.text, savedAt: value.savedAt };
  } catch {
    return null;
  }
}

/**
 * Texte à remettre dans l'éditeur à l'ouverture de l'écran, ou `null` s'il n'y a rien à restaurer : case vide ou
 * abîmée, brouillon expiré, vide ou identique au texte de départ (par exemple le message que l'on modifie).
 */
export function draftToRestore(raw: string | null, initialValue: string, now: number): string | null {
  const draft = parseStoredDraft(raw);
  if (!draft || isDraftExpired(draft.savedAt, now)) return null;
  return hasDraftChanges(draft.text, initialValue) ? draft.text : null;
}
