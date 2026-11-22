# Forum

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour en fin de gros chantier (commande `/ship`) ou quand le comportement visible change. Environ 80 lignes au plus.

## À quoi ça sert

Le forum est le cœur de la communauté : les coachs y discutent par catégories, forums et sous-forums, ouvrent des sujets et y répondent. Les annonces de tournoi sont aussi des sujets du forum (`../tournois/`). Depuis la carte 221, l'éditeur et le BBCode ont leur fiche (`../editeur-bbcode/`), comme la recherche et les non-lus (`../recherche-non-lus/`).

## Ce que voit le coach

- **Mise en page (carte 220)** : accueil, liste d'un forum et non-lus utilisent `SiteLayout` (toute la largeur, 1760 pixels au plus). Le panneau gauche porte l'action principale (« Nouveau sujet », « Annoncer un tournoi » dans le forum des tournois), les « Outils du forum », « Tout marquer comme lu » et, pour un modérateur, le groupe « Administration ». Les dates des listes sont relatives (« il y a 2 heures »), complètes au survol.
- `/forum` : catégories repliables. Chaque forum montre le nombre de sujets et de messages, le dernier sujet et, dessous, ses sous-forums (« Sous-forums : … », liens directs, carte 221). Un trait bleu signale du non-lu. À partir de 1440 pixels, une colonne « Dernières discussions » (8 sujets). La recherche rapide (`ForumQuickSearch`) et « Nouveau sujet » sont en tête : panneau gauche sur ordinateur, haut de la page sur téléphone.
- `/forum/new-topic` sans forum (bouton de l'accueil) : le coach choisit d'abord le forum, rangé par catégorie. Seuls les forums qu'il voit et où il peut écrire sont proposés (pas les forums verrouillés, sauf pour un modérateur).
- `/forum/[id]` : les sujets d'un forum (30 par page) et ses sous-forums. Les sujets archivés sont dans un groupe replié « Sujets archivés (N) » en bas de la dernière page (100 au plus, les autres par la recherche). Ils ne comptent jamais comme non lus.
- `/forum/topic/[id]` : un sujet, 20 messages par page. Outils du sujet dans le panneau gauche sur ordinateur. Chaque message est un bloc : auteur à gauche (avatar, pseudo, rang, rôle, nombre de messages, ligue, région), date et heure exactes de Paris, numéro. Le coach arrive sur son premier message non lu ; un trait bleu « Nouveaux messages » le précède (`firstUnreadPostId`, pas devant le tout premier message du sujet). Badges « ARCHIVÉ » et « VERROUILLÉ » près du titre. Le coach peut réagir (dix émojis), citer, mentionner, signaler (le menu dit ensuite « Signalement envoyé »), partager, suivre le sujet, le marquer non lu à partir d'un message. Le bouton d'envoi s'appelle « Publier ma réponse ».
- **Pagination d'un sujet (carte 182)** : « Première page », « Page précédente », « Page suivante », « Aller à la fin ». « Page 3 sur 15 » ouvre le panneau « Choisir une page » (`PagePicker`).
- `/forum/post/[id]` (carte 169) : lien permanent d'un message ; il renvoie à la bonne page du sujet, avec les mêmes droits.
- **Écrans de rédaction** (carte 087) : `/forum/topic/[id]/reply`, `/forum/post/[id]/edit`, `/forum/new-topic?forumId=…`, `/forum/new-forum`. Plein écran sur téléphone, barre d'envoi collée en bas. Pendant l'envoi, le bouton se grise (carte 193). Éditeur, brouillons, photos et citations : `../editeur-bbcode/`.
- **Visiteurs (carte 185)** : en bas d'un sujet, l'encart « Envie de participer ? » mène à la connexion puis ramène au sujet. L'accueil du forum leur montre un bandeau qui se ferme.
- **Modérateurs d'un forum (carte 225)** : partout dans le forum, « modérateur » veut dire modérateur du site **ou** membre inscrit modérateur de ce forum ou d'un forum parent (`canModerateForum`, `forumModerationScope` de `lib/forumModerators.ts`). Les pages d'un forum, d'un sujet, de réponse, de modification d'un message et « Nouveau sujet » calculent ce droit pour le forum affiché ; « Déplacer », « Scinder » et la recherche de « Fusionner » ne proposent que des forums et sujets qu'il modère. La CDF, les tournois, la création, la suppression et le verrouillage d'un forum restent à la modération du site.
- **Limites (carte 169)** : titre de 3 à 150 caractères ; message non vide, 30 000 caractères au plus. Un sujet archivé est fermé comme un sujet verrouillé : plus de réponse, réaction, modification ni suppression, sauf par un modérateur.
- **Supprimer (carte 165)** : tout est « doux », rien n'est effacé. Un modérateur supprime un sujet avec une raison ; il disparaît partout (listes, recherche, non-lus, profil, tournois) et reste visible des seuls modérateurs avec « Restaurer le sujet ». Un sujet dont le tournoi a des résultats ne se supprime pas. Un message se supprime par son auteur (« supprimé par son auteur ») ou par un modérateur avec une raison. L'auteur qui supprime le premier message d'un sujet sans réponse supprime le sujet.
- **Modifier un message** : l'auteur tant que le sujet est ouvert, un modérateur toujours. Depuis la carte 221, l'auteur ne peut plus modifier un message supprimé ou masqué ; un modérateur qui modifie le message d'un autre est inscrit au journal (« Message modifié par la modération »). La page « Modifier » applique la même règle que l'enregistrement (`canSavePostEdit`) : si elle serait refusée, elle ne s'ouvre pas. Le coach revient sur son message et une notification dit pourquoi (`EditRefusedNotice`, paramètre `?modification=…`).
- **Modération** : un modérateur épingle, verrouille, archive, déplace, renomme (inscrit au journal quand ce n'est pas l'auteur, carte 221), scinde, fusionne, masque ou démasque un message, supprime ou restaure, crée ou supprime un forum vide. Vocabulaire unique dans le menu « ⋯ » : « Masquer » / « Démasquer », « Supprimer » / « Restaurer le message ». Un message masqué ne reçoit plus de réaction (refusé aussi par le serveur). Masquer ou supprimer ferme les signalements en attente. Détails : `../moderation/`.
- **Vues (carte 169)** : une par visite (30 minutes d'écart) où le membre lit un nouveau message.
- **Accès** : un visiteur lit les forums publics, un membre connecté écrit. Un forum réservé est invisible aux autres rôles : le visiteur va à la connexion, le membre reçoit « introuvable ». Le profil exemple contient un forum réservé aux modérateurs, un réservé aux admins et un forum verrouillé (catégorie « Les coulisses (exemple) »).
- **Sur téléphone** (jusqu'à 1024 pixels) : une colonne ; recherche et « Nouveau sujet » en haut de la liste ; outils du forum sous la liste. Chaque forum résume ses chiffres sur une ligne (« 12 sujets · 340 messages »). Sur un sujet, « Outils » ouvre le panneau « Outils du sujet », et une barre collée en bas porte la pagination et « Répondre ». L'auteur tient sur une ligne en tête du message ; un appui ouvre sa fiche (`PostAuthorSheet`). La signature se replie (« Voir la signature »). Toutes les cibles font 44 pixels. Les fenêtres (`Sheet`) montent du bas, au-dessus de la barre de navigation.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/app/forum/page.tsx`, `[id]/page.tsx`, `topic/[id]/page.tsx`, `post/[id]/page.tsx` | Accueil (structure en cache 60 secondes par niveau d'accès), liste d'un forum, sujet, lien permanent. |
| `apps/site/app/forum/new-topic/page.tsx`, `post/[id]/edit/page.tsx` | Nouveau sujet (avec le choix du forum quand il manque) ; page « Modifier » qui renvoie au message si la modification serait refusée. |
| `apps/site/app/forum/component/` | `ForumCategory`, `ForumListItems`, `ForumSidebar`, `ForumQuickSearch`, `TopicTools`, `PostItem`, `PostMoreMenu`, `PostAuthorSheet`, `ComposeScreen`, `EditRefusedNotice`, formulaires et fenêtres (`MoveTopicModal`, `EditTopicTitleModal`, `ModerationModal`), `ForumVisitorInvite`, `TopicSplitMerge`. |
| `apps/site/app/forum/actions.ts` | Actions du forum et des inscriptions aux tournois. |
| `apps/site/app/forum/topicSplitMergeActions.ts` | `splitTopic`, `mergeTopics`, `searchMergeTargets`. |
| `apps/site/lib/forumAccess.ts` | Droits d'accès par rôle. |
| `apps/site/lib/forumRights.ts` | `canReplyToTopic`, `canEditPost`, `canSavePostEdit`. Testé par `tests/unit/forumRights.test.mjs`. |
| `apps/site/lib/forumDeletion.ts` | Qui supprime ou restaure (`decidePostDeletion`, `topicDeletionRefusal`, `canRestorePost`). |
| `apps/site/lib/forumWriteRules.ts` | Longueurs, sujet fermé (`isTopicClosedFor`), émojis permis. |
| `apps/site/lib/forumStructure.ts`, `forumStructureRules.ts` | Créer, modifier, supprimer un forum (partagé avec l'administration). |
| `apps/site/lib/forumPostLink.ts`, `forumTopicLastPost.ts` | Page d'un message (`TOPIC_POSTS_PER_PAGE` = 20) ; recalcul du dernier message. |
| `apps/site/lib/forumPostPrivacy.ts` | Ce que la page a le droit d'envoyer au navigateur (`POST_AUTHOR_SELECT`, `PUBLIC_MEMBER_SELECT`, `hidePostContent`). |
| `apps/site/lib/pageRefresh.ts` | `refreshTopic`, `refreshTournament`, `refreshForumStructure`. |

## Les pièges

- **Toute lecture ou écriture passe par `lib/forumAccess.ts`.** Une restriction de catégorie ou de forum parent s'applique dessous. Les actions serveur sont des portes publiques : filtrer aussi ce qu'elles lisent. Depuis la carte 221, `getQuoteStatusMap` et `getSubForumCount` sont filtrées elles aussi.
- **Droits à un seul endroit (carte 200)** : `lib/forumRights.ts`. La page calcule une fois et transmet `canReply` et `canEdit` ; aucun composant ne recalcule. `updatePost` appelle `canSavePostEdit` (carte 221).
- **Rafraîchir (carte 202)** : appeler `refreshTopic`, `refreshTournament` ou `refreshForumStructure` (`lib/pageRefresh.ts`), jamais une liste de `revalidatePath`. Une nouvelle page qui affiche un sujet s'y ajoute.
- **Structure du forum (carte 199)** : passer par `lib/forumStructure.ts` ; ne pas réécrire ses règles.
- **Rien de privé dans un cache partagé**, et ne charger que ce qui est affiché. Les champs envoyés au navigateur sont rangés dans `lib/forumPostPrivacy.ts`.
- **Jamais le texte d'un message supprimé ou masqué dans la page (carte 164)** : `hidePostContent` le vide ; un tel message ne se cite pas.
- **Un sujet supprimé est filtré par `topicAccessWhere`** ; une requête qui ne l'utilise pas ajoute `isDeleted: false`. Les listes de tournois utilisent `TOURNAMENT_TOPIC_NOT_DELETED`. Supprimer ou restaurer un sujet passe par du SQL direct pour garder `updatedAt`.
- **Non-lu et tri suivent `lastPostAt`** : voir `../recherche-non-lus/`.
- Scinder ou fusionner déplace les messages en SQL direct, dans une transaction ; un sujet fusionné ne se restaure pas.
- Les actions renvoient `{ success, error }` (`lib/actionResult.ts`) ; `deleteForum`, `deleteTopic`, `createTopic`, `createForum` et `updateTournament` redirigent en cas de succès. `updateTournament` vérifie que le sujet et le message reçus appartiennent au tournoi.
- Une nouvelle adresse de rédaction s'ajoute à `isComposePath` (`AppShell/navItems.ts`), sinon la barre de navigation couvre la barre d'envoi.
- Le numéro de page est ramené entre 1 et la dernière page avant la lecture (carte 109). L'ancre `quick-reply-area` n'existe que s'il y a une vraie zone de réponse.
- Les boutons du formulaire de tournoi restent dans le `<form>` (carte 064).
- Les règles mobiles agrandissent la zone touchée, jamais le texte : les captures des thèmes ne doivent pas changer.

## Les mots expliqués

| Mot | Sens |
|---|---|
| Catégorie / forum / sous-forum | Les trois niveaux de rangement. |
| Sujet (*topic*) / message (*post*) | Une discussion et ses messages. |
| Épinglé, verrouillé, archivé | Toujours en haut ; seuls les modérateurs y écrivent ; fermé, retiré des non-lus et rangé dans le groupe replié en bas du forum. |
| Message masqué (`isModerated`) | Caché aux autres, lisible par son auteur et les modérateurs, avec la raison. « Démasquer » le rend visible. |
| Suppression douce | Marqué supprimé (`isDeleted`) au lieu d'être effacé ; un modérateur peut restaurer. |
| Lien permanent | `/forum/post/<identifiant>`, qui renvoie toujours à la bonne page. |
| `allowedRoles` | Rôles qui voient un forum : « ce rôle et au-dessus ». |

## Interactions

**Elle agit sur**

| Fonctionnalité | Endroit | Effet |
|---|---|---|
| Notifications | `lib/notifications.ts` | Mentions, réponses dans un sujet suivi, abonnement automatique. |
| Tournois | Sujet du tournoi | Supprimer le sujet retire le tournoi des listes et bloque les inscriptions (carte 221). |
| Modération | `closePendingReports`, journal | Masquer ou supprimer ferme les signalements ; chaque action est inscrite. |
| Profil | Activité, sujets suivis | Les messages et sujets du membre y apparaissent. |
| Accueil, statistiques | `homeData.ts`, `/statistiques` | Derniers sujets, compteurs. |

**Elle dépend de**

| Fonctionnalité | Endroit | Effet |
|---|---|---|
| Rôles | `lib/forumAccess.ts`, `lib/forumRights.ts` | Forums visibles et outils proposés. |
| Bannissement | `getActiveSession`, `PostItem` | Un banni n'écrit plus ; ses messages sont repliés. |
| Blocage | Profil | Les messages d'un membre bloqué sont repliés, sans notification. |
| Administration | Onglet « Structure » | Catégories, forums, accès. |
| Éditeur | `../editeur-bbcode/` | Rédaction, rendu, citations. |

Vue d'ensemble : [../INTERACTIONS.md](../INTERACTIONS.md).

## État

- Performances (cartes 014 à 020, 028) : accueil connecté 16 → 6 requêtes, sujet 85 → 46.
- Cartes 052 et 064 : plus aucun `throw` dans `actions.ts`. Carte 053 : aucune cible trop petite sur téléphone.
- Cartes 165, 166, 167, 169 : suppression douce, non-lus fiables, notifications, scinder et fusionner, lien permanent, vues.
- Cartes 181 à 185, 191, 193 : brouillons, pagination, citations, photos, visiteurs, recherche plein texte, envoi visible.
- Carte 220 : refonte visuelle. Carte 221 : modification d'un message caché refusée, journal des modifications et renommages, lectures filtrées, données de test complètes (vitrine BBCode, sujets dans tous les états, forums réservés). Revue page par page : archivés de nouveau visibles, repère « Nouveaux messages », choix du forum, page « Modifier » fiable, sous-forums sur l'accueil, Masquer / Démasquer.
- Tests : `forum-sujet`, `forum-listes`, `forum-recherche`, `forum-editeur` (inventaire), `security.spec.ts`, `permissions.spec.ts`.
