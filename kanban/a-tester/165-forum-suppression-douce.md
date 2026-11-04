---
id: 165
title: "Forum : suppression réservée aux modérateurs et restaurable"
epic: E10
app: site
depends_on: []
verify: "l'auteur d'un sujet ne peut plus supprimer les réponses des autres ; un modérateur peut supprimer un sujet ou un message (spam), puis le restaurer ; un sujet portant un tournoi avec des résultats ne peut plus être supprimé"
---

# 165 — Forum : suppression réservée aux modérateurs et restaurable

## Pourquoi

L'auteur d'un sujet peut l'effacer définitivement avec toutes les réponses des autres, et le tournoi avec ses résultats du classement (audit, section 3.1). À l'inverse, un modérateur ne peut pas supprimer un spam, seulement le masquer (section 3.2).

## Action

1. `deleteTopicPermanent` devient une suppression douce (le sujet est marqué supprimé, avec la date et l'auteur de la suppression), réservée aux modérateurs, inscrite au journal, avec « Restaurer ». Un sujet supprimé disparaît des listes, des non-lus et de la recherche.
2. Un sujet qui porte un tournoi avec des résultats ne peut pas être supprimé : il faut d'abord annuler le tournoi.
3. Un modérateur peut supprimer un message (spam), en suppression douce restaurable, avec une raison.
4. L'auteur qui supprime le premier message d'un sujet sans réponse supprime le sujet ; s'il y a des réponses, c'est refusé avec une explication.
5. Le texte de confirmation de suppression dit la vérité (message remplacé, pas effacé).

## Résultat

Toutes les suppressions du forum sont désormais « douces » : rien n'est effacé de la base, le sujet ou le message est seulement marqué supprimé, avec la date, le membre qui l'a supprimé et, pour la modération, la raison.

**Base de données.** La migration `20261104170000_forum_suppression_douce` ajoute au sujet (`Topic`) les colonnes `isDeleted`, `deletedAt`, `deletedById` et `deletionReason`, et au message (`Post`) les colonnes `deletedAt`, `deletedById` et `deletionReason`. Elle ne contient aucune suppression de table ni de colonne. Elle a été écrite avec `prisma migrate diff` (la commande `pnpm db:migrate` échoue sur ce poste, erreur P3006), puis appliquée à la base locale avec `prisma migrate deploy`. La version du client de base de données passe à v22 dans `lib/prisma.ts`.

**Règles.** Elles sont rassemblées dans `apps/site/lib/forumDeletion.ts`, sans dépendance, et vérifiées par `apps/site/tests/unit/forumDeletion.test.mjs` (8 tests).
- `deleteTopicPermanent` est remplacée par `deleteTopic` (modérateur seulement, raison obligatoire, inscrite au journal) et `restoreTopic`. L'auteur d'un sujet ne peut plus effacer les réponses des autres.
- Un sujet dont le tournoi a des résultats publiés et n'est pas annulé ne peut pas être supprimé : le message demande d'annuler d'abord le tournoi.
- Un modérateur peut supprimer le message d'un autre membre (« Supprimer (modération) », raison obligatoire) et le restaurer (« Restaurer le message supprimé »). L'affichage distingue « Ce message a été supprimé par son auteur » et « Ce message a été supprimé par la modération, raison : … ». Un message que son auteur a lui-même supprimé ne se restaure pas.
- L'auteur qui supprime le premier message d'un sujet sans réponse supprime le sujet ; s'il y a des réponses, ou si le sujet est un tournoi, c'est refusé avec une explication.
- Le texte de confirmation dit la vérité (message remplacé par une mention, pas effacé). Les confirmations passent par `ConfirmDialog`, avec un champ de raison pour la modération.
- Le journal utilise les bons types : `POST_DELETED` (au lieu de `POST_MODERATED` pour une suppression par l'auteur), `POST_RESTORED` et `TOPIC_RESTORED`.

**Où un sujet supprimé disparaît.** Le filtre commun `topicAccessWhere` (`lib/forumAccess.ts`) écarte désormais les sujets supprimés pour tout le monde : sujet au hasard, non-lus (`unreadState.ts`, `getUnreadTopics`, « Tout marquer lu »), recherche (`/forum/search` et `/api/forum/topics/search`), activité du profil, gazette, sujets suivis et toutes les actions sur un message. Le filtre a été ajouté à la main là où les requêtes ne passent pas par lui : accueil du forum (cache renommé `forum-categories-list-v4`, compteurs et dernier sujet), liste d'un forum (sujets, compteurs et dernier sujet des sous-forums), page du sujet (introuvable sauf pour un modérateur, qui voit le bandeau « Sujet supprimé » et « Restaurer le sujet »), écrans Répondre et Modifier un message. Le tournoi d'un sujet supprimé disparaît de `/tournois`, de `/carte`, de l'accueil du site et de la gazette (filtre `TOURNAMENT_TOPIC_NOT_DELETED`). La suppression et la restauration ne changent pas la date de dernière modification du sujet, pour ne pas le rendre « non lu » à tous, et renouvellent les caches `forum-categories` et `home-tournaments`.

**Vérifications.** `corepack pnpm check` passe (types, tests unitaires, ESLint). Un script ponctuel sur la base locale a vérifié que la suppression ne change pas `updatedAt`, que le tournoi d'un sujet supprimé sort des listes et que les tournois sans sujet y restent ; ses données ont été supprimées. Le test d'inventaire `forum-sujet.spec.ts` a été adapté (suppression avec raison puis restauration d'un sujet, le tournoi reste en base), mais il n'a pas été lancé. La vérification visuelle en taille téléphone n'a pas pu être faite : la base locale de développement (`prisma dev`, port 51214) a cessé de répondre pendant l'essai, et la page d'un sujet renvoyait l'erreur « Server has closed the connection » pour tous les sujets.

**Reste à faire.** Vérifier en taille téléphone le bandeau « Sujet supprimé », la fenêtre de suppression avec sa raison et le menu « ⋯ » d'un message, puis lancer le test de parcours en fin de carte, après avoir relancé la base locale (`pnpm db:start` dans `apps/site`). Les statistiques générales (`app/statistiques/actions.ts`) comptent encore les sujets supprimés. `deleteForum` efface toujours réellement les sujets d'un forum supprimé (hors de cette carte).
