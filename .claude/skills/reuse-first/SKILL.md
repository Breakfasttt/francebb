---
name: reuse-first
description: Inventaire des composants, hooks et helpers existants de BBFrance + doublons connus. À lire AVANT de créer un composant, hook, helper, server action de recherche ou d'ajouter une dépendance.
---

# Réutiliser avant de créer

Règle : chercher ici puis `grep` avant d'écrire. Créer seulement si rien ne couvre le besoin, et le dire dans la carte.
Dépendance npm : jamais sans accord user + ADR (`docs/adr/`). Une lib déjà présente qui fait le job gagne toujours.

## Composants (`common/components/`)
| Besoin | Utiliser |
|---|---|
| Bouton | `Button/` : `ClassicButton`, `CTAButton`, `DangerButton`, `AdminButton`, `BadgeButton`, `ToggleButton`, `ExplainButton` |
| Champ / select | `Form/ClassicInput`, `Form/ClassicSelect` (jamais `<select>`) |
| Conteneur carte | `PremiumCard` |
| Modale / confirmation | `Modal`, `ConfirmModal`, `ReportModal` (jamais `window.confirm`) |
| Notification | `Toast` |
| Info-bulle | `Tooltip` |
| Onglets | `TabSystem` |
| Pagination | `Pagination` |
| Avatar + cadre de rang | `UserAvatar` |
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
| Détection mobile | `common/hooks/useIsMobile.ts` |
| Session serveur (connecté, non banni) | `lib/authGuard.ts` → `getActiveSession()` (jamais `auth()` direct dans une action) |
| Rôles / pouvoir | `lib/roles.ts` (`isModerator`, `getRolePower`…) |
| Accès forum par rôle (`allowedRoles`) | `lib/forumAccess.ts` (`getForumAccess`, `forumAccessWhere`, `topicAccessWhere`, `canAccessForum`) — toute requête catégorie/forum/topic/post |
| Client Prisma | `lib/prisma.ts` → `prisma` (sans `User.email`, omit global) ; `prismaWithEmail` réservé auth/mail |
| BBCode → HTML | `lib/bbcode.ts` |
| Chiffrement | `lib/crypto.ts` |
| Départements / régions | `lib/france.ts` |
| Mail | `lib/mail.ts` |
| Données de référence | `lib/referenceData.ts` |
| Config site | `lib/siteConfig.ts` |
| Points classement CDF | `common/utils/cdf.ts` |
| Dates | `date-fns` (déjà installé) |
| Drag & drop | `@dnd-kit/*` (déjà installé) |
| Carte | `leaflet` / `react-leaflet` (déjà installé) |

## Doublons connus (ne pas en ajouter, fusion prévue en P4)
- 2 systèmes de toast : `react-hot-toast` + `common/components/Toast` → cible `sonner`.
- Overlays de modale réécrits ×4 → cible Dialog shadcn.
- 4 recherches d'utilisateurs → cible une server action `searchUsers`.
- Thème « Sombre » (`dark`) proposé dans l'onboarding et le profil mais sans CSS dédié : il affiche le thème par défaut.

Nouveau composant partagé créé ? Ajouter sa ligne ici dans le même commit.
