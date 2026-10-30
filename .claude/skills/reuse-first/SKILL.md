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
| Recherche user / ligue | `UserSearch`, `UserMapper`, `LigueSearch`, `MultiLigueSearch` |
| Rang / statut / tags | `RankSelect`, `StatusBadge`, `TagSelector` |
| BBCode | `BBCodeEditor` (édition), `BBCodeContent` (rendu) |
| Smileys | `SmileyPicker`, `SmileyGrid` |
| En-tête page / retour | `PageHeader`, `BackButton` |
| Vide / stat | `EmptyState`, `StatItem` |
| Mobile | `MobilePortal`, `MobileSidebar`, `MobileFilterWrapper`, `DesktopOnlyFallback`, `GlobalPortal` |
| Icônes | `lucide-react` uniquement (`Icons/` = icônes custom existantes) |

## Hooks / utils / lib
| Besoin | Utiliser |
|---|---|
| Détection mobile | `common/hooks/useIsMobile.ts` (`useIsMobile()` et la constante `MOBILE_BREAKPOINT`, seuil unique de 1024 pixels) |
| Temporiser une saisie | `common/hooks/useDebounce.ts` |
| Écrire au journal de modération | `lib/moderationLog.ts` (`logModerationAction`), interne au serveur |
| Supprimer un compte membre (contenus publics rattachés au compte fantôme) | `lib/accountDeletion.ts` (`anonymizeAndDeleteUser`), interne au serveur ; l'appelant vérifie les droits |
| Adresse de retour après connexion | `lib/safeRedirect.ts` (`safeCallbackUrl`) |
| Rechercher des membres | `lib/userSearch.ts` (`userSearchWhere`) ; actions `searchUsersAction` (forum), `searchUsers` (messagerie) |
| Session serveur (connecté, non banni) | `lib/authGuard.ts` → `getActiveSession()` (jamais `auth()` direct, ni dans une action ni dans une page) |
| Retour d'une action qui modifie des données | `lib/actionResult.ts` → type `ActionResult` (`{ success, error }`), affiché par `toast.error` |
| Rôles / pouvoir | `lib/roles.ts` (`isModerator`, `getRolePower`…) |
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
