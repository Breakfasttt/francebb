---
id: 200
title: "Forum : droits sur un sujet ou un message calculés à un seul endroit"
epic: E12
app: site
depends_on: []
verify: "les actions pin, archive, verrouillage et modération d'un sujet ou d'un message refusent un élément d'un forum auquel le membre n'a pas accès (test de comportement qui appelle l'action, pas une recherche de texte) ; TopicTools, PostMoreMenu et la page de réponse reçoivent les droits calculés par le serveur au lieu de les recalculer ; un sujet archivé n'affiche plus « Répondre » et un sujet fermé n'affiche plus « Modifier » ; corepack pnpm check et pnpm --filter @bbfrance/site test:parcours passent ; écran du sujet vérifié en 360 pixels de large"
---

# 200 — Forum : droits sur un sujet ou un message calculés à un seul endroit

## Pourquoi

Chaque action du forum (`app/forum/actions.ts`, 2150 lignes) recompose elle-même ses contrôles : chargement de l'élément, sujet fermé ou non, auteur ou modérateur. Les fonctions `writeState` (ligne 81) et `isLockedFor` (ligne 89) se contentent d'appeler `isTopicClosedFor`.

**Faille d'accès.** ARCHITECTURE.md impose que toute lecture du forum passe par `lib/forumAccess.ts`, qui filtre les forums réservés à certains rôles. Six actions de modération lisent pourtant l'élément par son seul identifiant, sans ce filtre, et ne vérifient que le rôle de modérateur :

- `moderatePost` (ligne 788) et `unmoderatePost` (825) ;
- `togglePinTopic` (997), `toggleArchiveTopic` (1248) ;
- `toggleForumLock` (1402), `toggleTopicLock` (1432).

Un modérateur peut donc épingler, archiver, verrouiller ou modérer dans un forum réservé aux administrateurs, en appelant l'action directement.

**L'écran recalcule la règle, et ses copies ont divergé :**

- `TopicTools.tsx:172` : `canReply` ignore l'archivage, alors que le serveur et `topic/[id]/page.tsx:250` en tiennent compte ;
- `PostMoreMenu.tsx:83` : `canEdit = isAuthor || isModerator` ignore le sujet fermé, alors que `updatePost` (725) et `deletePost` (871) refusent. Le bouton s'affiche, puis l'action échoue avec une notification d'erreur ;
- `topic/[id]/reply/page.tsx:58` recopie la condition en ligne.

Enfin, ces droits ne sont vérifiés que par des recherches de texte dans le code (`tests/e2e/security.spec.ts:26-47`).

## Action

- Créer dans `lib/` une fonction qui charge un sujet ou un message **via `forumAccess`** et renvoie ce que le membre peut faire (répondre, modifier, supprimer, réagir, modérer), avec la raison d'un refus. Elle reçoit le membre en paramètre.
- Faire passer par elle toutes les actions de `app/forum/actions.ts` qui lisent un sujet ou un message, en commençant par les six lectures sans filtre.
- Faire transmettre ces droits par la page du sujet à `TopicTools`, `PostItem`, `PostMoreMenu` et à la page de réponse, qui ne les recalculent plus.
- Remplacer les recherches de texte de `security.spec.ts` par des tests qui appellent les actions sans le droit (test unitaire si la carte 198 est faite, sinon test Playwright).
- Mettre à jour la fiche `forum` et, si besoin, la règle de `ARCHITECTURE.md`.
- Vérifier en 360 pixels de large que les boutons affichés correspondent aux droits (sujet archivé, sujet fermé, forum réservé).

## Résultat

Faille d'accès corrigée : les six actions de modération qui lisaient l'élément par son seul identifiant (`moderatePost`, `unmoderatePost`, `togglePinTopic`, `toggleArchiveTopic`, `toggleForumLock`, `toggleTopicLock`) le lisent maintenant à travers `forumAccessWhere` (`lib/forumAccess.ts`). Un élément d'un forum que le membre ne voit pas est traité comme introuvable. Un test de comportement est ajouté dans `tests/e2e/security.spec.ts` : un modérateur appuie sur « Épingler » dans un sujet qu'il voit, le test remplace l'identifiant envoyé au serveur par celui d'un sujet d'un forum réservé aux administrateurs, et vérifie le refus « Sujet introuvable. » et que rien n'a changé en base.

Droits calculés à un seul endroit : `lib/forumRights.ts` offre `canReplyToTopic` (membre connecté, sujet non supprimé, ni verrouillé, ni archivé, ni dans un forum verrouillé, sauf pour un modérateur) et `canEditPost` (un modérateur toujours, l'auteur tant que le sujet n'est pas fermé). Ces fonctions sont testées par `tests/unit/forumRights.test.mjs` (4 tests). Côté serveur, `createPost` et `updatePost` les appellent ; côté écran, la page du sujet les calcule une fois et les transmet à `TopicTools` (prop `canReply`), à `PostItem` puis `PostMoreMenu` (prop `canEdit`), et la page de réponse les utilise pour renvoyer un membre vers le sujet. Conséquences visibles : « Répondre » n'apparaît plus dans les outils d'un sujet archivé, et « Modifier » et « Supprimer » n'apparaissent plus sur ses propres messages dans un sujet fermé.

Les vérifications par recherche de texte de `security.spec.ts` sont adaptées (`canEditPost` pour `updatePost`, `canReplyToTopic` pour `createPost`) et complétées par le test de comportement ci-dessus. Les autres actions (`deletePost`, `togglePostReaction`, `moveTopic`…) passaient déjà par `findAccessiblePost` ou `topicAccessWhere` et gardent leurs gardes.

Non fait : toutes les actions de `app/forum/actions.ts` ne passent pas encore par une fonction unique de chargement (« charger via forumAccess et renvoyer les droits ») ; seules les six lectures sans filtre ont été corrigées, et les deux règles d'écriture partagées. Le reste relève du découpage plus large du fichier, en partie prévu par la carte 201 pour les tournois. Le test de sécurité, le test de parcours et la vérification à 360 pixels n'ont pas pu être lancés : le serveur de développement resté ouvert (PID 17136, 3,8 Go de mémoire) bloque tout autre serveur. `corepack pnpm check` passe.

À essayer à la main, connecté comme coach : dans un sujet archivé, l'outil « Répondre » a disparu ; dans un sujet verrouillé, le menu « ⋯ » de son propre message ne propose plus « Modifier » ni « Supprimer ». Comme modérateur, ces actions restent proposées.
