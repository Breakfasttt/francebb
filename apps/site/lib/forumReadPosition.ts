/**
 * Règles de lecture du forum (carte 166), sans accès à la base : elles sont vérifiées par
 * `tests/unit/forumReadPosition.test.mjs`. Ce fichier n'importe rien, pour pouvoir être testé directement par Node.
 *
 * La « position de lecture » d'un membre dans un sujet est le dernier message qu'il a eu sous les yeux, repéré par sa
 * date de création et son identifiant (table `TopicView`, colonnes `lastReadPostAt` et `lastPostId`). Les messages
 * d'un sujet sont rangés dans cet ordre : date de création, puis identifiant quand deux messages ont la même date.
 * Un identifiant vide veut dire « tout est lu jusqu'à cette date, incluse ».
 */

export interface ReadPosition {
  at: Date;
  postId: string | null;
}

/** Vrai si la position `a` est strictement plus loin dans le sujet que la position `b`. */
export function isPositionAfter(a: ReadPosition, b: ReadPosition): boolean {
  const diff = a.at.getTime() - b.at.getTime();
  if (diff !== 0) return diff > 0;
  return (a.postId ?? "") > (b.postId ?? "");
}

/**
 * Nouvelle position après l'affichage d'une page : la position ne recule jamais. Renvoie `null` quand la position
 * enregistrée est déjà plus loin (ou au même endroit) : il n'y a alors rien à changer.
 */
export function advanceReadPosition(current: ReadPosition | null, shown: ReadPosition): ReadPosition | null {
  if (current && !isPositionAfter(shown, current)) return null;
  return shown;
}

/**
 * Position à partir de laquelle les messages sont non lus. Un sujet déjà ouvert suit sa propre position ; un sujet
 * jamais ouvert est lu jusqu'à la date « tout est lu avant le… » du membre (`User.forumReadAllAt`).
 */
export function effectiveReadPosition(view: ReadPosition | null, forumReadAllAt: Date): ReadPosition {
  return view ?? { at: forumReadAllAt, postId: null };
}

/**
 * Un sujet est non lu quand son dernier message (`Topic.lastPostAt`) est plus récent que la position de lecture.
 * Même règle que la requête SQL de `app/forum/unreadState.ts` : à changer ensemble.
 */
export function isTopicUnread(lastPostAt: Date, view: ReadPosition | null, forumReadAllAt: Date): boolean {
  return lastPostAt.getTime() > effectiveReadPosition(view, forumReadAllAt).at.getTime();
}

/** Durée après laquelle un nouveau passage sur un sujet compte comme une nouvelle visite : 30 minutes. */
export const TOPIC_VISIT_GAP_MS = 30 * 60 * 1000;

/**
 * Faut-il compter une vue du sujet (carte 169) ? Une vue compte quand le membre ouvre le sujet pour la première fois,
 * puis à chaque nouvelle visite où il lit au moins un message de plus qu'avant (sa position de lecture avance) :
 * - feuilleter les pages d'un sujet pendant une même visite ne compte qu'une fois ;
 * - revenir sur un sujet sans nouveau message, ou recharger la page, ne compte pas.
 * Une « nouvelle visite » commence quand la dernière date de visite (`TopicView.lastViewedAt`) remonte à plus de
 * 30 minutes. Depuis la carte 166, le compteur augmentait à chaque page affichée.
 */
export function shouldCountTopicView(previousVisitAt: Date | null, positionAdvanced: boolean, now: Date): boolean {
  if (!previousVisitAt) return true;
  return positionAdvanced && now.getTime() - previousVisitAt.getTime() > TOPIC_VISIT_GAP_MS;
}
