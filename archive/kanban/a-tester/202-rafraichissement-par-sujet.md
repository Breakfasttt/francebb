---
id: 202
title: "Rafraîchissement des pages : une fonction par sujet modifié"
epic: E12
app: site
depends_on: [199, 200, 201]
adr: 0005
verify: "les actions du forum et des tournois rafraîchissent les pages via quelques fonctions (sujet modifié, tournoi modifié, structure du forum modifiée) au lieu de listes d'adresses recopiées ; annuler, terminer, restaurer, créer ou modifier un tournoi met à jour l'accueil immédiatement ; corepack pnpm check et pnpm --filter @bbfrance/site test:parcours passent"
---

# 202 — Rafraîchissement des pages : une fonction par sujet modifié

## Pourquoi

Après un changement, Next.js doit savoir quelles pages reconstruire : c'est le rôle de `revalidatePath` (une adresse) et de `updateTag` (un cache nommé). Aujourd'hui, chaque action écrit sa propre liste :

- 47 appels à `revalidatePath` dans `app/forum/actions.ts` et 17 dans `app/tournois/actions.ts` ;
- deux fonctions qui font presque la même chose : `revalidateTopicLists` (`app/forum/actions.ts:1039-1047`) et `revalidateTopics` (`app/forum/topicSplitMergeActions.ts:56-64`) ;
- le cache de l'accueil `home-tournaments` (`app/page.tsx:48`) n'est vidé que par la suppression, la restauration et la fusion de sujets. Créer, modifier, annuler, terminer ou restaurer un tournoi ne le vide pas : l'accueil peut montrer un tournoi annulé pendant 60 secondes.

Savoir quelles pages affichent un sujet ou un tournoi est donc réparti dans une soixantaine d'appels.

## Action

- Créer dans `lib/` quelques fonctions de rafraîchissement, une par sujet modifié : sujet du forum, tournoi, structure du forum. Chacune connaît les adresses et les caches concernés.
- Les faire appeler par les fichiers créés aux cartes 199, 200 et 201, puis par les actions restantes ; supprimer `revalidateTopicLists` et `revalidateTopics` une fois sans appelant.
- Garder le cache `unstable_cache` actuel, conformément à l'ADR-0005 (pas de `use cache`).
- Mettre à jour les fiches `forum` et `tournois` (section « Les pièges » : où ajouter une page qui affiche un tournoi).

## Résultat

`lib/pageRefresh.ts` regroupe trois fonctions, une par sujet modifié, qui seules savent quelles pages et quels caches rafraîchir :

- `refreshTopic({ id, forumIds, isTournament })` : la page du sujet, ses forums (l'ancien et le nouveau après un déplacement), la liste des forums et son cache `forum-categories`, les non-lus ; pour un sujet de tournoi, aussi les listes de tournois ;
- `refreshTournament({ id, topicId, affectsRanking })` : le sujet, les pages de résultats, `/tournois`, `/carte`, l'accueil et son cache `home-tournaments`, et `/classement` quand les résultats comptent ;
- `refreshForumStructure(parentForumId)` : la liste des forums et son cache, le forum parent, l'administration (déplacée de `lib/forumStructure.ts`, carte 199).

Elles sont appelées par : les sept actions de `app/tournois/actions.ts` (terminer, rouvrir, annuler, rétablir, enregistrer et vider les résultats, validation CDF) ; dans `app/forum/actions.ts`, la création d'un sujet (avec son tournoi), la publication et la suppression d'un message, le déplacement, l'archivage, la suppression, la restauration et le verrouillage d'un sujet, le verrouillage d'un forum, la modification d'un tournoi, les inscriptions, désinscriptions, mercenaires, équipes et l'ouverture ou la fermeture des inscriptions ; la scission et la fusion de sujets. `revalidateTopicLists` (`app/forum/actions.ts`) et `revalidateTopics` (`app/forum/topicSplitMergeActions.ts`) sont supprimées.

Conséquences visibles : créer, modifier, terminer, annuler ou rétablir un tournoi, ou une inscription qui change le nombre de places, met à jour l'accueil tout de suite ; un message publié met aussi à jour la liste des forums (dernier message). Le cache `unstable_cache` est gardé (ADR-0005).

Restent écrits en direct 14 rafraîchissements qui ne concernent que la page d'un sujet (réaction, abonnement, titre, épinglage, modération d'un message, statut d'une inscription, lecture). Fiches `forum` et `tournois` à jour (section « Les pièges » : où ajouter une page qui affiche un sujet ou un tournoi). `corepack pnpm check` passe. Le test de parcours n'a pas pu être lancé (serveur de développement PID 17136 resté ouvert).

À essayer à la main : annuler un tournoi à venir, puis ouvrir l'accueil : il n'apparaît plus dans les prochains tournois (ou apparaît comme annulé) sans attendre une minute.
