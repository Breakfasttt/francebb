# Administration

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour à chaque carte qui touche la fonctionnalité (commande `/ship`). Environ 80 lignes au plus.

## À quoi ça sert

La page d'administration permet aux administrateurs de régler le site sans toucher au code : rôles des membres, structure du forum, listes de référence (régions…), textes du guide du débutant, lien Discord, annonces par email à tous les coachs. Le Super Admin y trouve en plus la sauvegarde de la base et la remise à zéro complète du site.

## Ce que voit le coach

- `/administration` : un titre, une colonne d'onglets à gauche et le contenu de l'onglet à droite. L'onglet ouvert est gardé dans l'adresse (`?tab=roles`), ce qui permet de partager un lien direct.
- Onglets : « Configuration » (lien d'invitation Discord), « Gestion des Rôles » (créer, supprimer, réordonner des rôles personnalisés par glisser-déposer), « Membres & Accès » (chercher un coach par pseudo et changer son rôle), « Structure Forum » (catégories, forums, sous-forums, rôles autorisés, ordre par glisser-déposer), « Données de Référence » (listes comme les régions), « Guide du Débutant » (textes de la page `/jouer`, lus sans connexion par `getHowToPlaySettings`), « Annonces Email » (mail envoyé à tous les membres non bannis).
- Super Admin seulement : « Sauvegardes (BDD) » (téléchargement de la base) et « Zone de Danger » (remise à zéro, protégée par la phrase « JE COMPRENDS LES RISQUES »).
- Accès : administrateur et Super Admin. Un visiteur est envoyé vers la connexion, un membre sans le rôle vers l'accueil. Cette vérification de la page se fait dans le navigateur ; la vraie protection est dans chaque action serveur.
- **Sur téléphone** : la colonne d'onglets est déplacée dans le menu latéral global (`AdminSidebar` + `MobilePortal` + `useIsMobile`), avec un séparateur avant les onglets Super Admin. `page-mobile.css` empile le contenu en une colonne sous 768 px. Les onglets s'adaptent par des styles en ligne qui dépendent de `useIsMobile` ; comme ce hook renvoie « ordinateur » au premier affichage, la mise en page peut sauter juste après le chargement (à vérifier). Le tableau des données de référence défile dans son propre cadre. Le glisser-déposer des rôles et de la structure utilise `PointerSensor` sans réglage tactile : il peut gêner le défilement au doigt (à vérifier). Entre 769 et 1024 px, le menu hamburger global est affiché mais la colonne reste en version ordinateur.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/app/administration/page.tsx` | Page (composant navigateur) : contrôle du rôle, onglet actif lié à `?tab=`. |
| `apps/site/app/administration/page.css`, `page-mobile.css` | Mise en page ordinateur et règles sous 768 px. |
| `apps/site/app/administration/actions.ts` | Actions serveur : `resetDatabase`, `searchCoaches`, `updateCoachRole`, `getAllRoles`, `createCustomRole`, `deleteCustomRole`, `reorderRoles`, `getForumStructure`, `createReferenceData`, `updateReferenceData`, `deleteReferenceData`, `getAllReferenceDataAdmin`, `getSiteSetting`, `updateSiteSetting`, `getHowToPlaySettings`, `updateHowToPlaySettings`, `sendGlobalInfoMail`. |
| `apps/site/app/administration/actionsStructure.ts` | Actions de la structure du forum : `getForumStructure`, `createCategory`, `updateCategory`, `deleteCategory`, `reorderCategories`, `createForum`, `updateForum`, `deleteForum`, `reorderForums`. |
| `apps/site/app/administration/component/AdminSidebar.tsx` | Colonne d'onglets (version ordinateur, ou portail vers le menu mobile). |
| `apps/site/app/administration/component/*Tab.tsx` | Un fichier par onglet : `GeneralTab`, `RolesTab`, `CoachsTab`, `StructureTab`, `ReferenceDataTab`, `HowToPlayTab`, `InfoMailsTab`, `ResetTab`. |

Les changements de rôle sont tracés dans le journal de modération par `logModerationAction` (`lib/moderationLog.ts`).

## Les pièges

- Chaque action serveur vérifie elle-même la session (`getActiveSession()`) et le rôle (`getRolePower` ≥ `ROLE_POWER.ADMIN`, ou SUPERADMIN pour la remise à zéro). Ne jamais compter sur le contrôle de la page, qui se fait dans le navigateur.
- `resetDatabase` supprime messages, sujets, forums, tournois et **tous les membres sauf les Super Admins**, sur la base où tourne le site. Sur la production (vrais membres), c'est une suppression de données interdite sans accord exprès : la seule protection est la phrase de confirmation.
- Il n'y a plus d'onglet « Sauvegardes » : il téléchargeait l'ancien fichier SQLite `dev.db`, qui n'existe plus avec Postgres. Les sauvegardes se font sur Neon (branches et restauration à un instant passé, voir `DEPLOY.md`).
- Les puissances des rôles personnalisés sont en base (`RoleConfig`), mais `lib/roles.ts` ne connaît que les rôles de base : `getRolePower` donne les droits d'un coach à un rôle personnalisé, tandis que `lib/forumAccess.ts` lit sa vraie puissance pour l'accès au forum. Les deux restent cohérents parce qu'un rôle personnalisé est toujours sous Modérateur : `createCustomRole` le refuse au-dessus depuis la carte 051 (comme `reorderRoles` le faisait déjà). Il n'a donc jamais de droit de modération. Ne pas lever cette limite sans faire lire la base à `lib/roles.ts`.
- `updateCoachRole` n'exige que le rang modérateur (alors que la page exige admin) et n'empêche pas d'attribuer un nom de rôle inexistant ; le Super Admin passe outre les contrôles de rang.
- `sendGlobalInfoMail` envoie les mails un par un avec 500 ms d'attente : avec beaucoup de membres, l'appel peut dépasser la durée maximale d'une fonction sur Vercel (à vérifier). Il lit l'email par un `select` explicite, comme le veut l'omit global.
- `getForumStructure` existe en double (`actions.ts` et `actionsStructure.ts`). `resetDatabase` et `sendGlobalInfoMail` lèvent encore une erreur (`throw`) au lieu de renvoyer `null`.

## Les mots expliqués

| Mot | Sens |
|---|---|
| Puissance (*power*) | Nombre qui classe les rôles (Super Admin 100, Admin 90, Modérateur 70, RTC 50, Chef de ligue 40, Coach 10). On ne peut agir que sur un rôle plus faible que le sien. |
| Rôle personnalisé | Rôle créé dans l'onglet « Gestion des Rôles » (table `RoleConfig`), placé entre les rôles de base, jamais au-dessus de Modérateur. |
| Données de référence | Listes de valeurs utilisées dans les formulaires (ex. les régions des coachs), modifiables sans code. |
| Réglage du site (`SiteSetting`) | Valeur stockée en base sous une clé (`discord_invite`, textes `how_to_play_*`). |
| Glisser-déposer | Réordonner des éléments en les faisant glisser (bibliothèque `@dnd-kit`). |

## État

- Fonctionne : tous les onglets, avec contrôle du rôle côté serveur dans chaque action.
- Manque : une sauvegarde qui marche en production depuis la page ; la prise en compte des rôles personnalisés dans `lib/roles.ts` ; une protection plus forte de la remise à zéro en production. Aucune carte ouverte ne porte sur ces points.
- Téléphone : à contrôler dans l'audit mobile (carte 049), en particulier le glisser-déposer et les sauts de mise en page.
