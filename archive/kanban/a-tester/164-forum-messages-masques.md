---
id: 164
title: "Forum : texte des messages masqués et fiches d'auteur protégés"
epic: E10
app: site
depends_on: []
verify: "le texte d'un message masqué ou supprimé n'apparaît plus dans le code de la page, ni via Citer, ni via la page Répondre, ni dans le rappel des derniers messages (sauf pour un modérateur) ; la page d'un sujet n'envoie plus que le nom, l'avatar, le rôle et la signature des auteurs"
---

# 164 — Forum : texte des messages masqués et fiches d'auteur protégés

## Pourquoi

Le texte des messages masqués par la modération ou supprimés par leur auteur reste lisible (bouton « Citer », adresse `?quotePostId=`, rappel des derniers messages), et toute la fiche des auteurs et des inscrits (motif de bannissement, préférences) part dans la page (audit, sections 2.4 et 3.1).

## Action

1. Une fonction commune qui vide le texte d'un message supprimé, ou masqué quand le lecteur n'est ni modérateur ni auteur. Elle est appliquée à la page du sujet, à `getPostById`, à `getTopicLatestPosts` et à la page Répondre. Citer un tel message est refusé.
2. Un `select` partagé pour l'auteur d'un message et pour les membres d'un tournoi : identifiant, nom, avatar et cadre, rôle, signature, équipe, ligues, nombre de messages.

## Résultat

Les règles sont rassemblées dans un nouveau fichier, `apps/site/lib/forumPostPrivacy.ts`, qui décrit ce que la page d'un sujet a le droit d'envoyer au navigateur.

**Texte des messages masqués ou supprimés.** La fonction `hidePostContent` vide le texte d'un message supprimé par son auteur (pour tout le monde) et celui d'un message masqué par la modération (sauf pour son auteur et pour les modérateurs, qui en ont besoin pour décider de le rétablir). Elle est appliquée à la page du sujet (messages de la page et premier message d'un tournoi), et aux actions serveur `getPostById` et `getTopicLatestPosts`, qui lisent elles-mêmes la session du lecteur puisqu'elles peuvent être appelées directement depuis le navigateur. Le rappel des derniers messages, sous l'éditeur, affiche alors « Ce message a été supprimé par son auteur. » ou « Le contenu de ce message a été masqué par la modération. ». La fonction `canQuotePost` refuse de citer un tel message, même à un modérateur, car la citation recopierait le texte caché dans un message visible de tous : le bouton « Citer » n'apparaît plus sur un message masqué (il n'apparaissait déjà pas sur un message supprimé), et la page Répondre ignore `?quotePostId=` quand il désigne un tel message.

**Fiches des membres.** Trois listes de champs (`select` de Prisma) remplacent les fiches complètes : `POST_AUTHOR_SELECT` pour l'auteur d'un message (identifiant, pseudo, avatar et cadre, rôle, état « banni » sans son motif, signature, numéro NAF, équipe, région, ligues et ligue saisie à la main, nombre de messages, tous affichés par le message ou par la fiche de l'auteur), `PUBLIC_MEMBER_SELECT` (identifiant, pseudo, avatar) pour les inscrits, équipes, capitaines, mercenaires et le classement d'un tournoi, ainsi que pour les auteurs de `getPostById` et `getTopicLatestPosts`, et `POST_MODERATOR_SELECT` (identifiant et pseudo) pour le modérateur d'un message. Des commissaires du tournoi, la page ne lit plus que l'identifiant. Le chargement inutile de l'auteur du sujet (jamais affiché) a été retiré. Les composants `PostAuthorSheet`, `RegistrationModule` et `TournamentResultWidget` ont été relus : ils ne lisent aucun champ retiré. Le message reçu par `PostItem` a maintenant un type précis (`TopicPost`) au lieu de `any`.

**Vérifications.** `corepack pnpm check` passe (types, tests unitaires, ESLint). Un nouveau test unitaire, `apps/site/tests/unit/forumPostPrivacy.test.mjs`, vérifie qui reçoit le texte d'un message ordinaire, masqué ou supprimé, et qu'aucun des deux derniers ne peut être cité. La demande à la base de la page du sujet a été lancée directement sur la base locale : l'auteur d'un message ne contient plus que les champs ci-dessus (plus de `banReason`, `emailVerified`, `theme`, `previousTheme`…). La page elle-même n'a pas pu être ouverte sur le serveur de développement : la base locale (`prisma dev`) ne sert qu'une connexion à la fois et refuse les demandes lancées en parallèle par la page, avec ou sans cette carte (même erreur « Server has closed the connection » avec l'ancienne demande). La base locale ne contient par ailleurs aucun message masqué ni supprimé.

**Reste à faire.** Le test de fin de carte (`pnpm --filter @bbfrance/site test:parcours`) et une vérification à l'écran d'un message masqué, vu par un visiteur, par son auteur et par un modérateur, sur téléphone et sur ordinateur. Hors du périmètre de cette carte : le tournoi entier est toujours confié à `RegistrationModule`, ce qui envoie au navigateur l'état de paiement des inscriptions même à un visiteur ; la page de modification d'un message charge encore l'auteur complet, mais ne l'envoie pas au navigateur.
