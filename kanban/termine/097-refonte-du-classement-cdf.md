---
id: 097
title: "Refonte du classement CDF"
epic: E08
app: site
depends_on: [082, 084]
adr: 0006
verify: section 12 de docs/refonte/inventaire.md cochée ; test d'inventaire vert en projets chromium et telephone ; mobile-audit vert ; validé par le user sur son téléphone
---

# 097 — Refonte du classement CDF

## Pourquoi

Refaire le classement du Championnat de France et l'éditeur d'archives selon l'ADR 0006, sans perdre aucune des fonctionnalités listées dans la section 12 de `docs/refonte/inventaire.md`.

## Action

- Écrire d'abord le test d'inventaire de la section 12 dans `apps/site/tests/e2e/inventaire/`, et le faire passer sur la version actuelle.
- Tableau de classement lisible sur téléphone sans défilement horizontal de la page : les colonnes secondaires passent dans la ligne dépliée.
- Supprimer les fichiers `page.css` et `page-mobile.css` devenus inutiles, et utiliser les composants de `packages/ui`.
- La section de l'inventaire est vérifiée par son test d'inventaire, écrit avant la refonte de l'écran et passé sans modification après, en taille ordinateur et en taille téléphone.

## Résultat

**Ce qui a été fait.** `/classement` et l'éditeur d'archives `/classement/edit-archive` utilisent maintenant les composants et les couleurs v2 de `packages/ui`. Les adresses, les paramètres (`?year=`, `?importYear=`), les données enregistrées et les actions serveur n'ont pas changé.
- **`/classement`** : en-tête compact « Championnat de France » avec le bouton « Comment sont calculés les points ? » (fenêtre d'aide « Calcul des points CDF », panneau du bas sur téléphone). Les cinq vues sont de vrais onglets (Année, Glissant, Par roster, Hall of Fame, Archives) ; sur téléphone, la rangée d'onglets défile de côté. Une phrase rappelle ce que montre la liste ; une liste déroulante libellée choisit une autre année calculée ou une autre archive. Le classement est un tableau : rang, coach et points toujours visibles ; numéro NAF et nombre de tournois en colonnes sur ordinateur seulement. Le bouton « Détails de … » (flèche de 44 pixels, attribut `aria-expanded`) déplie la ligne : NAF, tournois joués, « Voir le profil » et les meilleurs tournois retenus (nom avec lien vers le sujet, place « 1er sur 24 », points). Avant, ce détail était toujours affiché en grandes cartes. Par roster : une carte par roster avec son meilleur coach. Hall of Fame : une carte par année avec le podium. Pendant un chargement, des lignes grises ; sans résultat, un message vide.
- **Actions de la modération** : rangées dans le menu « Gestion du classement » (panneau du bas sur téléphone), avec les mêmes conditions qu'avant : « Archiver l'année … » sur une année calculée, « Modifier l'archive » et, pour un administrateur, « Supprimer l'archive » sur une archive, « Importer des archives » et « Créer une archive » sur l'onglet Archives. Les confirmations passent par `ConfirmDialog` (archivage ; suppression en deux étapes). La fenêtre `confirm()` du navigateur, qui demandait s'il fallait écraser une année déjà présente lors d'un import, est remplacée par `ConfirmDialog` ; l'action est la même (ouvrir l'éditeur avec les données importées).
- **Éditeur d'archives** : écran de saisie plein écran sur téléphone (`ComposeScreen`, ajouté à `isComposePath`), en blocs : « L'archive » (année, nom) et « Classement » (une carte par coach sur téléphone, une ligne par coach sur ordinateur, avec des champs libellés), « Ajouter un coach », le détail des 4 tournois retenus derrière la flèche de chaque ligne, « Supprimer la ligne de … ». « Annuler » et « Enregistrer » sont collés en bas de l'écran sur téléphone, dans une colonne « Publication » sur ordinateur.
- **Deux défauts de l'éditeur corrigés en le réécrivant** : lier un membre à une ligne ne l'enregistrait jamais (les changements de la ligne s'écrasaient l'un l'autre), et le numéro NAF du membre n'était jamais recopié (la recherche des membres ne le renvoie pas : il est maintenant pris dans la liste complète des membres) ; après « Enregistrer », la page restait sur l'éditeur (l'appel `router.refresh()` annulait le retour au classement).
- Supprimés : `app/classement/page.css`, `page-mobile.css`, `edit-archive/page.css`, `edit-archive/page-mobile.css` (plus importés nulle part ; les quelques classes génériques qu'ils définissaient, comme `.loader-container` ou `.icon-btn`, n'étaient pas utilisées ailleurs avec ce style, sauf `.loader-container` de `/bbscheme`, qui ne recevait ce style que si l'on était passé par le classement avant).

**Fichiers.**
- Nouveaux : `apps/site/app/classement/component/RankingViews.tsx`, `apps/site/tests/e2e/inventaire/classement.spec.ts`.
- Refaits : `app/classement/page.tsx`, `app/classement/edit-archive/page.tsx`, `app/classement/edit-archive/ArchiveEditor.tsx`.
- Modifiés : `common/components/AppShell/navItems.ts`, `tests/e2e/mobile-audit.spec.ts`, `lint-baseline.json`, `docs/refonte/inventaire.md`, `docs/features/classement-statistiques/README.md`, `docs/GLOSSAIRE.md`.
- Supprimés : les quatre fichiers CSS ci-dessus.

**Ce qui est vérifié.**
- `tests/e2e/inventaire/classement.spec.ts` (6 tests : visiteur, membre, modérateur, administrateur, modification et création d'une archive) a été écrit avant la refonte ; l'ancienne version a seulement reçu des noms accessibles (listes « Choisir l'année » et « Choisir une archive », « Voir le profil de … », libellés des champs de l'éditeur et de ses boutons). Il passait sur l'ancienne version : 12 sur 12 (ordinateur et téléphone). Sur la nouvelle, sans aucune modification du test : 12 sur 12, puis 24 sur 24 en le rejouant deux fois.
- `classement`, `coquille` et `smoke` sur les deux tailles : 71 sur 71.
- `npx tsc --noEmit` sans erreur ; ESLint du site en baisse, plafond abaissé de 482 à 449.
- Audit mobile (`/classement` avec une archive, éditeur d'archives, ajoutés à `mobile-audit.spec.ts`) à 360 et 390 pixels : rien de coupé, aucun champ sous 16 pixels ; restent seulement le logo et les libellés de la barre du bas (coquille), comme sur les autres pages.
- Captures relues à 360, 390 et 1280 pixels en Vestiaire et en Saison 3, puis supprimées. Corrigés après relecture : le bouton « Gestion » poussé hors de l'écran à 360 pixels (le libellé de l'aide passe sur deux lignes), les tournois retenus en grandes cartes (devenus une liste compacte), « 1e » au lieu de « 1er », le champ de recherche de membre qui débordait sur la colonne NAF une fois un membre choisi (il passe dessous), le nom du membre choisi en 11 pixels.

**Choix à valider par le responsable.** Actions de la modération dans un menu « Gestion » plutôt qu'en boutons visibles ; détail des tournois replié par défaut ; onglets qui défilent de côté sur téléphone ; pas de pagination (tout le classement s'affiche, comme avant).

**À essayer à la main sur son téléphone.**
- `/classement` : passer d'un onglet à l'autre, choisir une autre année puis une archive, déplier une ligne et ouvrir un tournoi, puis le profil d'un coach ; ouvrir « Comment sont calculés les points ? ».
- En modérateur : « Gestion », « Archiver l'année » puis « Annuler » ; sur une archive, « Gestion », « Modifier l'archive » : ajouter un coach, lier un membre (son numéro NAF doit se remplir si le champ est vide), ouvrir le détail des tournois, « Enregistrer » depuis la barre du bas et vérifier le retour au classement et le membre lié.
- « Importer des archives » avec une vraie année (appel réel à l'ancien site, non testé automatiquement), y compris une année déjà présente pour voir la nouvelle confirmation.

**Remarques (hors carte, non corrigées).**
- `app/classement/actions.ts` : `fetchLegacyRanking` est appelé deux fois lors d'un import (une fois pour vérifier, une seconde fois par la page de l'éditeur), et `getRanking` écrit des messages `console.log` à chaque appel.
- Le classement « Par roster » porte toujours sur l'année civile en cours, même quand l'onglet Année affiche une autre année.
- Le composant historique `UserMapper` (aussi utilisé par la saisie des résultats d'un tournoi) a un champ de recherche qui ne rétrécit pas : il peut déborder à côté d'un membre choisi dans une colonne étroite. Corrigé localement dans l'éditeur d'archives seulement.
