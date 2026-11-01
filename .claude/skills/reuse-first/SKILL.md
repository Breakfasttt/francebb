---
name: reuse-first
description: Inventaire des composants, hooks et helpers existants de BBFrance + doublons connus. À lire AVANT de créer un composant, hook, helper, server action de recherche ou d'ajouter une dépendance.
---

# Réutiliser avant de créer

Règle : chercher ici puis `grep` avant d'écrire. Créer seulement si rien ne couvre le besoin, et le dire dans la carte.
Dépendance npm : jamais sans accord user + ADR (`docs/adr/`). Une lib déjà présente qui fait le job gagne toujours.

## Paquet partagé (`packages/ui`, `@bbfrance/ui`)
| Besoin | Utiliser |
|---|---|
| Classes conditionnelles | `cn` |
| Notification | `toast`, `Toaster` (déjà monté dans le layout) |
| Comportement de modale | `Dialog`, `DialogPortal`, `DialogOverlay`, `DialogContent`, `DialogTitle`, `DialogClose` |
| Bouton pour nouveau code hors site | `Button` (variantes sur tokens) |

**Composants de la refonte (ADR 0006, carte 082)**, à utiliser pour tout écran refait. Ils n'utilisent que les variables v2 `--bb-*` et les classes `bg-bb-*`, `text-bb-*`. Les composants historiques de `common/components` restent en place sur les écrans pas encore refaits.

