---
id: 225
title: Modérateurs propres à un forum
---

# 225 — Modérateurs propres à un forum

## Pourquoi
Relevé pendant la carte 221 : un modérateur modère tout le site ou rien. Un chef de ligue ou un organisateur ne peut pas recevoir le droit de modérer seulement le forum de sa ligue ou de son tournoi.

## À faire
- Table de liaison forum ↔ membre (migration), gérée dans l'administration (onglet Forums).
- `lib/forumRights.ts` : les droits de modération d'un sujet ou d'un message tiennent compte de cette liste ; les actions serveur du forum (`app/forum/actions.ts`) l'appliquent.
- Journal de modération inchangé ; fiche `permissions` et `INTERACTIONS.md` à jour.
- Tests unitaires de la règle, e2e sur un forum avec et sans droit.

## Plan détaillé (22/11/2026)
Relevé à la fin de la série 116-224 : 45 contrôles `isModerator(role)` dans 17 fichiers du forum. Chantier à mener dans une séance neuve.

1. **Base** : table `ForumModerator` (`forumId`, `userId`, `createdAt`, clé `[forumId, userId]`, suppression en cascade des deux côtés). Migration par ajout seulement.
2. **Règle unique** : `lib/forumModerators.ts`, `canModerateForum(userId, role, forumId)`. Vrai pour la modération globale (`isModerator`), ou si le membre est inscrit sur ce forum **ou sur un forum parent** (remontée de `parentForumId` ; un modérateur de forum modère ses sous-forums). Partie pure testable : `lib/forumModeratorRules.ts` (remontée sur une liste de forums en mémoire).
3. **Actions à basculer sur `canModerateForum`** (forum du sujet ou du message), dans `app/forum/actions.ts` : `moderatePost`, `unmoderatePost`, `deletePost`, `restorePost`, `updatePost` (message d'un autre), `togglePinTopic`, `deleteTopic`, `restoreTopic`, `moveTopic` (forum de départ **et** d'arrivée), `updateTopicTitle`, `toggleArchiveTopic`, `toggleTopicLock`, `createPost` et `createTopic` (écrire dans un sujet ou un forum verrouillé, épingler à la création). Dans `app/forum/topicSplitMergeActions.ts` : scinder et fusionner (les deux sujets). **Restent globaux** : `createForum`, `deleteForum`, `toggleForumLock`, la CDF (`wantsCdf`), l'onglet `/moderation`, les tournois (`updateTournament`, inscriptions), le bannissement et les avertissements.
4. **Écrans** : `ForumViewer.isModerator` (`lib/forumRights.ts`) est aujourd'hui calculé par le rôle dans les pages `app/forum/topic/[id]`, `[id]`, `post/[id]`, `post/[id]/edit`, `topic/[id]/reply`, `new-topic`, `search`, `PostItem.tsx`, `ForumSidebar.tsx` et `lib/forumPostPrivacy.ts`. Le calculer avec `canModerateForum` pour le forum affiché, sinon les boutons n'apparaissent pas (ou apparaissent à tort).
5. **Administration, onglet Forums** : dans la fiche d'un forum, liste « Modérateurs de ce forum » (ajout par la recherche de membre existante, retrait), actions admin seulement, journal `FORUM_MODERATOR_ADDED` / `FORUM_MODERATOR_REMOVED`.
6. **Journal** : inchangé pour les actions de modération (elles sont déjà tracées avec leur auteur).
7. **Tests** : unitaires de la remontée parent ; e2e d'un coach modérateur d'un forum (masque un message de ce forum, n'a pas le bouton ni le droit serveur dans un autre forum) ; fiches `permissions`, `forum`, `INTERACTIONS.md`.

## Résultat
