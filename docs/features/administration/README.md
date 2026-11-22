# Administration

> Fiche écrite pour quelqu'un qui découvre le projet : phrases simples, termes techniques expliqués. Tenue à jour en fin de gros chantier (commande `/ship`) ou quand le comportement visible change. Environ 80 lignes au plus.

## À quoi ça sert

La page d'administration permet aux administrateurs de régler le site sans toucher au code : rôles des membres, structure du forum, listes de référence (régions…), textes du guide du débutant, lien Discord, annonces par email aux coachs qui acceptent « Newsletter et annonces ».

## Ce que voit le coach

- `/administration` (refaite par la carte 099, ADR 0006) : un titre, les onglets et le contenu de l'onglet ouvert. Chaque onglet est un lien : l'onglet ouvert est gardé dans l'adresse (`?tab=roles`) ; une valeur inconnue ouvre « Configuration ».
- Onglets : « Configuration » (lien d'invitation Discord), « Gestion des rôles » (créer un rôle personnalisé avec identifiant, libellé et couleur, le supprimer, régler la hiérarchie en faisant glisser sa poignée), « Membres & accès » (chercher un coach par pseudo et changer son rôle, rôles affichés par leur libellé), « Structure du forum » (catégories, forums, sous-forums ; poignée pour l'ordre, menu « ⋯ » pour indenter, désindenter ou changer de catégorie, panneau « Modifier » pour le nom, la description, le rôle minimum d'accès et la suppression), « Données de référence » (listes comme les régions ; depuis la carte 221, chaque liste a un nom lisible, une phrase « Utilisé dans : … » et se replie, fermée par défaut ; le choix de la liste d'un nouvel élément se fait dans un menu), « Guide du débutant » (textes des six sections de la page `/jouer`, lus sans connexion par `getHowToPlaySettings`), « Annonces par e-mail » (voir ci-dessous), « Médias » (chaînes YouTube et Twitch de la page `/media` et de l'accueil : on colle l'adresse d'une chaîne, `youtube.com/@nom` suffit, le site retrouve son identifiant et son nom ; flèches pour l'ordre, corbeille pour retirer, puis « Enregistrer les chaînes », inscrit au journal ; actions dans `app/administration/mediaActions.ts`).
- **Annonces par e-mail** (cartes 167 et 221) : le mail part aux membres non bannis qui acceptent la préférence « Newsletter et annonces » de leur profil. Le texte s'écrit dans un simple champ : gras `[b]`, italique `[i]`, liens `[url]` et liens en `https://` sont gardés, les autres balises retirées (`lib/announcementMail.ts`). « M'envoyer un essai » l'envoie d'abord à l'admin seul (objet préfixé « [Essai] », rien au journal). « Diffuser aux coachs » ouvre une confirmation avec le vrai nombre de destinataires (« Envoyer à 42 coachs »), puis l'écran « Diffusion terminée » ne compte que les e-mails réellement partis.
- Il n'y a plus de remise à zéro du site depuis la carte 158 : ce bouton effaçait tout le site, protégé par une simple phrase, et pouvait être déclenché par un message piégé lu par un super administrateur (audit du 4 novembre 2026, section 2.5).
- Accès : administrateur et Super Admin. Un visiteur est envoyé vers la connexion, un membre sans le rôle vers l'accueil. Cette vérification de la page se fait dans le navigateur ; la vraie protection est dans chaque action serveur.
- **Sur téléphone** : une seule colonne ; une barre collée sous la barre du haut affiche l'onglet ouvert et ouvre un tiroir à gauche avec tous les onglets et leurs compteurs (`SectionDrawer`, novembre 2026 ; avant : une rangée qui défilait de côté, et avant la carte 099 le panneau « Plus »). Sur ordinateur, une colonne d'onglets à gauche. Mise en page commune avec la modération : `StaffPageLayout`. Les listes (rôles, membres, données de référence, structure) sont des fiches, plus de tableau qui défile de côté. Les poignées de glisser-déposer font 44 pixels et suivent le doigt sans faire défiler la page (`touch-action: none`) ; au clavier, Espace prend la poignée, les flèches déplacent, Espace pose. Les panneaux (modification d'un forum) et les confirmations montent du bas de l'écran.

## Les fichiers

| Fichier | Rôle |
|---|---|
| `apps/site/app/administration/page.tsx` | Page (composant navigateur) : contrôle du rôle, onglet actif lié à `?tab=`. |
| `apps/site/common/components/StaffPageLayout/StaffPageLayout.tsx` | Mise en page commune de l'administration et de la modération (titre, onglets, contenu). |
| `apps/site/app/administration/actions.ts` | Actions serveur : `searchCoaches`, `updateCoachRole`, `getAllRoles`, `createCustomRole`, `deleteCustomRole`, `reorderRoles`, `getForumStructure`, `createReferenceData`, `updateReferenceData`, `deleteReferenceData`, `getAllReferenceDataAdmin`, `getSiteSetting`, `updateSiteSetting`, `getHowToPlaySettings`, `updateHowToPlaySettings`, `sendGlobalInfoMail`, `countAnnouncementRecipients` et `sendTestAnnouncement` (carte 221, admin seulement). |
| `apps/site/lib/announcementMail.ts` | Corps HTML d'une annonce : texte neutralisé, puis gras, italique et liens http(s) seulement (`announcementBodyHtml`). Testé par `tests/unit/announcementMail.test.mjs`. |
| `apps/site/app/administration/actionsStructure.ts` | Actions de la structure du forum : `getForumStructure`, `createCategory`, `updateCategory`, `deleteCategory`, `reorderCategories`, `createForum`, `updateForum`, `deleteForum`, `reorderForums`. |
| `apps/site/app/administration/component/*Tab.tsx` | Un fichier par onglet : `GeneralTab`, `RolesTab`, `CoachsTab`, `StructureTab`, `ReferenceDataTab`, `HowToPlayTab`, `InfoMailsTab`. Composants de `packages/ui`, plus de fichier CSS depuis la carte 099. |

Les changements de rôle passent par `changeMemberRole` (`lib/memberRole.ts`, carte 221), partagé avec la liste des membres. Depuis la carte 221, toutes les actions de cette page sont inscrites au journal de modération par `logModerationAction` (`lib/moderationLog.ts`).

## Les pièges

- **Structure du forum, une seule implémentation (carte 199).** Créer, modifier et supprimer un forum passe par `lib/forumStructure.ts` (`createForumRecord`, `updateForumRecord`, `deleteForumRecord`), appelé par l'écran du forum (`app/forum/actions.ts`, modérateurs) et par l'onglet « Structure » de l'administration (`app/administration/actionsStructure.ts`, administrateurs). Les règles pures sont dans `lib/forumStructureRules.ts`, testées par `tests/unit/forumStructureRules.test.mjs` : nom unique, 5 sous-forums au plus, le forum « Les tournois » n'est ni renommé ni supprimé, il reste au moins un forum ouvert à tous, un forum qui a des sous-forums ou des sujets (supprimés compris) n'est pas supprimé. Chaque changement est noté au journal de modération (« Forum créé », « Forum modifié », « Forum supprimé ») et rafraîchit `/forum` et son cache `forum-categories` (`refreshForumStructure`). Ne pas réécrire ces règles dans une action : appeler ces fonctions. Les actions sur les catégories et l'ordre des forums rafraîchissent aussi `/forum` : avant la carte 199, un changement fait ici n'y apparaissait qu'au bout de 60 secondes.
- Chaque action serveur vérifie elle-même la session (`getActiveSession()`) et le rôle (`getRolePower` ≥ `ROLE_POWER.ADMIN`). Ne jamais compter sur le contrôle de la page, qui se fait dans le navigateur.
- Il n'y a plus d'onglet « Sauvegardes » : il téléchargeait l'ancien fichier SQLite `dev.db`, qui n'existe plus avec Postgres. Les sauvegardes se font sur Neon (branches et restauration à un instant passé, voir `DEPLOY.md`).
- Les puissances des rôles personnalisés sont en base (`RoleConfig`), mais `lib/roles.ts` ne connaît que les rôles de base : `getRolePower` donne les droits d'un coach à un rôle personnalisé, tandis que `lib/forumAccess.ts` lit sa vraie puissance pour l'accès au forum. Les deux restent cohérents parce qu'un rôle personnalisé est toujours sous Modérateur : `createCustomRole` le refuse au-dessus depuis la carte 051 (comme `reorderRoles` le faisait déjà). Il n'a donc jamais de droit de modération. Ne pas lever cette limite sans faire lire la base à `lib/roles.ts`.
- `updateCoachRole` et `updateUserRole` (liste des membres) appliquent la même règle depuis la carte 221 : `roleChangeRefusal` (`lib/roles.ts`, testé par `tests/unit/roles.test.mjs`). Il faut être modérateur ou plus, le rôle doit exister dans `RoleConfig`, personne ne change son propre rôle, et sauf Super Admin la cible et le nouveau rôle sont sous son rang. L'onglet reste réservé aux admins, mais l'action accepte un modérateur, comme `/membres`.
- **Réglages limités (carte 221).** `getSiteSetting` et `updateSiteSetting` n'acceptent que la clé `discord_invite`, et `updateHowToPlaySettings` que les six clés `how_to_play_*` ; chaque texte compte 20 000 caractères au plus. Avant, une clé quelconque pouvait écraser un autre réglage (textes de `/jouer`, repère `devProfile` de la base).
- Les actions sur les catégories passent par `adminSession()` et vérifient que l'accès choisi est `ALL` ou un rôle existant (carte 221).
- `sendGlobalInfoMail` envoie les mails un par un avec 500 ms d'attente : avec beaucoup de membres, l'appel peut dépasser la durée maximale d'une fonction sur Vercel (à vérifier). Il lit l'email par un `select` explicite, comme le veut l'omit global.
- `sendGlobalInfoMail` renvoie `{ success: false, error }` quand l'accès est refusé (carte 052). Le compte et l'envoi utilisent le même filtre de destinataires (`ANNOUNCEMENT_RECIPIENTS_WHERE`) : le nombre annoncé est celui qui part.
- Le texte d'une annonce est neutralisé **avant** la conversion du BBCode, et un lien qui n'est pas en http(s) perd son lien : ne pas inverser cet ordre dans `announcementBodyHtml`.

## Les mots expliqués

| Mot | Sens |
|---|---|
| Puissance (*power*) | Nombre qui classe les rôles (Super Admin 100, Admin 90, Modérateur 70, RTC 50, Chef de ligue 40, Coach 10). On ne peut agir que sur un rôle plus faible que le sien. |
| Rôle personnalisé | Rôle créé dans l'onglet « Gestion des rôles » (table `RoleConfig`), placé entre les rôles de base, jamais au-dessus de Modérateur. |
| Données de référence | Listes de valeurs utilisées dans les formulaires (ex. les régions des coachs), modifiables sans code. |
| Réglage du site (`SiteSetting`) | Valeur stockée en base sous une clé (`discord_invite`, textes `how_to_play_*`). |
| Glisser-déposer | Réordonner des éléments en les faisant glisser (bibliothèque `@dnd-kit`). |

## Interactions

**Elle agit sur**

| Fonctionnalité | Endroit | Effet |
|---|---|---|
| Rôles et droits | « Gestion des rôles », « Membres & accès » | Un rôle change ce que le membre voit et peut faire partout. Supprimer un rôle personnalisé repasse ses membres en Coach. |
| Forum | « Structure du forum » | Catégories, forums, accès (`allowedRoles`) ; `/forum` est rafraîchi tout de suite. |
| Formulaires du site | « Données de référence » | Régions, départements, éditions, plateformes, types de tournoi proposés dans les formulaires (tournois, ligues, profil). |
| Accueil | Réglage `discord_invite` | Lien d'invitation Discord de l'accueil. |
| Page « Jouer » | « Guide du débutant » | Textes des six sections de `/jouer`. |
| Membres | « Annonces par e-mail » | E-mail aux membres non bannis qui acceptent « Newsletter et annonces ». |
| Journal de modération | Toutes les actions | Chaque changement y est inscrit (carte 221). |

**Elle dépend de**

| Fonctionnalité | Endroit | Effet |
|---|---|---|
| Rôles | `lib/roles.ts` | Admin et au-dessus (changement de rôle : modérateur et au-dessus). |
| Profil | Préférence `notifNewsletter` | Choisit qui reçoit les annonces. |

Vue d'ensemble : [../INTERACTIONS.md](../INTERACTIONS.md).

## État

- Fonctionne : tous les onglets, avec contrôle du rôle côté serveur dans chaque action. Carte 221 : une seule règle de changement de rôle, réglages limités aux clés prévues, journal de toutes les actions, testés par `tests/e2e/permissions.spec.ts`.
- Manque : une sauvegarde qui marche en production depuis la page ; la prise en compte des rôles personnalisés dans `lib/roles.ts`. Aucune carte ouverte ne porte sur ces points.
- Téléphone : refaite par la carte 099 ; tous les onglets sont vérifiés par `tests/e2e/inventaire/administration.spec.ts` (ordinateur et téléphone, glisser-déposer au clavier compris) et mesurés par l'audit mobile. Le glisser-déposer au doigt reste à essayer sur un vrai téléphone.
