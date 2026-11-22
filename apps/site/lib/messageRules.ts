/**
 * Règles de la messagerie privée, sans base de données (carte 221) : testables seules (tests/unit/messageRules.test.mjs)
 * et partagées entre l'écran (ConversationView.tsx) et les actions serveur (app/messagerie/actions.ts).
 */

/** Longueur maximale d'un message privé, la même à l'écran et sur le serveur. */
export const MESSAGE_MAX_LENGTH = 500;
/** Nombre maximal de participants d'une conversation de groupe, créateur compris. */
export const GROUP_MAX_PARTICIPANTS = 20;
/** Longueur maximale du nom d'un groupe. */
export const GROUP_NAME_MAX_LENGTH = 80;

/** Raison du refus d'un message, ou null s'il peut partir. */
export function messageContentError(content: unknown): string | null {
  if (typeof content !== "string" || content.trim().length === 0) return "Le message est vide.";
  if (content.length > MESSAGE_MAX_LENGTH) return `Message trop long (${MESSAGE_MAX_LENGTH} caractères au plus).`;
  return null;
}

/** Raison du refus d'un nom de groupe, ou null s'il convient (un nom vide retire le nom). */
export function groupNameError(name: unknown): string | null {
  if (name != null && typeof name !== "string") return "Nom invalide.";
  if (typeof name === "string" && name.trim().length > GROUP_NAME_MAX_LENGTH) {
    return `Nom trop long (${GROUP_NAME_MAX_LENGTH} caractères au plus).`;
  }
  return null;
}

/** Raison du refus d'une liste de destinataires, ou null. `participantCount` compte le créateur et les membres déjà là. */
export function participantsError(userIds: unknown, participantCount: number): string | null {
  if (!Array.isArray(userIds) || userIds.some((id) => typeof id !== "string" || id.length === 0)) return "Destinataires invalides.";
  if (participantCount > GROUP_MAX_PARTICIPANTS) return `Un groupe compte ${GROUP_MAX_PARTICIPANTS} membres au plus.`;
  return null;
}
