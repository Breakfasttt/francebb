# Administration

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

La page d'administration permet aux administrateurs de régler le site sans toucher au code : rôles des membres, structure du forum, listes de référence (régions…), textes du guide du débutant, lien Discord, annonces par email à tous les coachs. Le Super Admin y trouve en plus la remise à zéro complète du site.

## Ce que voit le coach

- `/administration` (refaite par la carte 099, ADR 0006) : un titre, les onglets et le contenu de l'onglet ouvert. Chaque onglet est un lien : l'onglet ouvert est gardé dans l'adresse (`?tab=roles`) ; une valeur inconnue ouvre « Configuration ».
- Onglets : « Configuration » (lien d'invitation Discord), « Gestion des rôles » (créer un rôle personnalisé avec identifiant, libellé et couleur, le supprimer, régler la hiérarchie en faisant glisser sa poignée), « Membres & accès » (chercher un coach par pseudo et changer son rôle, rôles affichés par leur libellé), « Structure du forum » (catégories, forums, sous-forums ; poignée pour l'ordre, menu « ⋯ » pour indenter, désindenter ou changer de catégorie, panneau « Modifier » pour le nom, la description, le rôle minimum d'accès et la suppression), « Données de référence » (listes comme les régions), « Guide du débutant » (textes des six sections de la page `/jouer`, lus sans connexion par `getHowToPlaySettings`), « Annonces par e-mail » (mail envoyé à tous les membres non bannis, confirmé par « Oui, diffuser », puis écran « Diffusion terminée »).
- Super Admin seulement : « Zone de danger » (remise à zéro, protégée par trois cases à cocher et la phrase « JE COMPRENDS LES RISQUES » : le bouton reste désactivé tant que la phrase n'est pas exacte).
- Accès : administrateur et Super Admin. Un visiteur est envoyé vers la connexion, un membre sans le rôle vers l'accueil. Cette vérification de la page se fait dans le navigateur ; la vraie protection est dans chaque action serveur.
- **Sur téléphone** : une seule colonne ; les onglets forment une rangée en haut de la page qui défile de côté et se place sur l'onglet ouvert (avant la carte 099, ils étaient dans le panneau « Plus »). Sur ordinateur, une colonne d'onglets à gauche. Mise en page commune avec la modération : `StaffPageLayout`. Les listes (rôles, membres, données de référence, structure) sont des fiches, plus de tableau qui défile de côté. Les poignées de glisser-déposer font 44 pixels et suivent le doigt sans faire défiler la page (`touch-action: none`) ; au clavier, Espace prend la poignée, les flèches déplacent, Espace pose. Les panneaux (modification d'un forum, remise à zéro) et les confirmations montent du bas de l'écran.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/app/administration/page.tsx` | Page (composant navigateur) : contrôle du rôle, onglet actif lié à `?tab=`. |
| `apps/site/common/components/StaffPageLayout/StaffPageLayout.tsx` | Mise en page commune de l'administration et de la modération (titre, onglets, contenu). |
| `apps/site/app/administration/actions.ts` | Actions serveur : `resetDatabase`, `searchCoaches`, `updateCoachRole`, `getAllRoles`, `createCustomRole`, `deleteCustomRole`, `reorderRoles`, `getForumStructure`, `createReferenceData`, `updateReferenceData`, `deleteReferenceData`, `getAllReferenceDataAdmin`, `getSiteSetting`, `updateSiteSetting`, `getHowToPlaySettings`, `updateHowToPlaySettings`, `sendGlobalInfoMail`. |
| `apps/site/app/administration/actionsStructure.ts` | Actions de la structure du forum : `getForumStructure`, `createCategory`, `updateCategory`, `deleteCategory`, `reorderCategories`, `createForum`, `updateForum`, `deleteForum`, `reorderForums`. |
| `apps/site/app/administration/component/*Tab.tsx` | Un fichier par onglet : `GeneralTab`, `RolesTab`, `CoachsTab`, `StructureTab`, `ReferenceDataTab`, `HowToPlayTab`, `InfoMailsTab`, `ResetTab`. Composants de `packages/ui`, plus de fichier CSS depuis la carte 099. |

Les changements de rôle sont tracés dans le journal de modération par `logModerationAction` (`lib/moderationLog.ts`).

## Les pièges

- Chaque action serveur vérifie elle-même la session (`getActiveSession()`) et le rôle (`getRolePower` ≥ `ROLE_POWER.ADMIN`, ou SUPERADMIN pour la remise à zéro). Ne jamais compter sur le contrôle de la page, qui se fait dans le navigateur.
- `resetDatabase` supprime messages, sujets, forums, tournois et **tous les membres sauf les Super Admins**, sur la base où tourne le site. Sur la production (vrais membres), c'est une suppression de données interdite sans accord exprès : la seule protection est la phrase de confirmation.
- Il n'y a plus d'onglet « Sauvegardes » : il téléchargeait l'ancien fichier SQLite `dev.db`, qui n'existe plus avec Postgres. Les sauvegardes se font sur Neon (branches et restauration à un instant passé, voir `DEPLOY.md`).
- Les puissances des rôles personnalisés sont en base (`RoleConfig`), mais `lib/roles.ts` ne connaît que les rôles de base : `getRolePower` donne les droits d'un coach à un rôle personnalisé, tandis que `lib/forumAccess.ts` lit sa vraie puissance pour l'accès au forum. Les deux restent cohérents parce qu'un rôle personnalisé est toujours sous Modérateur : `createCustomRole` le refuse au-dessus depuis la carte 051 (comme `reorderRoles` le faisait déjà). Il n'a donc jamais de droit de modération. Ne pas lever cette limite sans faire lire la base à `lib/roles.ts`.
- `updateCoachRole` n'exige que le rang modérateur (alors que la page exige admin) et n'empêche pas d'attribuer un nom de rôle inexistant ; le Super Admin passe outre les contrôles de rang.
- `sendGlobalInfoMail` envoie les mails un par un avec 500 ms d'attente : avec beaucoup de membres, l'appel peut dépasser la durée maximale d'une fonction sur Vercel (à vérifier). Il lit l'email par un `select` explicite, comme le veut l'omit global.
- `getForumStructure` existe en double (`actions.ts` et `actionsStructure.ts`). `resetDatabase` et `sendGlobalInfoMail` renvoient `{ success: false, error }` quand l'accès est refusé (carte 052).

## Les mots expliqués

| Mot | Sens |
|---|---|
| Puissance (*power*) | Nombre qui classe les rôles (Super Admin 100, Admin 90, Modérateur 70, RTC 50, Chef de ligue 40, Coach 10). On ne peut agir que sur un rôle plus faible que le sien. |
| Rôle personnalisé | Rôle créé dans l'onglet « Gestion des rôles » (table `RoleConfig`), placé entre les rôles de base, jamais au-dessus de Modérateur. |
| Données de référence | Listes de valeurs utilisées dans les formulaires (ex. les régions des coachs), modifiables sans code. |
| Réglage du site (`SiteSetting`) | Valeur stockée en base sous une clé (`discord_invite`, textes `how_to_play_*`). |
| Glisser-déposer | Réordonner des éléments en les faisant glisser (bibliothèque `@dnd-kit`). |

## État

- Fonctionne : tous les onglets, avec contrôle du rôle côté serveur dans chaque action.
- Manque : une sauvegarde qui marche en production depuis la page ; la prise en compte des rôles personnalisés dans `lib/roles.ts` ; une protection plus forte de la remise à zéro en production. Aucune carte ouverte ne porte sur ces points.
- Téléphone : refaite par la carte 099 ; tous les onglets sont vérifiés par `tests/e2e/inventaire/administration.spec.ts` (ordinateur et téléphone, glisser-déposer au clavier compris) et mesurés par l'audit mobile. Le glisser-déposer au doigt reste à essayer sur un vrai téléphone.
