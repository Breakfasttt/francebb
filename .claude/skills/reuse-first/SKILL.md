---
name: reuse-first
description: Inventaire des composants, hooks et helpers existants de BBFrance + doublons connus. À lire AVANT de créer un composant, hook, helper, server action de recherche ou d'ajouter une dépendance.
---

# Réutiliser avant de créer

Avant d'écrire un composant, un hook ou une fonction, chercher dans cette liste, puis dans le code avec `grep`. On ne crée que si rien ne couvre le besoin, et on le dit dans la carte.

Une nouvelle bibliothèque (dépendance npm) n'est jamais ajoutée sans l'accord du responsable du projet et un ADR (`docs/adr/`). Une bibliothèque déjà installée qui fait le travail passe toujours avant.

## Paquet partagé (`packages/ui`, `@bbfrance/ui`)

À utiliser pour tout écran. Ces composants n'utilisent que les variables v2 `--bb-*` (classes `bg-bb-*`, `text-bb-*`) et fonctionnent aussi dans le hub.

| Besoin | Utiliser |
|---|---|
| Classes conditionnelles | `cn` |
| Notification | `toast` (`Toaster` est déjà monté dans le layout) |
| Fenêtre sur mesure (comportement seul : Échap, focus, accessibilité) | `Dialog`, `DialogTrigger`, `DialogPortal`, `DialogOverlay`, `DialogContent`, `DialogTitle`, `DialogDescription`, `DialogClose` |
| Bouton | `Button` avec `variant` `primary`, `secondary`, `quiet` ou `danger`, et `size` `tap` ou `tap-icon` (44 px) |
| Panneau qui monte du bas, tiroir, fenêtre centrée | `Sheet` + `SheetContent` (`side` vaut `bottom`, `right` ou `center`) |
| Confirmer une action (jamais `confirm()`) | `ConfirmDialog` : panneau du bas sur téléphone, fenêtre centrée sur ordinateur ; `danger` pour une action destructrice ; `children` pour un champ entre la phrase et les boutons (commentaire du modérateur, carte 099) |
| Menu « ⋯ » d'actions secondaires | `ActionMenu` : un panneau sur téléphone, une liste déroulante sur ordinateur |
| Petit panneau sous un bouton, sur ordinateur (outils, options) | `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverClose` ; sur téléphone, utiliser `Sheet` |
| Carte, ligne de liste | `Card`, `CardHeader`, `CardTitle`, `CardBody`, `ListRow` |
| Étiquette, pastille de compteur | `Badge`, `CountBadge` |
| Avatar avec initiale | `Avatar` (les cadres de rang restent dans `UserAvatar`) |
| Champs de formulaire (texte en 16 pixels, 44 pixels de haut) | `Field`, `Label`, `Input`, `Textarea`, `Select` |
| Interrupteur, info-bulle | `Switch`, `Tooltip` |
| Onglets dans la page, onglets liés à l'adresse (`?tab=`) | `Tabs*`, `LinkTabs` (lui passer `linkComponent={Link}` ; `orientation="vertical"` pour une colonne d'onglets sur ordinateur, carte 099) |
| Pagination compacte | `PageNav` : liens avec `hrefFor` (`?page=N`), ou boutons avec `onPageChange` pour une liste chargée dans la page (carte 092) |
| Liste vide, chargement | `EmptyState`, `Skeleton` |
| Savoir si on est sur ordinateur (seuil de 1025 pixels) | `useMediaQuery(DESKTOP_QUERY)` |

## Paquet BBScheme (`packages/bbscheme-player`, `@bbfrance/bbscheme-player`)
| Besoin | Utiliser |
|---|---|
| Afficher un plateau BBScheme enregistré (lecture animée) | `BBSchemePlayer` ; lui passer `loadBoard={getBoardState}` (action serveur de `app/bbschemeBoardActions.ts`, qui lit le schéma auprès de l'application BBScheme). `editorUrl` facultatif : affiche le bouton « Ouvrir dans l'éditeur » |
| Terrain et pions d'un plateau | `Pitch`, `Token` |
| Types d'un plateau | `TokenData`, `BoardFrame`, `DrawingPath`, `PlayerRosterInfo`, `RosterData`, `ToolType`… (l'éditeur, en attente, est dans `apps/bbscheme/editeur-en-attente/`) |

