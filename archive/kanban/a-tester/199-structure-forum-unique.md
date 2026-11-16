---
id: 199
title: "Structure du forum : une seule façon de créer et de supprimer un forum"
epic: E12
app: site
depends_on: []
verify: "createForum, updateForum et deleteForum n'ont plus qu'une implémentation, dans lib/, appelée par l'écran du forum et par l'onglet Structure de l'administration ; un modérateur ne peut plus supprimer le forum « Les tournois » ni le dernier forum public depuis l'écran du forum ; une modification dans l'administration apparaît tout de suite sur /forum ; getForumStructure d'administration/actions.ts est supprimée ; corepack pnpm check et pnpm --filter @bbfrance/site test:parcours passent ; écrans vérifiés en 360 pixels de large"
---

# 199 — Structure du forum : une seule façon de créer et de supprimer un forum

## Pourquoi

Il existe deux implémentations de la création et de la suppression d'un forum, qui ont divergé :

- celle de l'écran du forum : `app/forum/actions.ts:259` (`createForum`) et `:398` (`deleteForum`) ;
- celle de l'onglet Structure de l'administration : `app/administration/actionsStructure.ts:109` (`createForum`), `:140` (`updateForum`) et `:169` (`deleteForum`).

| Règle | Écran du forum | Administration |
|---|---|---|
| Rôle requis | modérateur | administrateur |
| Nom unique à la création | vérifié | non vérifié |
| Place du nouveau forum | après le forum choisi | à la fin |
| Rôles autorisés à la création | non posés | posés |
| Forum protégé « Les tournois » | non protégé | protégé (`PROTECTED_FORUM_NAME`, ligne 107) |
| Dernier forum public | non protégé | protégé |
| Sous-forums à la suppression | supprimés avec le parent | refus |
| Journal de modération | oui | non |
| Rafraîchissement des pages et du cache | oui | non |

Le commentaire de `app/forum/actions.ts:396` affirme que c'est « la même règle » que `actionsStructure.ts` : c'est faux. Conséquences constatées :

- depuis l'écran du forum, un modérateur peut supprimer le forum « Les tournois » s'il est vide, ou le dernier forum public ;
- après une modification dans l'administration, la liste des forums (`app/forum/page.tsx:57`, cache `forum-categories`) n'est pas rafraîchie : il faut attendre 60 secondes ;
- `getForumStructure` d'`app/administration/actions.ts:245` est une action publique que personne n'appelle (`StructureTab.tsx:28` importe celle d'`actionsStructure.ts`) ;
- l'arbre des forums n'est pas typé : sept désactivations de la règle `no-explicit-any` dans `StructureTab.tsx`.

## Action

- Créer un fichier de `lib/` qui porte toutes les règles de la structure du forum : nom unique, 5 sous-forums au plus, forum protégé, au moins un forum public, sujets supprimés, journal, rafraîchissement des pages et du cache. Il reçoit le membre en paramètre (règle posée par la carte 198, si elle est déjà faite).
- Faire appeler ce fichier par les deux écrans, chacun gardant son niveau de rôle : décider avec le user si l'écran du forum reste ouvert aux modérateurs.
- Décider avec le user du comportement pour les sous-forums à la suppression (refus ou suppression en cascade).
- Typer l'arbre des forums et retirer les `any` de `StructureTab.tsx`.
- Supprimer `getForumStructure` d'`administration/actions.ts` après avoir vérifié qu'elle n'a aucun appelant.
- Tester les règles (forum protégé, dernier forum public, nom unique) ; mettre à jour les fiches `forum` et `administration`.
- Vérifier en 360 pixels de large les écrans de création et de suppression.

## Résultat

Décisions prises sans attendre le user, qui avait demandé d'avancer en autonomie : l'écran du forum reste ouvert aux modérateurs et l'administration aux administrateurs (comme avant) ; un forum qui a des sous-forums n'est plus supprimé en cascade, il est refusé avec le message « Ce forum contient N sous-forum(s). Supprimez-les ou déplacez-les d'abord. » (choix sans perte de données, réversible).

`lib/forumStructure.ts` porte maintenant la création, la modification et la suppression d'un forum (`createForumRecord`, `updateForumRecord`, `deleteForumRecord`), avec le membre qui agit en paramètre (règle de la carte 198). Les règles pures sont dans `lib/forumStructureRules.ts` : nom obligatoire et unique (à la création comme au renommage), forum rattaché à une catégorie ou à un forum parent, 5 sous-forums au plus, forum « Les tournois » ni renommé ni supprimé, au moins un forum ouvert à tous, forum non vide refusé (sous-forums, sujets, sujets supprimés). Elles sont vérifiées par `tests/unit/forumStructureRules.test.mjs` (6 tests). Chaque changement est noté au journal de modération (nouvelle entrée « Forum modifié ») et rafraîchit `/forum`, son cache `forum-categories`, le forum parent et l'administration (`refreshForumStructure`). Le nouveau forum se place après celui choisi, en tête avec « START », ou à la fin de son niveau ; le décalage des forums suivants ne touche plus que les forums du même niveau.

Les actions `createForum` et `deleteForum` de l'écran du forum, et `createForum`, `updateForum`, `deleteForum` de l'administration, ne gardent que le contrôle du rôle et appellent ces fonctions. L'écran du forum vérifie en plus que le forum à supprimer est visible par le modérateur (`forumAccessWhere`) : un forum réservé aux administrateurs lui reste fermé. Les actions sur les catégories et sur l'ordre des forums rafraîchissent aussi `/forum`. `getForumStructure` d'`administration/actions.ts`, sans appelant, est supprimée ; celle d'`actionsStructure.ts` lit l'arbre avec `readForumStructure`.

L'arbre de l'onglet « Structure » est typé (`StructureCategory`, `StructureForum`) : `StructureTab.tsx` n'a plus aucun `any` ni désactivation de la règle `no-explicit-any`.

Le test de bout en bout `forum-listes.spec.ts` attend maintenant le refus « contient 1 sous-forum », puis efface le sous-forum avant de supprimer le forum ; il n'a pas été lancé. `corepack pnpm check` passe (123 tests unitaires). Fiches `forum` et `administration` à jour.

Non fait : le test de parcours et la vérification à 360 pixels des écrans de création et de suppression. Le serveur de développement resté ouvert (PID 17136) bloque le lancement d'un autre serveur.

À essayer à la main : depuis `/forum`, créer un forum puis le supprimer ; essayer de supprimer « Les tournois » (refus) ; dans l'administration, renommer un forum et vérifier que `/forum` affiche le nouveau nom tout de suite.
