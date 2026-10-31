---
id: 096
title: "Refonte des ressources"
epic: E08
app: site
depends_on: [082, 084]
adr: 0006
verify: section 11 de docs/refonte/inventaire.md cochée ; test d'inventaire vert en projets chromium et telephone ; mobile-audit vert ; validé par le user sur son téléphone
---

# 096 — Refonte des ressources

## Pourquoi

Refaire la liste des ressources et les formulaires de ressource selon l'ADR 0006, sans perdre aucune des fonctionnalités listées dans la section 11 de `docs/refonte/inventaire.md`.

## Action

- Écrire d'abord le test d'inventaire de la section 11 dans `apps/site/tests/e2e/inventaire/`, et le faire passer sur la version actuelle.
- Supprimer les fichiers `page.css` et `page-mobile.css` devenus inutiles, et utiliser les composants de `packages/ui`.
- La section de l'inventaire est vérifiée par son test d'inventaire, écrit avant la refonte de l'écran et passé sans modification après, en taille ordinateur et en taille téléphone.

## Résultat

**Ce qui a été fait.** `/ressources`, la proposition d'une ressource et sa modification utilisent maintenant les composants et les couleurs v2 de `packages/ui`. Les adresses, les champs envoyés (`title`, `description`, `link`, `imageUrl`, `tags`) et les actions serveur n'ont pas changé. La liste reste chargée dans la page par `getResources` : la recherche, les tags, l'affichage et la page ne sont toujours pas écrits dans l'adresse.
- **`/ressources`** : en-tête « Ressources » avec le nombre de ressources trouvées et le bouton « Soumettre une ressource » (« Soumettre » sur un petit téléphone). Barre au-dessus des résultats sur le modèle de `/articles` : recherche dans le titre et la description (lancée 300 millisecondes après la dernière touche), bouton « Filtres » sur téléphone, grille ou liste en deux boutons de 44 pixels. Le filtre par tags est dans la colonne « Filtres » sur ordinateur et dans le panneau « Filtrer les ressources » sur téléphone ; ses suggestions sont maintenant remplies (avant, la liste des tags proposés était vide) ; chaque tag choisi est rappelé en pastille avec une croix. Pendant un chargement, des cartes grises remplacent les résultats, comme la roue de chargement d'avant. Chaque carte ou ligne est entièrement cliquable ; badge « Officiel » et cadre de couleur pour les outils du site ; destination du lien (« example.com » ou « Sur BBFrance »). Sur un petit téléphone, l'image passe en vignette à gauche, pour voir plusieurs ressources par écran. Pagination compacte `PageNav` (boutons, la page n'étant pas dans l'adresse).
- **« Éditer » et « Supprimer »** : dans le menu « ⋯ » de chaque ressource (« Actions de la ressource … »), panneau du bas sur téléphone. Avant, ces deux boutons de 26 à 32 pixels n'apparaissaient qu'au survol de la souris, donc jamais sur téléphone. La suppression passe par `ConfirmDialog` (avant : `ConfirmModal`). Les droits sont ceux d'avant.
- **Proposition et modification** : un seul formulaire `ResourceForm` en blocs (la ressource, l'image, le classement) dans `ComposeScreen` : plein écran sur téléphone, sans barre du bas, « Annuler » et « Soumettre » ou « Mettre à jour » collés en bas ; colonne « Publication » sur ordinateur, qui rappelle la validation par la modération. Compteur « N / 200 caractères » sous la description ; aperçu de l'image, « Envoyer une image » (ou « Changer l'image ») et « Retirer l'image ». Pour un outil officiel, le titre et le lien sont en lecture seule et les tags affichés sans pouvoir être changés. La page de modification est devenue une page serveur ; quelqu'un sans droit voit toujours « Action non autorisée ». `isComposePath` connaît `/ressources/submit` et `/ressources/edit/[id]`. « Annuler » mène à la liste (avant : page précédente).
- **`MobileFilterWrapper` supprimé** : `/ressources` était sa dernière page. Supprimés aussi : son CSS et la règle `.mobile-filter-fab` de `AppShell.css` (aucune autre règle `.mobile-filter-*` n'existait, ni dans `globals-mobile.css`). `mobile-audit.spec.ts` ouvre maintenant les filtres par le seul bouton « Filtres ». Skills `mobile-ux` et `reuse-first` et glossaire mis à jour.

**Fichiers.**
- Nouveaux : `apps/site/app/ressources/component/ResourceCard.tsx`, `ResourceFilters.tsx`, `ResourceForm.tsx`, `apps/site/tests/e2e/inventaire/ressources.spec.ts`.
- Refaits : `app/ressources/page.tsx`, `submit/page.tsx`, `edit/[id]/page.tsx`.
- Modifiés : `common/components/AppShell/navItems.ts`, `AppShell.css`, `tests/e2e/mobile-audit.spec.ts`, `lint-baseline.json`, `docs/refonte/inventaire.md`, `docs/features/ressources-media/README.md`, `docs/GLOSSAIRE.md`, skills `mobile-ux` et `reuse-first`.
- Supprimés (plus importés nulle part) : `app/ressources/page.css`, `page-mobile.css`, `component/ResourceCard/` (3 fichiers), `component/ResourceFilterSidebar/` (3 fichiers), `component/ResourceForm/` (3 fichiers), `common/components/MobileFilterWrapper/` (2 fichiers).

**Ce qui est vérifié.**
- `tests/e2e/inventaire/ressources.spec.ts` (4 tests) a été écrit avant la refonte ; l'ancienne version a seulement reçu des noms accessibles (« Éditer … », « Supprimer … », « Rechercher une ressource », « Rechercher par tag ») et un identifiant reliant le champ des tags à son libellé. Il passait sur l'ancienne version : 8 sur 8 (ordinateur et téléphone). Sur la nouvelle : 8 sur 8, puis 24 sur 24 en le rejouant trois fois. Une modification après coup : sur téléphone, le test quitte le champ de saisie avant d'appuyer ailleurs (la barre du bas qui réapparaît faisait parfois perdre un appui, comme dans le test des articles). Les attentes n'ont pas changé.
- `npx tsc --noEmit` sans erreur ; ESLint du site en baisse, plafond abaissé de 502 à 482.
- `ressources`, `profil` (onglet « Ressources »), `coquille` et `smoke` sur les deux tailles : 78 réussis et 2 échecs par dépassement de temps pendant qu'un autre calcul chargeait le poste ; `ressources` et `profil` relancés ensuite : 28 sur 28.
- Audit mobile (liste, panneau des filtres, proposition, modification, ajoutés à `mobile-audit.spec.ts`) à 360 et 390 pixels : aucun champ sous 16 pixels, rien de coupé ; restent seulement le logo et les libellés de la barre du bas (coquille), comme sur les autres listes.
- Captures relues à 360, 390 et 1280 pixels en Vestiaire et en Saison 3, puis supprimées. Corrigés après relecture : la grande image en 16/9 qui ne laissait voir qu'une ressource par écran de téléphone (vignette à gauche), l'aperçu d'image trop grand dans le formulaire.

**Choix à valider par le responsable.** Filtres (tags) dans une colonne à gauche sur ordinateur, comme `/articles` ; « Éditer » et « Supprimer » rangés dans « ⋯ » ; vignette à gauche sur petit téléphone ; recherche lancée pendant la frappe ; cartes grises pendant chaque chargement ; « Annuler » ramène à la liste.

**À essayer à la main sur son téléphone.**
- `/ressources` : chercher un mot, ouvrir « Filtres », choisir un tag dans les suggestions, retirer la pastille, passer en liste, aller à la page 2, ouvrir une ressource externe (nouvel onglet) et un outil du site.
- Sur une de ses ressources : « ⋯ », « Éditer », puis « ⋯ », « Supprimer », « Annuler ».
- « Soumettre une ressource » : remplir les champs, envoyer une image depuis la galerie du téléphone (envoi réel vers ImgBB, non testé automatiquement), ajouter un tag suggéré et un nouveau, « Soumettre » depuis la barre du bas ; vérifier que le clavier ne cache pas les suggestions de tags.

**Remarques (hors carte, non corrigées).**
- `/ressources/submit` s'ouvre sans connexion et le bouton « Soumettre une ressource » est montré aux visiteurs : leur envoi n'est refusé (« Non authentifié ») qu'après avoir rempli le formulaire.
- Le lien d'une ressource n'est pas contrôlé côté serveur (un lien qui ne commence pas par `http` est traité comme une page du site) ; seule la validation par la modération sert de filet.
- La clé du service d'images ImgBB est publique (`NEXT_PUBLIC_IMGBB_API_KEY`).
- Le titre du panneau « ⋯ » garde le trait vertical de l'ancien style en Saison 3 (défaut connu, carte 101).
