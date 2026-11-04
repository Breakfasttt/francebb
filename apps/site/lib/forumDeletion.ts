/**
 * Règles de suppression du forum (carte 165) : qui peut supprimer un sujet ou un message, et ce qui se passe alors.
 *
 * Toutes les suppressions du forum sont « douces » : le sujet ou le message est marqué supprimé (avec la date, le
 * membre qui a supprimé et, pour la modération, une raison), mais rien n'est effacé de la base. Un modérateur peut
 * donc tout restaurer.
 *
 * - Un sujet ne se supprime que par un modérateur, sauf un cas : l'auteur qui supprime le premier message d'un sujet
 *   resté sans réponse supprime le sujet entier (un sujet vide n'a pas de sens).
 * - Un sujet qui porte un tournoi ayant des résultats ne se supprime pas : il faut d'abord annuler le tournoi, sinon
 *   les résultats du classement disparaîtraient avec lui.
 * - Un message se supprime par son auteur, ou par un modérateur avec une raison (un spam, par exemple).
 *
 * Ce fichier n'importe aucun autre fichier du site : les tests unitaires (tests/unit/forumDeletion.test.mjs) le lisent
 * directement avec Node.
 */

/** Résultat d'une demande de suppression d'un message. */
export type PostDeletionDecision =
  /** Suppression refusée, avec la phrase à montrer au membre. */
  | { kind: "refuse"; error: string }
  /** Le message seul est supprimé ; `byModeration` vaut vrai quand ce n'est pas son auteur qui le supprime. */
  | { kind: "deletePost"; byModeration: boolean }
  /** Premier message d'un sujet sans réponse : c'est le sujet entier qui est supprimé. */
  | { kind: "deleteTopic" };

/**
 * Décide ce qui se passe quand un membre demande à supprimer un message.
 * `otherVisiblePosts` compte les autres messages du sujet qui ne sont pas déjà supprimés (les réponses).
 */
export function decidePostDeletion(input: {
  viewerId: string;
  viewerIsModerator: boolean;
  post: { authorId: string; isDeleted: boolean };
  isFirstPost: boolean;
  otherVisiblePosts: number;
  topicHasTournament: boolean;
  reason?: string | null;
}): PostDeletionDecision {
  const { viewerId, viewerIsModerator, post, isFirstPost, otherVisiblePosts, topicHasTournament } = input;
  if (post.isDeleted) return { kind: "refuse", error: "Ce message est déjà supprimé." };

  // L'auteur supprime son propre message (même s'il est modérateur : pas de raison à donner)
  if (post.authorId === viewerId) {
    if (!isFirstPost) return { kind: "deletePost", byModeration: false };
    if (topicHasTournament) {
      return {
        kind: "refuse",
        error: "Ce message présente le tournoi : il ne peut pas être supprimé. Pour retirer le tournoi, annulez-le depuis les outils du sujet.",
      };
    }
    if (otherVisiblePosts > 0) {
      return {
        kind: "refuse",
        error:
          "C'est le premier message du sujet et d'autres membres y ont répondu : il ne peut plus être supprimé. Vous pouvez le modifier, ou demander à la modération de supprimer le sujet.",
      };
    }
    return { kind: "deleteTopic" };
  }

  if (!viewerIsModerator) return { kind: "refuse", error: "Seuls l'auteur du message et les modérateurs peuvent le supprimer." };
  if (!input.reason?.trim()) return { kind: "refuse", error: "Indiquez la raison de la suppression." };
  if (isFirstPost) {
    return {
      kind: "refuse",
      error: "C'est le premier message du sujet : pour le retirer, supprimez le sujet entier depuis les outils de modération.",
    };
  }
  return { kind: "deletePost", byModeration: true };
}

/**
 * Raison pour laquelle un modérateur ne peut pas supprimer ce sujet, ou `null` s'il le peut.
 * `tournament` vaut `null` quand le sujet ne porte pas de tournoi ; `resultCount` compte ses résultats publiés.
 */
export function topicDeletionRefusal(input: {
  viewerIsModerator: boolean;
  isDeleted: boolean;
  tournament: { isCancelled: boolean; resultCount: number } | null;
}): string | null {
  if (!input.viewerIsModerator) return "Seuls les modérateurs peuvent supprimer un sujet.";
  if (input.isDeleted) return "Ce sujet est déjà supprimé.";
  const tournament = input.tournament;
  if (tournament && tournament.resultCount > 0 && !tournament.isCancelled) {
    return "Ce sujet porte un tournoi qui a des résultats publiés. Annulez d'abord le tournoi (s'il est terminé, réouvrez-le puis annulez-le), puis supprimez le sujet.";
  }
  return null;
}

/** Qui a supprimé un message : son auteur, la modération, ou personne (message visible). */
export type PostDeletedBy = "author" | "moderation" | null;

/**
 * Qui a supprimé ce message. Les messages supprimés avant la carte 165 n'ont pas de `deletedById` : seul leur auteur
 * pouvait les supprimer à l'époque, ils comptent donc comme supprimés par leur auteur.
 */
export function postDeletedBy(post: { isDeleted: boolean; authorId: string; deletedById?: string | null }): PostDeletedBy {
  if (!post.isDeleted) return null;
  return post.deletedById && post.deletedById !== post.authorId ? "moderation" : "author";
}

/**
 * Vrai si ce modérateur peut restaurer le message : seulement un message supprimé par la modération. Un message que
 * son auteur a lui-même supprimé reste supprimé, c'était sa décision.
 */
export function canRestorePost(post: { isDeleted: boolean; authorId: string; deletedById?: string | null }, viewerIsModerator: boolean): boolean {
  return viewerIsModerator && postDeletedBy(post) === "moderation";
}

/**
 * Filtre (au format de Prisma, la bibliothèque qui lit la base) qui écarte les tournois dont le sujet du forum est
 * supprimé : la liste des tournois, la carte et l'accueil ne doivent pas mener à un sujet introuvable. Un tournoi
 * sans sujet reste affiché.
 */
export const TOURNAMENT_TOPIC_NOT_DELETED = { NOT: { topic: { is: { isDeleted: true } } } } as const;
