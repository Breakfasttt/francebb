---
id: 162
title: "Tournois CDF réservés à la modération, résultats validés"
epic: E10
app: site
depends_on: []
verify: "un simple membre ne voit plus la case CDF et le serveur la refuse ; les résultats d'un tournoi CDF ne comptent au classement qu'après validation par un modérateur ou un administrateur ; pnpm check passe"
---

# 162 — Tournois CDF réservés à la modération, résultats validés

## Pourquoi

N'importe quel membre peut créer un tournoi « CDF » et y saisir des résultats inventés, qui comptent au classement national (audit, section 2.3). Décision du responsable : ce sont les modérateurs et les administrateurs qui accréditent.

## Action

1. La case « Tournoi CDF » n'est affichée et acceptée par le serveur (création et modification) que pour un modérateur ou un administrateur.
2. Nouveau champ `cdfValidatedAt` (date de validation) et `cdfValidatedById` sur le tournoi. `getRanking` ne compte que les tournois CDF validés, terminés et non annulés.
3. Un bouton « Valider les résultats CDF » pour la modération, sur la page des résultats.
4. Migration : les tournois CDF déjà terminés restent à valider (ils ne comptent plus tant qu'un modérateur ne les a pas validés).
5. Au passage : un rang vide est refusé (au lieu de donner les points du vainqueur), et le nombre de rondes saisies est utilisé quand il existe.

## Résultat

La case « CDF » du formulaire de tournoi n'est plus affichée qu'aux modérateurs et aux administrateurs ; un autre membre lit une phrase qui l'invite à leur demander. Côté serveur, `createTopic` refuse la case envoyée par un membre ordinaire, et `updateTournament` garde le statut CDF existant quand ce n'est pas la modération qui enregistre (`app/forum/actions.ts`, `TournamentForm.tsx`, pages de création et de modification). Le test d'inventaire `tests/e2e/inventaire/tournois.spec.ts` vérifie désormais que la case est absente pour un simple membre.

Le tournoi a deux nouveaux champs, `cdfValidatedAt` (date de validation) et `cdfValidatedById` (le modérateur, vidé si son compte est supprimé). La migration `20261104150000_cdf_validation` ajoute ces deux colonnes, sans rien supprimer : tous les tournois CDF déjà terminés sont donc en attente de validation. `getRanking` et `getRankingYears` ne comptent que les tournois CDF terminés, non annulés et validés ; le test `tests/e2e/inventaire/classement.spec.ts` crée donc des tournois déjà validés.

La nouvelle action serveur `setCdfValidation` (`app/tournois/actions.ts`) valide ou retire la validation. Elle vérifie le rôle lu en base via la session et écrit au journal de modération (« Résultats CDF validés », « Validation CDF retirée »). Le bandeau `CdfValidationPanel` l'affiche dans le bloc « Résultats du tournoi » du sujet et sur `/results/view` : « Résultats en attente de validation par la modération » ou « Résultats validés par la modération le … », avec le bouton pour la modération (44 pixels de haut, toute la largeur sur téléphone). Republier ou vider les résultats retire la validation.

Pour un tournoi CDF, un coach sans rang est refusé à l'enregistrement, et le nombre de rondes du calcul des points est celui de la fiche, sinon celui des rondes saisies, sinon 3 par jour (`cdfRoundsCount` et `isValidRank` dans `common/utils/cdf.ts`, partagés avec l'éditeur, testés par `tests/unit/rankingCoach.test.mjs`).

Vérifications : `corepack pnpm check` passe ; la migration a été appliquée à la base locale ; un script ponctuel sur la base locale a montré qu'un tournoi non validé ne compte pas et qu'il compte une fois validé. Le bandeau n'a pas été regardé dans un navigateur : à vérifier en taille téléphone avec `pnpm --filter @bbfrance/site test:parcours` ou à l'œil.
