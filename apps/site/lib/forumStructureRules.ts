/**
 * Règles pures de la structure du forum (carte 199) : ce qui interdit de créer, modifier ou supprimer un forum.
 * Elles ne lisent pas la base : `lib/forumStructure.ts` compte ce qu'il faut et leur passe les nombres. Elles sont
 * ainsi vérifiées directement par `tests/unit/forumStructureRules.test.mjs`.
 * Chaque fonction renvoie la raison du refus, à afficher au membre, ou `null` si l'opération est permise.
 */

/** Forum créé et utilisé par le site pour les annonces de tournois : ni renommé ni supprimé. */
export const PROTECTED_FORUM_NAME = "Les tournois";
/** Nombre maximal de sous-forums directs d'un forum. */
export const MAX_SUBFORUMS = 5;
/** Valeur de `allowedRoles` d'un forum ouvert à tous. */
export const PUBLIC_ACCESS = "ALL";

/** Refus de la création d'un forum. */
export function forumCreationRefusal(input: {
  name: string;
  hasContainer: boolean;
  nameTaken: boolean;
  siblingSubForums: number | null;
}): string | null {
  if (!input.name.trim()) return "Le nom du forum est obligatoire.";
  if (!input.hasContainer) return "Un forum doit appartenir à une catégorie ou à un forum parent.";
  if (input.nameTaken) return `Un forum porte déjà le nom « ${input.name.trim()} ».`;
  if (input.siblingSubForums !== null && input.siblingSubForums >= MAX_SUBFORUMS) {
    return `Le nombre maximum de sous-forums (${MAX_SUBFORUMS}) a été atteint pour ce forum.`;
  }
  return null;
}

/** Refus de la modification d'un forum (nom, description, accès). */
export function forumUpdateRefusal(input: {
  currentName: string;
  newName: string;
  currentAccess: string;
  newAccess: string;
  nameTaken: boolean;
  otherPublicForums: number;
}): string | null {
  if (!input.newName.trim()) return "Le nom du forum est obligatoire.";
  if (input.currentName === PROTECTED_FORUM_NAME && input.newName.trim() !== PROTECTED_FORUM_NAME) {
    return `Le forum « ${PROTECTED_FORUM_NAME} » ne peut pas être renommé.`;
  }
  if (input.nameTaken) return `Un forum porte déjà le nom « ${input.newName.trim()} ».`;
  if (input.currentAccess === PUBLIC_ACCESS && input.newAccess !== PUBLIC_ACCESS && input.otherPublicForums === 0) {
    return "Il faut garder au moins un forum ouvert à tous.";
  }
  return null;
}

/**
 * Refus de la suppression d'un forum. Un forum qui a des sous-forums est refusé (il faut d'abord les supprimer ou les
 * déplacer) : supprimer en cascade ferait perdre une partie de la structure sans que le membre l'ait vue.
 */
export function forumDeletionRefusal(input: {
  name: string;
  access: string;
  otherPublicForums: number;
  subForums: number;
  visibleTopics: number;
  deletedTopics: number;
}): string | null {
  if (input.name === PROTECTED_FORUM_NAME) {
    return `Le forum « ${PROTECTED_FORUM_NAME} » est protégé : le site y range les annonces de tournois.`;
  }
  if (input.access === PUBLIC_ACCESS && input.otherPublicForums === 0) {
    return "Impossible de supprimer le dernier forum ouvert à tous.";
  }
  if (input.subForums > 0) {
    return `Ce forum contient ${input.subForums} sous-forum${input.subForums > 1 ? "s" : ""}. Supprime-les ou déplace-les d'abord.`;
  }
  if (input.visibleTopics > 0) {
    const n = input.visibleTopics;
    return `Ce forum contient encore ${n} sujet${n > 1 ? "s" : ""}. Déplace-les d'abord vers un autre forum, ou supprime-les.`;
  }
  if (input.deletedTopics > 0) {
    const n = input.deletedTopics;
    const s = n > 1 ? "s" : "";
    return `Ce forum contient ${n} sujet${s} supprimé${s}, gardé${s} pour pouvoir être restauré${s}. Restaure-les et déplace-les vers un autre forum avant de supprimer celui-ci.`;
  }
  return null;
}
