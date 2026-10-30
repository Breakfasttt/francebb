# Forum

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

Le forum est le cœur de la communauté : les coachs y discutent par catégories, forums et sous-forums, ouvrent des sujets et y répondent. Il gère la mise en forme BBCode, les réactions, les mentions, le suivi des sujets non lus et la modération. Les annonces de tournoi sont aussi des sujets du forum (voir `docs/features/tournois/`).

## Ce que voit le coach

- `/forum` : l'accueil, avec les catégories, leurs forums et le dernier sujet de chaque forum. Un forum qui contient du non-lu est signalé.
- `/forum/[id]` : la liste des sujets d'un forum (30 par page), avec ses sous-forums.
- `/forum/topic/[id]` : un sujet et ses messages (20 par page). À l'ouverture, le coach est envoyé au premier message non lu. On peut réagir, citer, mentionner, signaler, partager, suivre le sujet ou le marquer non lu à partir d'un message.
- `/forum/topic/[id]/reply`, `/forum/post/[id]/edit`, `/forum/new-topic?forumId=…` : répondre, modifier un message, créer un sujet. Depuis la carte 087, ce sont des « écrans de rédaction » : sur téléphone ils occupent tout l'écran (pas de barre de navigation en bas), la barre d'outils de l'éditeur reste collée en haut pendant que la zone de texte grandit avec le message, et la barre d'envoi (« Annuler », « Publier ma réponse », « Enregistrer les modifications » ou « Créer le sujet ») est collée en bas, à portée de pouce. Le rappel des 3 derniers messages suit l'éditeur.
- **L'éditeur de messages** (BBCode, carte 087) : la barre n'affiche que les outils les plus utilisés (gras, italique, lien, image, spoiler sur ordinateur, smileys), un bouton « + » (« Plus d'outils de mise en forme ») range tous les autres par rubrique (Texte, Blocs, Liens et médias, Aide) et le bouton « Aperçu » montre le rendu. Sur ordinateur, « + » ouvre un petit panneau sous le bouton et le formulaire d'un outil (adresse d'un lien, options d'une image…) s'ouvre sous la barre ; sur téléphone, les deux s'ouvrent dans un panneau qui monte du bas. Taper « @ » ouvre la recherche d'un membre, Échap ferme l'outil ouvert.
- `/forum/search` (recherche), `/forum/unread` (sujets non lus), `/forum/new-forum` (création de forum).
- Accès : un visiteur lit les forums publics. Un membre connecté écrit. Un modérateur épingle, verrouille, archive, déplace, renomme, masque un message, crée ou supprime un forum. Un forum réservé à un rôle est invisible pour les autres : le visiteur est envoyé vers la connexion, le membre reçoit une page « introuvable ».
- **Sur téléphone** (et tablette, jusqu'à 1024 pixels) : la colonne latérale du forum (boutons « nouveau sujet », non-lus, recherche, actions de modération) est masquée et son contenu est déplacé dans le menu latéral global avec `GlobalPortal` (cible `#mobile-page-sidebar-slot`). La pagination est répétée en bas de page. Les messages passent sur une colonne : l'auteur au-dessus du texte, ses statistiques masquées. Les colonnes « statistiques » et « dernier message » de l'accueil disparaissent.
- **Cibles tactiles sur téléphone** (et tablette, jusqu'à 1024 pixels, cartes 053 et 055) : tout ce qui se touche au doigt mesure au moins 44 pixels de côté. Cela concerne les liens du fil d'Ariane (le chemin « Accueil Forum › catégorie › forum › sujet » en haut de page), les boutons « Profil » et « MP » sous le nom de l'auteur, les icônes en tête de message (marquer non lu, partager, signaler), les boutons sous le message (modérer, réactions, citer, modifier, supprimer) et les outils de l'éditeur de messages. Sur ordinateur, rien ne change.
- **Fenêtre de signalement sur téléphone** : elle ne dépasse jamais la hauteur de l'écran et son contenu défile à l'intérieur ; les boutons « Annuler » et « Envoyer » sont empilés en pleine largeur ; la zone de texte est en 16 pixels pour que l'iPhone ne zoome pas.

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
| `apps/site/app/forum/page.css`, `page-mobile.css` | Style commun à toutes les pages du forum, et ses règles pour tablette et téléphone. Chaque page du forum importe les deux, `page-mobile.css` juste après `page.css`. |
| `apps/site/common/components/BBCodeEditor/` | Éditeur de messages, partagé avec les articles, la messagerie, les ligues, le profil et l'administration : `BBCodeEditor.tsx` (barre, formulaires des outils, aperçu), `editorTools.ts` (liste des outils, de leur rubrique et des outils toujours visibles), `AIAssistantSheet.tsx` et `aiPrompt.ts` (assistant de mise en forme par IA). |
| `apps/site/app/forum/component/ComposeScreen.tsx`, `ReplyForm.tsx`, `EditPostForm.tsx` | Mise en page des écrans de rédaction (en-tête, barre d'envoi `ComposeActionBar`, rappel des derniers messages) et formulaires de réponse et de modification. |
| `common/components/ReportModal/ReportModal-mobile.css` | Règles pour téléphone de la fenêtre de signalement (composant partagé, aussi utilisé hors du forum). |
| `apps/site/app/forum/actions.ts` | Actions serveur du forum et des inscriptions aux tournois. |
| `apps/site/lib/forumAccess.ts` | Droits d'accès par rôle. |

Actions serveur principales (`app/forum/actions.ts`) : `createTopic`, `createPost`, `updatePost`, `deletePost`, `togglePostReaction`, `markTopicAsRead`, `markTopicAsUnreadFrom`, `markAllTopicsAsRead`, `getUnreadTopics`, `toggleFollowTopic`, `getFollowedTopics` ; modération : `moderatePost`, `unmoderatePost`, `togglePinTopic`, `toggleTopicLock`, `toggleForumLock`, `toggleArchiveTopic`, `moveTopic`, `updateTopicTitle`, `deleteTopicPermanent`, `createForum`, `deleteForum`. Ailleurs : `getUnreadState` (`unreadState.ts`), `getForumAccess`, `forumAccessWhere`, `topicAccessWhere`, `canAccessForum` (`lib/forumAccess.ts`).

## Les pièges

- Toute lecture ou écriture d'une catégorie, d'un forum, d'un sujet ou d'un message passe par `lib/forumAccess.ts`. Une restriction posée sur une catégorie ou un forum parent s'applique aux forums en dessous. Les actions serveur sont des portes publiques : il faut aussi filtrer ce qu'elles lisent.
- Aucune donnée propre à un membre dans un cache partagé : le cache de l'accueil ne contient que la structure.
- Ne charger que ce qui est affiché (`select`) ; jamais un `User` complet envoyé à un composant client.
- `markTopicAsRead` ne doit pas appeler `revalidatePath` : cela faisait recalculer toute la page à chaque ouverture (carte 016).
- Supprimer un message est réservé à son auteur, et c'est une suppression douce (`isDeleted`). Un modérateur masque le message (`moderatePost`) au lieu de le supprimer.
- Une page du forum qui utilise encore les anciennes classes (`forum-layout`, `forum-sidebar`…) doit importer `page-mobile.css` juste après `page.css`, sinon elle perd ses règles pour téléphone. Les écrans refaits avec les classes de la refonte (sujet, écrans de rédaction) n'importent plus que `page.css`, pour les styles des blocs BBCode (spoiler, accordéon, galerie).
- Les règles mobiles agrandissent la zone que l'on touche (`min-height`, `min-width`), jamais le texte ni les icônes : l'apparence reste la même, seule la surface tactile grandit. Les captures des 7 thèmes sur ordinateur (`visual-themes.spec.ts`) ne doivent pas changer.
- La fenêtre de signalement doit rester au-dessus de la barre de navigation : elle utilise la valeur commune des fenêtres, `var(--z-index-modal-bottom)` (8000). Avec l'ancienne valeur (2000), la barre de navigation cachait le titre de la fenêtre sur téléphone.
- Les actions qui modifient le forum (messages, sujets, réactions, verrouillage, modération, modification d'un tournoi) renvoient `{ success, error }` (type `ActionResult` de `lib/actionResult.ts`) au lieu de lever une erreur ; le composant affiche `error` dans une notification. En cas de succès, `deleteForum`, `deleteTopicPermanent` et `updateTournament` redirigent : le composant ne reçoit donc une réponse qu'en cas de refus (carte 052).
- `updateTournament` reçoit du navigateur l'identifiant du sujet et de son premier message : elle vérifie qu'ils appartiennent bien au tournoi, sinon un organisateur pourrait réécrire un autre sujet (carte 052).
- `createForum` et `createTopic` renvoient elles aussi `{ success, error }` depuis la carte 064, et redirigent en cas de succès (vers le forum parent, ou vers le nouveau sujet). Leurs formulaires passent par `ActionForm` (`common/components/Form/ActionForm.tsx`), qui affiche le refus dans une notification sans vider les champs. `createForum` refuse aussi un nom vide ou déjà pris (avant, la base refusait le doublon et le modérateur voyait une page d'erreur).
- Les écrans de rédaction n'ont pas de barre de navigation en bas sur téléphone : leur adresse est reconnue par `isComposePath` (`common/components/AppShell/navItems.ts`). Une nouvelle adresse de rédaction doit y être ajoutée, sinon la barre de navigation recouvre la barre d'envoi.
- La zone de texte de l'éditeur garde son attribut `name` (les formulaires lisent son contenu avec `FormData`, la réponse rapide la cherche par `textarea[name="content"]`) et écoute l'événement `bbcode-insert-text` (bouton « Citer »). Les noms des outils (`editorTools.ts`) sont ceux que cherche le test d'inventaire `forum-editeur.spec.ts` : en changer un oblige à changer le test.
- La colonne « Publication » du formulaire de tournoi (`CreateTopicSidebar`) contient le bouton d'envoi : elle doit rester **dans** le formulaire. Sur téléphone, elle s'affiche sous le message (`CreateTopicSidebar-mobile.css`). Avant la carte 064, elle était déplacée dans le menu latéral, hors du formulaire, et le bouton n'envoyait plus rien.

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