| Besoin | Utiliser |
|---|---|
| Bouton d'un écran refait | `Button` avec `variant` `primary`, `secondary`, `quiet` ou `danger`, et `size` `tap` ou `tap-icon` (44 px) |
| Panneau qui monte du bas, tiroir, fenêtre centrée | `Sheet` + `SheetContent` (`side` vaut `bottom`, `right` ou `center`) |
| Confirmer une action (à la place de `confirm()` ou de `ConfirmModal` sur un écran refait) | `ConfirmDialog` (carte 089) : panneau du bas sur téléphone, fenêtre centrée sur ordinateur ; `danger` pour une action destructrice ; `children` pour un champ entre la phrase et les boutons (commentaire du modérateur, carte 099) |
| Menu « ⋯ » d'actions secondaires | `ActionMenu` : un panneau sur téléphone, une liste déroulante sur ordinateur |
| Petit panneau sous un bouton, sur ordinateur (outils, options) | `Popover`, `PopoverTrigger`, `PopoverContent` (carte 087) ; sur téléphone, utiliser `Sheet` |
| Carte, ligne de liste | `Card`, `CardHeader`, `CardTitle`, `CardBody`, `ListRow` |
| Étiquette, pastille de compteur | `Badge`, `CountBadge` |
| Avatar avec initiale | `Avatar` (les cadres de rang restent dans `UserAvatar`) |
| Champs de formulaire | `Field`, `Label`, `Input`, `Textarea`, `Select` |
| Interrupteur, info-bulle | `Switch`, `Tooltip` |
| Onglets dans la page, onglets liés à l'adresse (`?tab=`) | `Tabs*`, `LinkTabs` (lui passer `linkComponent={Link}` ; `orientation="vertical"` pour une colonne d'onglets sur ordinateur, carte 099) |
| Pagination compacte | `PageNav` : liens avec `hrefFor` (`?page=N`), ou boutons avec `onPageChange` pour une liste chargée dans la page (carte 092) |
| Liste vide, chargement | `EmptyState`, `Skeleton` |
| Éditeur de message BBCode | `BBCodeEditor` (`common/components/BBCodeEditor`) ; `screen` pour un écran de rédaction plein écran sur téléphone. Mise en page de ces écrans : `ComposeScreen` (fil d'Ariane du forum facultatif depuis la carte 094, pour le formulaire d'une ligue), `ComposeActionBar`, `RecentPostsRecap` (`app/forum/component/ComposeScreen.tsx`) |
| Savoir si on est sur ordinateur | `useMediaQuery(DESKTOP_QUERY)` |
| Pavé de date (jour en grand, mois dessous) | `DateBlock` de `app/tournois/component/TournamentListItems.tsx` (aussi sur la fiche d'une ligue, carte 094) |
| Blason d'une ligue (ou bouclier s'il n'y en a pas) | `LigueBlason` (`app/ligues/component/LigueBlason.tsx`, carte 094) |

## Paquet BBScheme (`packages/bbscheme-player`, `@bbfrance/bbscheme-player`)
| Besoin | Utiliser |
|---|---|
| Afficher un plateau BBScheme enregistré (lecture animée) | `BBSchemePlayer` ; lui passer `loadBoard={getBoardState}` (action serveur de `app/bbscheme/actions.ts`) |
| Terrain et pions d'un plateau | `Pitch`, `Token` |
| Types d'un plateau | `TokenData`, `BoardFrame`, `DrawingPath`, `PlayerRosterInfo`, `RosterData`, `ToolType`… (plus dans `app/bbscheme/page.tsx`) |

## Composants (`common/components/`)
| Besoin | Utiliser |
|---|---|
| Bouton | `Button/` : `ClassicButton`, `CTAButton`, `DangerButton`, `AdminButton`, `BadgeButton`, `ToggleButton`, `ExplainButton` |
| Champ / select | `Form/ClassicInput`, `Form/ClassicSelect` (jamais `<select>`) |
| Formulaire envoyé à une action serveur qui renvoie `ActionResult` (refus en notification, champs gardés) | `Form/ActionForm` (au lieu de `<form action={monAction}>`) |
| Conteneur carte | `PremiumCard` |
| Modale / confirmation | `Modal`, `ConfirmModal`, `ReportModal` (jamais `window.confirm`) ; modale spécifique : `Dialog*` de `@bbfrance/ui` |
| Notification | `toast` de `@bbfrance/ui` (sonner) |
| Info-bulle | `Tooltip` |
| Onglets | `TabSystem` |
| Pagination | `Pagination` |
| Avatar + cadre de rang | `UserAvatar` |
| Petite image d'avatar sans cadre, avec avatar par défaut si le membre n'en a pas | `MemberAvatarImage` (ne jamais écrire de chemin `default-avatar.png`) |
| Générateur d'avatar DiceBear (graine, style) et avatar aléatoire | `AvatarGenerator/AvatarGeneratorSheet` (`dicebearUrl`, `randomDicebearUrl`), partagé par l'inscription et le profil (carte 092) |
| Bannir ou débannir un membre (raisons rapides et précisions) | `BanUserDialog`, partagé par `/spy/[id]` et `/membres` (carte 092) |
| Recherche user / ligue | `UserSearch`, `UserMapper`, `LigueSearch` (prop `inputId` pour un libellé, carte 095), `MultiLigueSearch` (choix de plusieurs ligues, refait avec `packages/ui` par la carte 091) |
| Statut / tags | `StatusBadge`, `TagSelector` (saisie de tags avec suggestions, refaite avec `packages/ui` par la carte 095 ; props `id` et `aria-label` pour le relier à un libellé) (le contour d'avatar se choisit dans une liste `Select`, carte 092) |
| BBCode | `BBCodeEditor` (édition), `BBCodeContent` (rendu) |
| Smileys | `SmileyPicker`, `SmileyGrid` |
| En-tête page / retour | `PageHeader`, `BackButton` |
| Page réservée à l'équipe avec beaucoup d'onglets (`?tab=`) : colonne d'onglets sur ordinateur, rangée en haut sur téléphone | `StaffPageLayout` (`/moderation`, `/administration`, carte 099) |
| Vide / stat | `EmptyState`, `StatItem` |
| Mobile | `MobilePortal`, `MobileSidebar`, `DesktopOnlyFallback`, `GlobalPortal` (filtres d'une liste sur téléphone : bouton « Filtres » et `Sheet`, voir le skill `mobile-ux`) |
| Icônes | `lucide-react` uniquement (`Icons/` = icônes custom existantes) |

## Hooks / utils / lib
| Besoin | Utiliser |
|---|---|
| Détection mobile | `common/hooks/useIsMobile.ts` (`useIsMobile()` et la constante `MOBILE_BREAKPOINT`, seuil unique de 1024 pixels) |
| Temporiser une saisie | `common/hooks/useDebounce.ts` |
| Zoom au pincement à deux doigts sur un cadre qui défile | `common/hooks/usePinchZoom.ts` (`usePinchZoom(ref, { zoom, min, max, onZoomChange })`) |
| Écrire au journal de modération | `lib/moderationLog.ts` (`logModerationAction`), interne au serveur |
| Supprimer un compte membre (contenus publics rattachés au compte fantôme) | `lib/accountDeletion.ts` (`anonymizeAndDeleteUser`), interne au serveur ; l'appelant vérifie les droits |
| Adresse de retour après connexion | `lib/safeRedirect.ts` (`safeCallbackUrl`) |
| Rechercher des membres | `lib/userSearch.ts` (`userSearchWhere`) ; actions `searchUsersAction` (forum), `searchUsers` (messagerie) |
| Session serveur (connecté, non banni) | `lib/authGuard.ts` → `getActiveSession()` (jamais `auth()` direct, ni dans une action ni dans une page) |
| Retour d'une action qui modifie des données | `lib/actionResult.ts` → type `ActionResult` (`{ success, error }`), affiché par `toast.error` |
| Rôles / pouvoir | `lib/roles.ts` (`isModerator`, `getRolePower`…) |
| Libellé lisible d'un rôle, rôles personnalisés compris | `getRoleLabel(role, labels)` de `lib/roles.ts`, avec `labels` lus par `getRoleLabelMap()` (`lib/roleLabels.ts`, serveur) ou l'action `getRoleLabels` (`app/profile/actions.ts`, composant client) |
| Accès forum par rôle (`allowedRoles`) | `lib/forumAccess.ts` (`getForumAccess`, `forumAccessWhere`, `topicAccessWhere`, `canAccessForum`) — toute requête catégorie/forum/topic/post |
| Client Prisma | `lib/prisma.ts` → `prisma` (sans `User.email`, omit global) ; `prismaWithEmail` réservé auth/mail |
| BBCode → HTML | `lib/bbcode.ts` |
| Chiffrement | `lib/crypto.ts` |
| Départements / régions | `lib/france.ts` |
| Mail | `lib/mail.ts` |
| Données de référence | `lib/referenceData.ts` |
| Config site | `lib/siteConfig.ts` |
| Liste des 7 thèmes (identifiant, nom, thème par défaut) | `lib/themes.ts` : `SITE_THEMES`, `DEFAULT_SITE_THEME`, `isSiteTheme` |
| Points classement CDF | `common/utils/cdf.ts` |
| Dates | `date-fns` (déjà installé) |
| Drag & drop | `@dnd-kit/*` (déjà installé) |
| Carte | `leaflet` / `react-leaflet` (déjà installé) |

## Doublons connus (ne pas en ajouter)
- Aucun doublon connu pour l'instant.

Nouveau composant partagé créé ? Ajouter sa ligne ici dans le même commit.
