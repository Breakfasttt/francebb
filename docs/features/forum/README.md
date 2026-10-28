# Forum

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

Le forum est le cœur de la communauté : les coachs y discutent par catégories, forums et sous-forums, ouvrent des sujets et y répondent. Il gère la mise en forme BBCode, les réactions, les mentions, le suivi des sujets non lus et la modération. Les annonces de tournoi sont aussi des sujets du forum (voir `docs/features/tournois/`).

## Ce que voit le coach

- `/forum` : l'accueil, avec les catégories, leurs forums et le dernier sujet de chaque forum. Un forum qui contient du non-lu est signalé.
- `/forum/[id]` : la liste des sujets d'un forum (30 par page), avec ses sous-forums.
- `/forum/topic/[id]` : un sujet et ses messages (20 par page). À l'ouverture, le coach est envoyé au premier message non lu. On peut réagir, citer, mentionner, signaler, partager, suivre le sujet ou le marquer non lu à partir d'un message.
- `/forum/topic/[id]/reply`, `/forum/post/[id]/edit`, `/forum/new-topic?forumId=…` : répondre, modifier un message, créer un sujet.
- `/forum/search` (recherche), `/forum/unread` (sujets non lus), `/forum/new-forum` (création de forum).
- Accès : un visiteur lit les forums publics. Un membre connecté écrit. Un modérateur épingle, verrouille, archive, déplace, renomme, masque un message, crée ou supprime un forum. Un forum réservé à un rôle est invisible pour les autres : le visiteur est envoyé vers la connexion, le membre reçoit une page « introuvable ».
- **Sur téléphone** (et tablette, jusqu'à 1024 pixels) : la colonne latérale du forum (boutons « nouveau sujet », non-lus, recherche, actions de modération) est masquée et son contenu est déplacé dans le menu latéral global avec `GlobalPortal` (cible `#mobile-page-sidebar-slot`). La pagination est répétée en bas de page. Les messages passent sur une colonne : l'auteur au-dessus du texte, ses statistiques masquées. Les colonnes « statistiques » et « dernier message » de l'accueil disparaissent.
- **Problèmes possibles sur téléphone** : il n'y a pas de fichier `page-mobile.css` pour le forum, alors que `page.css` y renvoie (« Déplacé dans page-mobile.css ») ; les règles mobiles sont en fait à la fin de `page.css`. Le confort de l'éditeur BBCode et des fenêtres de modération sur petit écran est à vérifier (carte 049).

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/app/forum/page.tsx` | Accueil. La structure est mise en cache 60 secondes (`unstable_cache`), une version par niveau d'accès. Le non-lu est calculé à part. |
| `apps/site/app/forum/unreadState.ts` | `getUnreadState(userId)` : sujets non lus et forums concernés, en une requête, mémorisé pendant le rendu d'une page. |
| `apps/site/app/forum/[id]/page.tsx` | Liste des sujets d'un forum. |
| `apps/site/app/forum/topic/[id]/page.tsx` | Page d'un sujet (et du tournoi qui lui est attaché). |
| `apps/site/app/forum/search/page.tsx`, `apps/site/app/forum/unread/page.tsx` | Recherche et non-lus. |
| `apps/site/app/forum/component/ForumSidebar.tsx`, `TopicSidebar.tsx` | Colonnes latérales (accueil/liste, sujet), copiées dans le menu mobile. |
| `apps/site/app/forum/component/PostItem.tsx`, `PostActions.tsx`, `PostReactions.tsx` | Affichage d'un message et de ses actions. |
| `apps/site/app/forum/actions.ts` | Actions serveur du forum et des inscriptions aux tournois. |
| `apps/site/lib/forumAccess.ts` | Droits d'accès par rôle. |

Actions serveur principales (`app/forum/actions.ts`) : `createTopic`, `createPost`, `updatePost`, `deletePost`, `togglePostReaction`, `markTopicAsRead`, `markTopicAsUnreadFrom`, `markAllTopicsAsRead`, `getUnreadTopics`, `toggleFollowTopic`, `getFollowedTopics` ; modération : `moderatePost`, `unmoderatePost`, `togglePinTopic`, `toggleTopicLock`, `toggleForumLock`, `toggleArchiveTopic`, `moveTopic`, `updateTopicTitle`, `deleteTopicPermanent`, `createForum`, `deleteForum`. Ailleurs : `getUnreadState` (`unreadState.ts`), `getForumAccess`, `forumAccessWhere`, `topicAccessWhere`, `canAccessForum` (`lib/forumAccess.ts`).

## Les pièges

- Toute lecture ou écriture d'une catégorie, d'un forum, d'un sujet ou d'un message passe par `lib/forumAccess.ts`. Une restriction posée sur une catégorie ou un forum parent s'applique aux forums en dessous. Les actions serveur sont des portes publiques : il faut aussi filtrer ce qu'elles lisent.
- Aucune donnée propre à un membre dans un cache partagé : le cache de l'accueil ne contient que la structure.
- Ne charger que ce qui est affiché (`select`) ; jamais un `User` complet envoyé à un composant client.
- `markTopicAsRead` ne doit pas appeler `revalidatePath` : cela faisait recalculer toute la page à chaque ouverture (carte 016).
- Supprimer un message est réservé à son auteur, et c'est une suppression douce (`isDeleted`). Un modérateur masque le message (`moderatePost`) au lieu de le supprimer.
- Dette : `actions.ts` utilise encore `throw` (44 occurrences) au lieu de retourner `null`, contrairement à la règle du projet.

## Les mots expliqués

| Mot | Sens |
|---|---|
| Catégorie / forum / sous-forum | Les trois niveaux de rangement : une catégorie regroupe des forums, un forum peut contenir des sous-forums. |
| Sujet (*topic*) / message (*post*) | Un sujet est une discussion ; il contient des messages. |
| Non-lu | Sujet jamais ouvert, ou modifié depuis la dernière visite du coach (table `TopicView`). |
| Épinglé (*sticky*) | Sujet toujours affiché en haut de la liste. |
| Verrouillé | Sujet ou forum où seuls les modérateurs peuvent encore écrire. |
| Archivé | Sujet retiré des listes et du calcul des non-lus. |
| Message modéré | Message masqué par un modérateur, avec une raison affichée. |
| Mention | Balise `[mention=id]` qui prévient un coach qu'on parle de lui. |
| Forum de tournoi | Forum (`isTournamentForum`) où l'on crée des annonces de tournoi au lieu de sujets simples. |
| `allowedRoles` | Rôles autorisés à voir un forum : « ce rôle et les rôles supérieurs ». |

## État

- Fait : accueil connecté 16 → 6 requêtes, anonyme 5 → 0 avec cache chaud (carte 014) ; liste d'un forum 31 → 21 (015) ; page sujet 85 → 46 (016) ; N+1 retirés de `createPost` (020) ; accès par rôle partout (028, +1 requête connecté pour lire `RoleConfig`).
- `getRecentPosts`, `getForums`, `getSiblings` ont été supprimées (aucun appelant).
- À faire : audit mobile complet (carte 049), images en `next/image` (carte 019), retrait des `throw`.
