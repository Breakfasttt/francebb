# Forum

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

Le forum est le cœur de la communauté : les coachs y discutent par catégories, forums et sous-forums, ouvrent des sujets et y répondent. Il gère la mise en forme BBCode, les réactions, les mentions, le suivi des sujets non lus et la modération. Les annonces de tournoi sont aussi des sujets du forum (voir `docs/features/tournois/`).

## Ce que voit le coach

- `/forum` : l'accueil, avec les catégories, leurs forums et le dernier sujet de chaque forum. Un forum qui contient du non-lu est signalé.
- `/forum/[id]` : la liste des sujets d'un forum (30 par page), avec ses sous-forums.
- `/forum/topic/[id]` : un sujet et ses messages (20 par page). À l'ouverture, le coach est envoyé au premier message non lu. On peut réagir, citer, mentionner, signaler, partager, suivre le sujet ou le marquer non lu à partir d'un message.
- `/forum/topic/[id]/reply`, `/forum/post/[id]/edit`, `/forum/new-topic?forumId=…` : répondre, modifier un message, créer un sujet. Depuis la carte 087, ce sont des « écrans de rédaction » : sur téléphone ils occupent tout l'écran (pas de barre de navigation en bas), la barre d'outils de l'éditeur reste collée en haut pendant que la zone de texte grandit avec le message, et la barre d'envoi (« Annuler », « Publier ma réponse », « Enregistrer les modifications » ou « Créer le sujet ») est collée en bas, à portée de pouce. Le rappel des 3 derniers messages suit l'éditeur.
- **L'éditeur de messages** (BBCode, carte 087) : la barre n'affiche que les outils les plus utilisés (gras, italique, lien, image, spoiler sur ordinateur, smileys), un bouton « + » (« Plus d'outils de mise en forme ») range tous les autres par rubrique (Texte, Blocs, Liens et médias, Aide) et le bouton « Aperçu » montre le rendu. Sur ordinateur, « + » ouvre un petit panneau sous le bouton et le formulaire d'un outil (adresse d'un lien, options d'une image…) s'ouvre sous la barre ; sur téléphone, les deux s'ouvrent dans un panneau qui monte du bas. Le « @ » s'écrit toujours ; tapé en début de mot (au début du texte, après une espace ou un retour à la ligne), il ouvre en plus la recherche d'un membre à mentionner, ce qui laisse écrire une adresse électronique (carte 112). Échap ferme l'outil ouvert.
- `/forum/search` : la recherche avancée (carte 088). Le champ des mots-clés et le bouton « Lancer la recherche » sont toujours visibles ; les filtres (auteur, forum avec ses sous-forums, période, tri) sont sur une ligne sur ordinateur, et dans un panneau ouvert par le bouton « Filtres » sur téléphone. Une pastille par filtre actif permet de le retirer d'un appui. Chaque résultat est une ligne : titre du sujet (trophée pour un tournoi), forum, auteur, ancienneté, extrait du message avec les mots cherchés surlignés, vues, date du dernier message et bouton « Voir », qui mène au message sur la bonne page du sujet. 20 résultats par page.
- `/forum/unread` (sujets non lus) et `/forum/new-forum` (création d'un forum par un modérateur : nom, description, catégorie, forum parent et position, carte 088).
- **Fenêtres de modération et de signalement** (carte 088) : « Déplacer le sujet », « Modifier le titre du sujet », « Modérer le message » et « Signaler un contenu » sont construites avec le composant `Sheet` de `packages/ui` : fenêtre centrée sur ordinateur, panneau qui monte du bas sur téléphone, toujours au-dessus de la barre de navigation du bas et du panneau « Plus ».
- Accès : un visiteur lit les forums publics. Un membre connecté écrit. Un modérateur épingle, verrouille, archive, déplace, renomme, masque un message, crée ou supprime un forum. Un forum réservé à un rôle est invisible pour les autres : le visiteur est envoyé vers la connexion, le membre reçoit une page « introuvable ».
- **Sur téléphone** (et tablette, jusqu'à 1024 pixels) : la colonne latérale des listes est masquée. « Nouveau sujet » (ou « Nouveau tournoi ») s'affiche en haut de la liste, et les actions secondaires (recherche avancée, membres, non-lus, administration) sont envoyées dans la rubrique « Cette page » du panneau « Plus » avec `GlobalPortal` (cible `#mobile-page-sidebar-slot`). Sur un sujet, les outils s'ouvrent dans le panneau « Outils du sujet », et une barre collée en bas de l'écran, au-dessus de la barre de navigation, porte la pagination compacte et « Répondre » (`TopicTools.tsx`). Les messages passent sur une colonne ; un appui sur l'avatar ou le nom de l'auteur ouvre sa fiche (`PostAuthorSheet`).
- **Cibles tactiles sur téléphone** (et tablette, jusqu'à 1024 pixels, cartes 053 et 055) : tout ce qui se touche au doigt mesure au moins 44 pixels de côté. Cela concerne les liens du fil d'Ariane (le chemin « Accueil Forum › catégorie › forum › sujet » en haut de page), les boutons « Profil » et « MP » sous le nom de l'auteur, les icônes en tête de message (marquer non lu, partager, signaler), les boutons sous le message (modérer, réactions, citer, modifier, supprimer) et les outils de l'éditeur de messages. Sur ordinateur, rien ne change.
- **Fenêtre de signalement sur téléphone** : panneau qui monte du bas (au plus 88 % de la hauteur de l'écran, son contenu défile à l'intérieur) ; les raisons sont des boutons de 44 pixels, les boutons « Annuler » et « Envoyer le signalement » sont empilés en pleine largeur ; la zone de texte est en 16 pixels pour que l'iPhone ne zoome pas.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/app/forum/page.tsx` | Accueil. La structure est mise en cache 60 secondes (`unstable_cache`), une version par niveau d'accès. Le non-lu est calculé à part. |
| `apps/site/app/forum/unreadState.ts` | `getUnreadState(userId)` : sujets non lus et forums concernés, en une requête, mémorisé pendant le rendu d'une page. |
| `apps/site/app/forum/[id]/page.tsx` | Liste des sujets d'un forum. |
| `apps/site/app/forum/topic/[id]/page.tsx` | Page d'un sujet (et du tournoi qui lui est attaché). |
| `apps/site/app/forum/search/page.tsx`, `apps/site/app/forum/unread/page.tsx` | Recherche et non-lus. |
| `apps/site/app/forum/component/ForumSidebar.tsx` | Colonne latérale de l'accueil et des listes, copiée dans le menu mobile. |
| `apps/site/app/forum/component/TopicTools.tsx` | Outils d'un sujet (carte 086) : colonne de droite sur ordinateur ; sur téléphone, panneau « Outils du sujet », rubrique « Cette page » du panneau « Plus » et barre collée en bas (pagination et « Répondre »). |
| `apps/site/app/forum/component/PostItem.tsx`, `PostActions.tsx`, `PostReactions.tsx`, `PostMoreMenu.tsx`, `PostAuthorSheet.tsx` | Un message : en-tête compact, pied avec les réactions et « Citer », menu « ⋯ » des actions rares (partager, signaler, non lu, modifier, supprimer, modérer) et « fiche coach » de l'auteur. |
| `apps/site/common/components/BBCodeContent/bbcode.css` | Seule feuille de style des blocs BBCode (spoiler, accordéon, galerie), chargée pour tout le site. Les pages du forum n'ont plus de `page.css` (carte 101). |
| `apps/site/common/components/BBCodeEditor/` | Éditeur de messages, partagé avec les articles, la messagerie, les ligues, le profil et l'administration : `BBCodeEditor.tsx` (barre, formulaires des outils, aperçu), `editorTools.ts` (liste des outils, de leur rubrique et des outils toujours visibles), `AIAssistantSheet.tsx` et `aiPrompt.ts` (assistant de mise en forme par IA). |
| `apps/site/app/forum/component/ComposeScreen.tsx`, `ReplyForm.tsx`, `EditPostForm.tsx` | Mise en page des écrans de rédaction (en-tête, barre d'envoi `ComposeActionBar`, rappel des derniers messages) et formulaires de réponse et de modification. |
| `apps/site/app/forum/component/SearchForm.tsx`, `apps/site/app/forum/new-forum/component/NewForumForm.tsx` | Formulaire de la recherche (filtres, panneau du téléphone, pastilles des filtres actifs) et formulaire de création d'un forum. |
| `apps/site/app/forum/component/MoveTopicModal.tsx`, `EditTopicTitleModal.tsx`, `ModerationModal.tsx`, `apps/site/common/components/ReportModal/ReportModal.tsx` | Fenêtres « Déplacer le sujet », « Modifier le titre du sujet », « Modérer le message » (aussi utilisée par les articles) et « Signaler un contenu » (aussi utilisée par les articles et les ligues). |
| `apps/site/app/forum/actions.ts` | Actions serveur du forum et des inscriptions aux tournois. |
| `apps/site/lib/forumAccess.ts` | Droits d'accès par rôle. |

Actions serveur principales (`app/forum/actions.ts`) : `createTopic`, `createPost`, `updatePost`, `deletePost`, `togglePostReaction`, `markTopicAsRead`, `markTopicAsUnreadFrom`, `markAllTopicsAsRead`, `getUnreadTopics`, `toggleFollowTopic`, `getFollowedTopics` ; modération : `moderatePost`, `unmoderatePost`, `togglePinTopic`, `toggleTopicLock`, `toggleForumLock`, `toggleArchiveTopic`, `moveTopic`, `updateTopicTitle`, `deleteTopicPermanent`, `createForum`, `deleteForum`. Ailleurs : `getUnreadState` (`unreadState.ts`), `getForumAccess`, `forumAccessWhere`, `topicAccessWhere`, `canAccessForum` (`lib/forumAccess.ts`).

## Les pièges

- Toute lecture ou écriture d'une catégorie, d'un forum, d'un sujet ou d'un message passe par `lib/forumAccess.ts`. Une restriction posée sur une catégorie ou un forum parent s'applique aux forums en dessous. Les actions serveur sont des portes publiques : il faut aussi filtrer ce qu'elles lisent.
- Aucune donnée propre à un membre dans un cache partagé : le cache de l'accueil ne contient que la structure.
- Ne charger que ce qui est affiché (`select`) ; jamais un `User` complet envoyé à un composant client.
- `markTopicAsRead` ne doit pas appeler `revalidatePath` : cela faisait recalculer toute la page à chaque ouverture (carte 016).
- Supprimer un message est réservé à son auteur, et c'est une suppression douce (`isDeleted`). Un modérateur masque le message (`moderatePost`) au lieu de le supprimer.
- L'apparition en fondu d'un message qu'on vient de publier (classe `new-post-fade-in`, ajoutée par `QuickReply`) est définie dans `app/globals.css`.
- Les règles mobiles agrandissent la zone que l'on touche (`min-height`, `min-width`), jamais le texte ni les icônes : l'apparence reste la même, seule la surface tactile grandit. Les captures des 8 thèmes (`visual-themes.spec.ts`) ne doivent pas changer.
- Les fenêtres de modération et de signalement doivent rester au-dessus de la barre de navigation du bas (5000) et du panneau « Plus » (7100) : le composant `Sheet` les affiche au niveau commun des fenêtres (8000 pour le fond assombri, 8001 pour la fenêtre). Avec l'ancienne valeur (2000), la barre de navigation cachait le titre de la fenêtre de signalement sur téléphone.
- `Sheet` lit le titre de la fenêtre une seconde fois, en texte caché, quand on ne lui donne pas de description : une fenêtre dont le titre est cherché par son texte (« Modérer le message de … ») reçoit donc une vraie description, sinon le texte est trouvé deux fois.
- L'extrait d'un résultat de recherche est affiché comme du texte, jamais comme du HTML : avant la carte 088, il était inséré tel quel dans la page, et une balise HTML écrite dans un message pouvait s'y exécuter.
- Les actions qui modifient le forum (messages, sujets, réactions, verrouillage, modération, modification d'un tournoi) renvoient `{ success, error }` (type `ActionResult` de `lib/actionResult.ts`) au lieu de lever une erreur ; le composant affiche `error` dans une notification. En cas de succès, `deleteForum`, `deleteTopicPermanent` et `updateTournament` redirigent : le composant ne reçoit donc une réponse qu'en cas de refus (carte 052).
- `updateTournament` reçoit du navigateur l'identifiant du sujet et de son premier message : elle vérifie qu'ils appartiennent bien au tournoi, sinon un organisateur pourrait réécrire un autre sujet (carte 052).
- `createForum` et `createTopic` renvoient elles aussi `{ success, error }` depuis la carte 064, et redirigent en cas de succès (vers le forum parent, ou vers le nouveau sujet). Leurs formulaires passent par `ActionForm` (`common/components/Form/ActionForm.tsx`), qui affiche le refus dans une notification sans vider les champs. `createForum` refuse aussi un nom vide ou déjà pris (avant, la base refusait le doublon et le modérateur voyait une page d'erreur).
- Les écrans de rédaction n'ont pas de barre de navigation en bas sur téléphone : leur adresse est reconnue par `isComposePath` (`common/components/AppShell/navItems.ts`). Une nouvelle adresse de rédaction doit y être ajoutée, sinon la barre de navigation recouvre la barre d'envoi.
- La zone de texte de l'éditeur garde son attribut `name` (les formulaires lisent son contenu avec `FormData`, la réponse rapide la cherche par `textarea[name="content"]`) et écoute l'événement `bbcode-insert-text` (bouton « Citer »). Les noms des outils (`editorTools.ts`) sont ceux que cherche le test d'inventaire `forum-editeur.spec.ts` : en changer un oblige à changer le test.
- Le numéro de page d'un sujet est ramené entre 1 et la dernière page **avant** la lecture des messages : sinon une adresse comme `?page=99` affichait une liste vide (carte 109).
- `getQuoteStatusMap` (messages cités supprimés ou modérés) doit reconnaître les mêmes formes de balise que `parseBBCode` (`lib/bbcode.ts`) : la forme courte `[quote=membre|message]` et la forme en trois parties `[quote=membre|message|nom]` créée par « Citer ». Avant la carte 110, la forme en trois parties était ignorée, et le texte d'un message modéré restait lisible dans ses citations.
- L'ancre `quick-reply-area` ne doit être posée que sur une vraie zone de réponse : « Citer » et « Répondre » la cherchent pour y écrire. Quand le membre ne peut pas répondre (sujet ou forum verrouillé, sauf pour un modérateur), l'encart « Sujet verrouillé » n'a pas cette ancre et « Citer » est masqué (carte 111). L'écran `/forum/topic/[id]/reply` renvoie ce membre vers le sujet dès son ouverture, au lieu de le laisser écrire puis de refuser l'envoi (carte 149).
- Un visiteur qui ouvre `/forum/new-topic` est envoyé vers `/auth/login?callbackUrl=…` : après sa connexion, il revient sur l'écran de nouveau sujet (carte 149). Avant, il était envoyé vers `/forum`. Un visiteur qui ouvre `/forum/topic/[id]/reply` est toujours renvoyé vers le sujet.
- Les boutons d'envoi du formulaire de tournoi (`TournamentForm.tsx`) doivent rester **dans** l'élément `<form>` : colonne « Publication » sur ordinateur, barre `ComposeActionBar` collée en bas sur téléphone. Avant la carte 064, la colonne était déplacée hors du formulaire sur téléphone, et le bouton n'envoyait plus rien.

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
- Carte 019 : les avatars des membres restent des balises `<img>` ordinaires, car ils viennent d'autres sites (Discord, Google, DiceBear, imgbb ou une adresse libre saisie dans le profil), que `next/image` ne peut pas optimiser sans ouvrir son optimiseur à tout Internet.
- Carte 064 : plus aucun `throw` dans `actions.ts` (7 → 0) ; tests e2e d'erreur pour la création d'un forum (nom déjà pris) et d'un sujet (message vide), et test de la redirection vers le nouveau sujet, aussi en taille téléphone. Formulaire de création de forum sans contenu coupé sur téléphone, champs en 16 pixels.
- Carte 088 : recherche avancée, création d'un forum et fenêtres de modération et de signalement refaites ; test d'inventaire `forum-recherche.spec.ts` (sections 3.7 et 3.8) en taille ordinateur et téléphone. L'extrait d'un résultat de recherche n'est plus inséré comme du HTML.
