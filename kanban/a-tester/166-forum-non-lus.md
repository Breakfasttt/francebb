---
id: 166
title: "Forum : non-lus fiables et index de la base"
epic: E10
app: site
depends_on: []
verify: "épingler, verrouiller, déplacer ou renommer un sujet ne le rend plus non lu ; lire la page 1 d'un sujet de plusieurs pages ne marque pas la suite comme lue ; sa propre réponse ne rend pas le sujet non lu ; un nouveau membre ne voit pas tout le forum en non lu ; « dernier message par » affiche le bon auteur ; les index sont créés"
---

# 166 — Forum : non-lus fiables et index de la base

## Pourquoi

Les non-lus du forum sont faux de quatre façons, et leur calcul relit tous les sujets à chaque page (audit, sections 3.1 et 3.5).

## Action

1. Nouvelles colonnes sur `Topic` : `lastPostAt`, `lastPostId`, `lastPostAuthorId`. La migration les remplit à partir des messages existants ; ensuite, seules la création et la suppression d'un message les changent. Le tri, le non-lu et « dernier message par » s'en servent à la place de `updatedAt`.
2. `markTopicAsRead` reçoit le dernier message affiché sur la page et ne fait jamais reculer la position. `MarkAsRead` ne garde plus de mémoire par onglet. `createPost` met à jour la lecture de son auteur.
3. Nouvelle colonne `User.forumReadAllAt`, la date avant laquelle tout est lu. Elle est remplie à l'inscription, par « Tout marquer lu » (qui ne crée plus une ligne par sujet) et, pour les membres existants, à la date de la migration. Décision : c'est le choix le plus logique, car il fait disparaître la vague de sujets importés jamais ouverts sans toucher à ce qui a déjà été lu.
4. Le calcul des non-lus se fait dans la base, en une requête.
5. Index : `Topic(forumId, isArchived, isSticky, lastPostAt)`, `Post(topicId, createdAt, id)`, `TopicFollow(topicId)`, `TopicView(topicId)`, `ModerationLog(targetId)` et `ModerationLog(createdAt)`.

## Résultat

Chaque sujet connaît maintenant son dernier message : trois nouvelles colonnes de la table `Topic` (`lastPostAt`, `lastPostId`, `lastPostAuthorId`) donnent sa date, son identifiant et son auteur. La migration `20261104190000_forum_non_lus` les a remplies à partir du plus récent message non supprimé de chaque sujet. Ensuite, seules la création d'un sujet ou d'une réponse et la suppression ou la restauration d'un message les changent. Le tri des listes, le non-lu, les sujets suivis du profil, la recherche et l'affichage « Dernier : » s'en servent ; `updatedAt` ne sert plus au forum, donc épingler, verrouiller, archiver, déplacer ou renommer un sujet ne le rend plus non lu et ne le fait plus remonter.

Chaque membre a une position de lecture par sujet (nouvelle colonne `TopicView.lastReadPostAt`, avec `lastPostId`) : le dernier message affiché sur la page qu'il a ouverte. Elle avance de page en page et ne recule jamais, sauf par « Marquer comme non lu à partir d'ici ». Lire la page 1 d'un long sujet ne marque donc plus la suite comme lue, et l'ouverture d'un sujet envoie toujours au premier message non lu. La mémoire gardée dans l'onglet par `MarkAsRead` a disparu : revenir sur un sujet le marque lu. Sa propre réponse, ou son propre nouveau sujet, ne rend plus le sujet non lu pour son auteur.

La nouvelle colonne `User.forumReadAllAt` est la date « tout est lu avant le… ». Elle vaut la date d'inscription pour un nouveau membre, qui ne voit donc plus tout le forum en non lu. « Tout marquer comme lu » la met à jour et avance la position des sujets déjà ouverts, en deux requêtes au lieu d'une ligne par sujet. Pour les membres existants, la migration l'a mise à sa propre date, comme décidé : les sujets jamais ouverts sont devenus lus, et les sujets déjà ouverts ont gardé leur état, car un sujet ouvert suit sa propre position.

Le calcul des non-lus se fait dans la base en une seule requête SQL (`app/forum/unreadState.ts`), au lieu de relire tous les sujets du forum à chaque page. Les six index demandés ont été créés. Les listes affichent « Dernier : » suivi de l'auteur du dernier message, avec la date et l'heure de Paris ; avant, c'était l'auteur du sujet, sans heure.

Vérifications faites : `pnpm check` passe (types, tests unitaires, ESLint) ; le nouveau test unitaire `tests/unit/forumReadPosition.test.mjs` vérifie que la position ne recule pas et la règle du non-lu ; un script temporaire, supprimé ensuite, a vérifié sur la base locale le remplissage de la migration, la requête des non-lus (sujet jamais ouvert, sujet ouvert, sujet supprimé), « Tout marquer comme lu » sans création de ligne, et le recalcul du dernier message après suppression et restauration sans changer `updatedAt` ; le parcours de fin de carte (`test:parcours`) passe, sans erreur serveur. Les tests e2e touchés (`forum-listes`, `forum-sujet`, `forum-recherche`, `profil`, sujets de `globalSetup.ts`) ont été adaptés sans être lancés. Les captures de référence de `/forum` de `visual-themes.spec.ts` changeront sans doute (texte « Dernier : … » avec l'heure) et seront à régénérer.
