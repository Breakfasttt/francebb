---
id: 064
title: Erreurs lisibles sur les formulaires de création
epic: E03
app: site
depends_on: [052]
adr:
verify: scripts/debt-count.mjs ne compte plus de throw dans createForum, createTopic et createLigue ; une erreur de création s'affiche en notification (test e2e)
---

# 064 — Erreurs lisibles sur les formulaires de création

## Pourquoi

Reste de la carte 052. `createForum`, `createTopic` (7 `throw`) et `createLigue` (2 `throw`) sont branchées directement sur l'attribut `action` d'un formulaire. Une action utilisée ainsi ne peut pas renvoyer de réponse au formulaire : en cas d'erreur, elle lève une exception et le membre voit une page d'erreur au lieu d'un message clair.

## Action

- Pour chacun des trois formulaires, un petit composant côté navigateur appelle l'action, reçoit `{ success, error }` (type `ActionResult` de `lib/actionResult.ts`) et affiche l'erreur dans une notification, comme les autres formulaires depuis la carte 052.
- Remplacer les `throw` de ces trois actions par des retours `{ success: false, error }`, sans retirer aucun contrôle de droits.
- Un test e2e par formulaire au moins pour un cas d'erreur.
- Vérifier le formulaire sur téléphone (boutons de 44 pixels, champs en 16 pixels).

## Résultat

- `createForum`, `createTopic` et `createLigue` renvoient `{ success: false, error }` au lieu de lever une erreur (9 `throw` retirés). Chaque contrôle est resté à sa place, avant toute écriture : modérateur pour créer un forum, membre connecté, forum accessible et non verrouillé pour un sujet, date de début pour un tournoi. Après une réussite, la redirection d'origine est gardée (forum parent, nouveau sujet, nouvelle ligue). `createForum` refuse aussi un nom vide ou déjà pris : avant, la base refusait le doublon et le modérateur voyait une page d'erreur. Le message « Titre, contenu et forum sont obligatoires » ne contient plus de détails techniques.
- Nouveau composant `common/components/Form/ActionForm.tsx`, ajouté au skill `reuse-first` : il remplace `<form action={monAction}>`, envoie les champs à l'action, affiche son refus dans une notification et garde les champs remplis (un envoi classique les aurait vidés). Utilisé par les formulaires de création d'un forum, d'un sujet et d'une ligue. `TournamentForm`, qui appelle aussi `createTopic`, affiche maintenant son refus en notification.
- Téléphone : le bouton « Créer le sujet » (et les cases des modérateurs) était déplacé dans le menu latéral, donc hors du formulaire, et n'envoyait plus rien. La colonne « Publication » reste maintenant dans le formulaire, sous le message (`CreateTopicSidebar-mobile.css`). Sur la création de forum, les deux boutons côte à côte faisaient dépasser la carte de 52 pixels : ils sont l'un sous l'autre, et les champs passent en 16 pixels (styles déplacés dans `NewForumForm.css`). Sur la création de ligue, la recherche de commissaires passe en 16 pixels (`UserSearch-mobile.css`) et les petits textes du blason à 12 pixels. L'audit mobile mesure désormais ces trois pages : aucun contenu coupé, aucun champ sous 16 pixels, aucun bouton sous 44 pixels ; seules restent les deux cases à cocher des modérateurs (18 pixels), dont toute la ligne de 44 pixels réagit au toucher.
- Tests e2e (dans `smoke.spec.ts`, donc rejoués aussi en taille téléphone) : forum au nom déjà pris, sujet sans message, ligue sans nom ni acronyme (la notification s'affiche, on reste sur la page, la saisie est gardée), et arrivée sur le nouveau sujet après une création réussie.
- Dette (`scripts/debt-count.mjs`) : `throw` 15 → 6, `style={{` 1087 → 1076, fichiers « use client » 140 → 141 (le nouveau composant), `any` inchangés (349). ESLint : 840 erreurs, égal au plafond.
- Vérifications : `npx tsc --noEmit` sans erreur ; deux passages complets de la suite e2e réussis (voir la carte 067).
