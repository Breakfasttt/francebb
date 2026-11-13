/**
 * Droits d'un membre sur un sujet ou un message du forum (carte 200), calculés à un seul endroit.
 *
 * Avant cette carte, le serveur et l'écran recalculaient chacun ces règles, et les copies avaient divergé :
 * - l'outil « Répondre » du sujet ignorait l'archivage, alors que le serveur refusait la réponse ;
 * - le menu d'un message proposait « Modifier » dans un sujet fermé, puis l'action échouait.
 * Le serveur (actions de `app/forum/actions.ts`) et la page du sujet appellent maintenant ces fonctions ; la page
 * transmet le résultat aux composants (`TopicTools`, `PostItem`, `PostMoreMenu`), qui ne recalculent plus rien.
 *
 * Règles pures, sans accès à la base (testées par `tests/unit/forumRights.test.mjs`). Le chargement de l'élément,
 * lui, passe toujours par `lib/forumAccess.ts`, qui cache les forums réservés à d'autres rôles.
 */
import { isTopicClosedFor, type TopicWriteState } from "@/lib/forumWriteRules";

/** Membre qui regarde ou agit : `id` absent pour un visiteur non connecté. */
export interface ForumViewer {
  id?: string | null;
  isModerator: boolean;
}

/**
 * Peut répondre au sujet (et y réagir) : membre connecté, sujet non supprimé, et sujet ni verrouillé ni archivé, dans
 * un forum non verrouillé. Un modérateur passe outre la fermeture, mais pas la suppression : un sujet supprimé doit
 * d'abord être restauré.
 */
export function canReplyToTopic(viewer: ForumViewer, topic: TopicWriteState & { isDeleted: boolean }): boolean {
  return !!viewer.id && !topic.isDeleted && !isTopicClosedFor(topic, viewer.isModerator);
}

/**
 * Peut modifier ou supprimer un message : un modérateur toujours ; son auteur seulement tant que le sujet n'est pas
 * fermé (verrouillé, archivé ou dans un forum verrouillé), comme le vérifient `updatePost` et `deletePost`.
 * `topicClosed` vaut l'état du sujet pour un membre ordinaire (`isTopicClosedFor(topic, false)`).
 */
export function canEditPost(viewer: ForumViewer, topicClosed: boolean, authorId: string): boolean {
  if (!viewer.id) return false;
  if (viewer.isModerator) return true;
  return viewer.id === authorId && !topicClosed;
}
