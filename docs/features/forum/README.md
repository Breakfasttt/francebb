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
- **Cibles tactiles sur téléphone** (et tablette, jusqu'à 1024 pixels, cartes 053 et 055) : tout ce qui se touche au doigt mesure au moins 44 pixels de côté. Cela concerne les liens du fil d'Ariane (le chemin « Accueil Forum › catégorie › forum › sujet » en haut de page), les boutons « Profil » et « MP » sous le nom de l'auteur, les icônes en tête de message (marquer non lu, partager, signaler), les boutons sous le message (modérer, réactions, citer, modifier, supprimer) et la barre d'outils de l'éditeur de messages, qui passe sur plusieurs lignes. Sur ordinateur, rien ne change.
- **Fenêtre de signalement sur téléphone** : elle ne dépasse jamais la hauteur de l'écran et son contenu défile à l'intérieur ; les boutons « Annuler » et « Envoyer » sont empilés en pleine largeur ; la zone de texte est en 16 pixels pour que l'iPhone ne zoome pas.

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
| `apps/site/app/forum/page.css`, `page-mobile.css` | Style commun à toutes les pages du forum, et ses règles pour tablette et téléphone. Chaque page du forum importe les deux, `page-mobile.css` juste après `page.css`. |
| `apps/site/common/components/BBCodeEditor/BBCodeEditor-mobile.css`, `common/components/ReportModal/ReportModal-mobile.css` | Règles pour téléphone de l'éditeur de messages et de la fenêtre de signalement (composants partagés, aussi utilisés hors du forum). |
| `apps/site/app/forum/actions.ts` | Actions serveur du forum et des inscriptions aux tournois. |
| `apps/site/lib/forumAccess.ts` | Droits d'accès par rôle. |

Actions serveur principales (`app/forum/actions.ts`) : `createTopic`, `createPost`, `updatePost`, `deletePost`, `togglePostReaction`, `markTopicAsRead`, `markTopicAsUnreadFrom`, `markAllTopicsAsRead`, `getUnreadTopics`, `toggleFollowTopic`, `getFollowedTopics` ; modération : `moderatePost`, `unmoderatePost`, `togglePinTopic`, `toggleTopicLock`, `toggleForumLock`, `toggleArchiveTopic`, `moveTopic`, `updateTopicTitle`, `deleteTopicPermanent`, `createForum`, `deleteForum`. Ailleurs : `getUnreadState` (`unreadState.ts`), `getForumAccess`, `forumAccessWhere`, `topicAccessWhere`, `canAccessForum` (`lib/forumAccess.ts`).

## Les pièges

- Toute lecture ou écriture d'une catégorie, d'un forum, d'un sujet ou d'un message passe par `lib/forumAccess.ts`. Une restriction posée sur une catégorie ou un forum parent s'applique aux forums en dessous. Les actions serveur sont des portes publiques : il faut aussi filtrer ce qu'elles lisent.
- Aucune donnée propre à un membre dans un cache partagé : le cache de l'accueil ne contient que la structure.
- Ne charger que ce qui est affiché (`select`) ; jamais un `User` complet envoyé à un composant client.
- `markTopicAsRead` ne doit pas appeler `revalidatePath` : cela faisait recalculer toute la page à chaque ouverture (carte 016).
- Supprimer un message est réservé à son auteur, et c'est une suppression douce (`isDeleted`). Un modérateur masque le message (`moderatePost`) au lieu de le supprimer.
- Une nouvelle page du forum doit importer `page-mobile.css` juste après `page.css`, sinon elle perd toutes ses règles pour téléphone.
- Les règles mobiles agrandissent la zone que l'on touche (`min-height`, `min-width`), jamais le texte ni les icônes : l'apparence reste la même, seule la surface tactile grandit. Les captures des 7 thèmes sur ordinateur (`visual-themes.spec.ts`) ne doivent pas changer.
- La fenêtre de signalement doit rester au-dessus de la barre de navigation : elle utilise la valeur commune des fenêtres, `var(--z-index-modal-bottom)` (8000). Avec l'ancienne valeur (2000), la barre de navigation cachait le titre de la fenêtre sur téléphone.
- Les actions qui modifient le forum (messages, sujets, réactions, verrouillage, modération, modification d'un tournoi) renvoient `{ success, error }` (type `ActionResult` de `lib/actionResult.ts`) au lieu de lever une erreur ; le composant affiche `error` dans une notification. En cas de succès, `deleteForum`, `deleteTopicPermanent` et `updateTournament` redirigent : le composant ne reçoit donc une réponse qu'en cas de refus (carte 052).
- `updateTournament` reçoit du navigateur l'identifiant du sujet et de son premier message : elle vérifie qu'ils appartiennent bien au tournoi, sinon un organisateur pourrait réécrire un autre sujet (carte 052).
- Dette : `createForum` et `createTopic` lèvent encore une erreur (7 `throw`) ; elles servent directement d'action de formulaire (`<form action={...}>`) et il faudrait un petit composant navigateur pour afficher l'erreur.

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
- Téléphone (carte 053) : l'audit mobile ne relève plus aucune cible trop petite ni aucun contenu coupé sur `/forum`, `/forum/topic/[id]` et `/forum/topic/[id]/reply`, de 360 à 430 pixels de large (avant : 35 cibles trop petites sur un sujet, 27 sur la page de réponse).
- Carte 052 : `throw` dans `actions.ts` 44 → 7, erreurs affichées en notification au lieu de fenêtres `alert()` du navigateur.
- À faire : images en `next/image` (carte 019), retrait des derniers `throw` (`createForum`, `createTopic`).
