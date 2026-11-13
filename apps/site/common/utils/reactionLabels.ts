/**
 * Noms français des émojis de réaction, pour les lecteurs d'écran. Sans cela, un bouton « 👍 » est lu avec le nom
 * anglais du caractère (« thumbs up »). Partagé par les réactions des messages du forum et celles des articles
 * (carte 195). La liste des émojis autorisés reste celle de `lib/forumWriteRules.ts`.
 */

const REACTION_NAMES: Record<string, string> = {
  "👍": "Pouce levé",
  "❤️": "Cœur",
  "😂": "Rire",
  "😢": "Tristesse",
  "😡": "Colère",
  "🔥": "Feu",
  "👀": "Yeux",
  "🎉": "Fête",
  "👎": "Pouce baissé",
  "🍻": "Bières",
};

/** Nom français d'un émoji de réaction (l'émoji lui-même s'il n'est pas dans la table). */
export function reactionName(emoji: string): string {
  return REACTION_NAMES[emoji] ?? emoji;
}

/** Nom lu pour une pastille avec compteur : « Pouce levé, 3 réactions (votre réaction) ». */
export function reactionPillLabel(emoji: string, count: number, hasReacted: boolean): string {
  const plural = count > 1 ? "réactions" : "réaction";
  return `${reactionName(emoji)}, ${count} ${plural}${hasReacted ? " (votre réaction)" : ""}`;
}
