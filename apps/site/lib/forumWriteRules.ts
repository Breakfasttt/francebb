/**
 * Règles d'écriture du forum (carte 169), sans accès à la base : elles sont vérifiées par
 * `tests/unit/forumWriteRules.test.mjs`. Ce fichier n'importe rien, pour pouvoir être testé directement par Node.
 *
 * - Longueur d'un titre de sujet et d'un message : avant cette carte, un message fait seulement d'espaces, un titre
 *   vide après un renommage ou un message de plusieurs mégaoctets étaient acceptés. Un message géant ralentissait aussi
 *   l'affichage de la page, car la mise en forme BBCode relit le texte balise par balise.
 * - Sujet fermé : un sujet verrouillé, archivé ou rangé dans un forum verrouillé n'accepte plus de réponse ni de
 *   réaction, sauf d'un modérateur. Avant cette carte, un sujet archivé acceptait encore des réponses, qui
 *   n'apparaissaient nulle part puisque les sujets archivés sont retirés des listes.
 * - Réactions : seuls les émojis proposés à l'écran sont acceptés par le serveur.
 */

/** Un titre doit compter au moins 3 caractères (espaces du début et de la fin non comptés). */
export const TOPIC_TITLE_MIN_LENGTH = 3;
/** Un titre compte au plus 150 caractères : au-delà, il ne tient plus dans les listes. */
export const TOPIC_TITLE_MAX_LENGTH = 150;
/** Un message compte au plus 30 000 caractères, soit une quinzaine de pages de texte. */
export const POST_CONTENT_MAX_LENGTH = 30_000;

/** Raison du refus d'un titre de sujet, ou `null` s'il est accepté. */
export function topicTitleError(title: unknown): string | null {
  const clean = typeof title === "string" ? title.trim() : "";
  if (!clean) return "Le titre du sujet est obligatoire.";
  if (clean.length < TOPIC_TITLE_MIN_LENGTH) return `Le titre doit compter au moins ${TOPIC_TITLE_MIN_LENGTH} caractères.`;
  if (clean.length > TOPIC_TITLE_MAX_LENGTH) return `Le titre ne doit pas dépasser ${TOPIC_TITLE_MAX_LENGTH} caractères.`;
  return null;
}

/** Raison du refus d'un message, ou `null` s'il est accepté. Un message fait seulement d'espaces est vide. */
export function postContentError(content: unknown): string | null {
  const text = typeof content === "string" ? content : "";
  if (!text.trim()) return "Le message est vide.";
  if (text.length > POST_CONTENT_MAX_LENGTH) {
    return `Le message est trop long : ${text.length.toLocaleString("fr-FR")} caractères pour ${POST_CONTENT_MAX_LENGTH.toLocaleString("fr-FR")} au plus.`;
  }
  return null;
}

/** État d'un sujet utile pour savoir si l'on peut encore y écrire. */
export interface TopicWriteState {
  isLocked: boolean;
  isArchived: boolean;
  forumIsLocked: boolean;
}

/**
 * Vrai si le sujet est fermé pour ce membre : verrouillé, archivé, ou rangé dans un forum verrouillé. Un modérateur
 * peut toujours y écrire. Un sujet archivé est traité comme un sujet verrouillé.
 */
export function isTopicClosedFor(topic: TopicWriteState, viewerIsModerator: boolean): boolean {
  if (viewerIsModerator) return false;
  return topic.isLocked || topic.isArchived || topic.forumIsLocked;
}

/** Phrase qui explique pourquoi le sujet est fermé (même ordre de priorité que l'encart de la page du sujet). */
export function closedTopicMessage(topic: TopicWriteState): string {
  if (topic.forumIsLocked) return "Ce forum est verrouillé : on ne peut plus y répondre.";
  if (topic.isArchived) return "Ce sujet est archivé : on ne peut plus y répondre ni y réagir.";
  return "Ce sujet est verrouillé : on ne peut plus y répondre ni y réagir.";
}

/** Les émojis proposés pour réagir à un message, dans l'ordre du sélecteur. */
export const REACTION_EMOJIS = ["👍", "❤️", "😂", "😢", "😡", "🔥", "👀", "🎉", "👎", "🍻"] as const;

/** Vrai si cet émoji fait partie de ceux que l'on peut ajouter en réaction. */
export function isAllowedReaction(emoji: unknown): boolean {
  return typeof emoji === "string" && (REACTION_EMOJIS as readonly string[]).includes(emoji);
}