## Composants du site (`apps/site/common/components/`, sauf mention d'un autre dossier)
| Besoin | Utiliser |
|---|---|
| Écran de rédaction (plein écran sur téléphone, sans barre basse) | `ComposeScreen` (fil d'Ariane du forum facultatif), `ComposeActionBar` (barre d'envoi collée en bas), `RecentPostsRecap` (`app/forum/component/ComposeScreen.tsx`) ; `BBCodeEditor` avec la prop `screen` ; l'adresse s'ajoute à `isComposePath` |
| Pavé de date (jour en grand, mois dessous) | `DateBlock` de `app/tournois/component/TournamentListItems.tsx` (aussi sur la fiche d'une ligue et l'accueil) |
| Lien vers le sujet d'un tournoi, ville d'un tournoi | `topicHref` et `placeText` du même fichier (utilisés aussi par l'accueil, carte 155) |
| Blason d'une ligue (ou bouclier s'il n'y en a pas) | `LigueBlason` (`app/ligues/component/LigueBlason.tsx`) |
| Formulaire envoyé à une action serveur qui renvoie `ActionResult` (refus en notification, champs gardés) | `Form/ActionForm` (au lieu de `<form action={monAction}>`) |
| Conteneur carte | `Card` de `@bbfrance/ui` ; `PremiumCard` ne sert plus qu'aux mentions légales, ne pas le réutiliser |
| Fenêtre, confirmation, signalement | `ConfirmDialog` et `Sheet` de `@bbfrance/ui` (jamais `window.confirm`) ; `ReportModal` pour signaler un contenu ; `Modal` et `ConfirmModal` restent pour les écrans qui les utilisent déjà, pas pour un nouvel écran |
| Avatar avec le cadre du rang du membre | `UserAvatar` |
| Petite image d'avatar sans cadre, avec avatar par défaut si le membre n'en a pas | `MemberAvatarImage` (ne jamais écrire de chemin `default-avatar.png`) |
| Générateur d'avatar DiceBear (graine, style) et avatar aléatoire | `AvatarGenerator/AvatarGeneratorSheet` (`dicebearUrl`, `randomDicebearUrl`), partagé par l'inscription et le profil (carte 092) |
| Bannir ou débannir un membre (raisons rapides et précisions) | `BanUserDialog`, partagé par `/spy/[id]` et `/membres` (carte 092) |
| Rechercher et choisir un membre ou une ligue | `UserSearch`, `UserMapper`, `LigueSearch` (prop `inputId` pour le relier à un libellé), `MultiLigueSearch` (choix de plusieurs ligues) |
| Saisie d'étiquettes (tags) avec suggestions | `TagSelector` (props `id` et `aria-label` pour le relier à un libellé) ; pour afficher un statut, `Badge` de `@bbfrance/ui` |
| Écrire et afficher un message BBCode | `BBCodeEditor` (édition), `BBCodeContent` (rendu, styles dans `BBCodeContent/bbcode.css`) |
| Smileys | `SmileyGrid` |
| En-tête de page et bouton retour | `ForumListHeader` (`app/forum/component/`, pages du forum), `BackButton` (44 px sur téléphone, affiché sur place à gauche du titre) ; `PageHeader` ne sert plus qu'aux mentions légales |
| Page réservée à l'équipe avec beaucoup d'onglets (`?tab=`) : colonne d'onglets sur ordinateur, rangée en haut sur téléphone | `StaffPageLayout` (`/moderation`, `/administration`) |
| Envoyer un élément dans la coquille (téléphone) | **Interdit** depuis la carte 156 : pas de portail React (`createPortal`) dans le code du projet. Afficher l'élément dans la page, ou dans un `Sheet` ouvert depuis la page |
| Filtres d'une liste sur téléphone | Bouton « Filtres », `Sheet` et pastilles : copier `app/articles/component/ArticleFilters.tsx` ou `app/ressources/component/ResourceFilters.tsx` (skill `mobile-ux`) |
| Rubriques de la navigation, écrans plein écran | `common/components/AppShell/navItems.ts` (`PRIMARY_NAV`, `MORE_NAV`, `DESKTOP_NAV`, `isComposePath`) |
| Icônes | `lucide-react` uniquement ; `Icons/SocialIcons.tsx` garde les logos de réseaux sociaux absents de Lucide |

## Hooks, petites fonctions et code serveur (`apps/site`)
| Besoin | Utiliser |
|---|---|
| Détection mobile | `common/hooks/useIsMobile.ts` (`useIsMobile()` et la constante `MOBILE_BREAKPOINT`, seuil unique de 1024 pixels) |
| Temporiser une saisie | `common/hooks/useDebounce.ts` |
| Envoyer une image choisie par un membre (hébergée chez ImgBB, clé gardée par le serveur) | `uploadImageFile(file)` de `common/utils/imageUpload.ts`, qui appelle l'action `uploadImage` (`app/imageUploadActions.ts`) ; jamais d'appel direct à ImgBB depuis le navigateur (carte 141) |
| Zoom au pincement à deux doigts sur un cadre qui défile | `usePinchZoom(ref, { zoom, min, max, onZoomChange })`, parti avec l'éditeur BBScheme dans `apps/bbscheme/editeur-en-attente/hooks/` (carte 179) : le déplacer dans un paquet partagé avant de s'en servir dans le site |
| Écrire au journal de modération | `lib/moderationLog.ts` (`logModerationAction`), interne au serveur |
| Fermer les signalements en attente d'un contenu après une action de modération | `lib/moderationReports.ts` (`closePendingReports`), interne au serveur |
| Supprimer un compte membre (contenus publics rattachés au compte fantôme) | `lib/accountDeletion.ts` (`anonymizeAndDeleteUser`), interne au serveur ; l'appelant vérifie les droits |
| Adresse de retour après connexion | `lib/safeRedirect.ts` (`safeCallbackUrl`) |
| Rechercher des membres | `lib/userSearch.ts` (`userSearchWhere`) ; actions `searchUsersAction` (forum), `searchUsers` (messagerie) |
| Session serveur (connecté, non banni) | `lib/authGuard.ts` → `getActiveSession()` (jamais `auth()` direct, ni dans une action ni dans une page) |
| Retour d'une action qui modifie des données | `lib/actionResult.ts` → type `ActionResult` (`{ success, error }`), affiché par `toast.error` |
| Rôles et niveau de pouvoir | `lib/roles.ts` (`isModerator`, `getRolePower`…) |
| Libellé lisible d'un rôle, rôles personnalisés compris | `getRoleLabel(role, labels)` de `lib/roles.ts`, avec `labels` lus par `getRoleLabelMap()` (`lib/roleLabels.ts`, serveur) ou l'action `getRoleLabels` (`app/profile/actions.ts`, composant client) |
| Accès forum par rôle (`allowedRoles`) | `lib/forumAccess.ts` (`getForumAccess`, `forumAccessWhere`, `topicAccessWhere`, `canAccessForum`) — toute requête catégorie/forum/topic/post |
| Champs d'un membre envoyés au navigateur, texte d'un message supprimé ou masqué, citation autorisée | `lib/forumPostPrivacy.ts` (`POST_AUTHOR_SELECT`, `PUBLIC_MEMBER_SELECT`, `POST_MODERATOR_SELECT`, `hidePostContent`, `canQuotePost`) |
| Client Prisma | `lib/prisma.ts` → `prisma` (ne renvoie jamais `User.email`) ; `prismaWithEmail` réservé à la connexion et aux mails |
| BBCode → HTML | `lib/bbcode.ts` |
| Chiffrement | `lib/crypto.ts` |
| Départements / régions | `lib/france.ts` |
| Mail | `lib/mail.ts` ; toute valeur insérée dans le HTML d'un e-mail passe par `escapeHtml` (`lib/htmlEscape.ts`, carte 167) ; un e-mail envoyé par une action part dans `after()` de `next/server` |
| Notifications sous la cloche (mention, réponse dans un sujet suivi, message privé), abonnement automatique à un sujet | `lib/notifications.ts` (`notifyMentions`, `notifyFollowers`, `notifyPrivateMessage`, `followTopicAutomatically`, `visibleNotificationsWhere`), carte 167 |
| Mentions d'un message (sans doublon, 10 au plus) | `extractMentionIds` de `lib/mentionRules.ts` |
| Adresse d'un message du forum sur la bonne page de son sujet (`?page=N#post-<id>`) | `forumPostHref`, `forumPostHrefFor` (message déjà lu) et `forumPostPage` de `lib/forumPostLink.ts` ; dans du HTML ou un lien sans calcul, le lien permanent `/forum/post/<id>` (carte 169) |
| Longueur d'un titre ou d'un message du forum, sujet fermé (verrouillé, archivé), émojis de réaction | `lib/forumWriteRules.ts` (`topicTitleError`, `postContentError`, `isTopicClosedFor`, `REACTION_EMOJIS`), carte 169 |
| Recalculer le dernier message d'un sujet après avoir ajouté, retiré ou déplacé des messages | `refreshTopicLastPost` de `lib/forumTopicLastPost.ts`, interne au serveur (accepte le client d'une transaction) |
| Rôles accessibles à un autre membre que le visiteur (droits d'un destinataire) | `loadRolePowers` et `accessibleRolesFor` de `lib/forumAccess.ts`, avec `canAccessForum` et `FORUM_ACCESS_SELECT` |
| Données de référence | `lib/referenceData.ts` |
| Config site | `lib/siteConfig.ts` |
| Liste des 8 thèmes (identifiant, nom, thème par défaut) | `lib/themes.ts` : `SITE_THEMES`, `DEFAULT_SITE_THEME`, `isSiteTheme` |
| Points classement CDF | `common/utils/cdf.ts` |
| Dates | `date-fns` (déjà installé) |
| Drag & drop | `@dnd-kit/*` (déjà installé) |
| Carte | `leaflet` / `react-leaflet` (déjà installé) |

## Doublons connus (ne pas en ajouter)

Aucun doublon connu pour l'instant.

Quand on crée un composant partagé, on ajoute sa ligne dans ce skill, dans le même commit.
