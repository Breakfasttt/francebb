---
id: 095
title: "Refonte des articles"
epic: E08
app: site
depends_on: [082, 084]
adr: 0006
verify: section 10 de docs/refonte/inventaire.md cochée ; test d'inventaire vert en projets chromium et telephone ; mobile-audit vert ; validé par le user sur son téléphone
---

# 095 — Refonte des articles

## Pourquoi

Refaire la liste des articles, la page d'un article et le formulaire d'article selon l'ADR 0006, sans perdre aucune des fonctionnalités listées dans la section 10 de `docs/refonte/inventaire.md`.

## Action

- Écrire d'abord le test d'inventaire de la section 10 dans `apps/site/tests/e2e/inventaire/`, et le faire passer sur la version actuelle.
- Page d'un article avec une colonne de lecture limitée à environ 70 caractères par ligne.
- Supprimer les fichiers `page.css` et `page-mobile.css` devenus inutiles, et utiliser les composants de `packages/ui`.
- La section de l'inventaire est vérifiée par son test d'inventaire, écrit avant la refonte de l'écran et passé sans modification après, en taille ordinateur et en taille téléphone.

## Résultat

**Ce qui a été fait.** `/articles`, la page d'un article, sa création et sa modification utilisent maintenant les composants et les couleurs v2 de `packages/ui`. Les adresses, leurs paramètres (`?query&tag&author&sort&view&page`), les champs envoyés et les actions serveur n'ont pas changé.
- **`/articles`** : en-tête « Articles » avec le nombre d'articles trouvés et, pour un membre connecté, le bouton « Créer un article » (« Créer » sur un petit téléphone). Barre au-dessus des résultats sur le modèle de `/tournois` : recherche dans le titre et le texte (appliquée 400 millisecondes après la dernière touche, au lieu de l'appui sur Entrée), bouton « Filtres » sur téléphone, tri toujours visible, grille ou liste en deux boutons de 44 pixels. Les tags et l'auteur sont dans la colonne « Filtres » sur ordinateur et dans le panneau « Filtrer les articles » sur téléphone ; chaque tag et l'auteur sont rappelés en pastille avec une croix. Une carte ou une ligne par article, entièrement cliquable (tags, titre, début du texte, auteur avec son cadre de rang, date, vues, réactions, mention « Modéré »). Pagination compacte `PageNav`, qui garde les filtres. `MobileFilterWrapper` n'est plus utilisé ici : seule `/ressources` s'en sert encore (carte 096).
- **Page d'un article** : une seule colonne de lecture centrée (860 pixels au plus), texte limité à 70 caractères par ligne avec un interligne de 1,6. En tête : tags, titre en grand, auteur (avatar, lien vers son profil), date et vues, puis « Modifier » et le menu « ⋯ » (« Actions de l'article » : modérer ou annuler la modération, supprimer, signaler), comme la fiche d'une ligue. La suppression et l'annulation de la modération passent par `ConfirmDialog` (avant : `ConfirmModal`), la modération par `ModerationModal`, le signalement par `ReportModal`. Réactions refaites : pastilles de 44 pixels ; « Réagir » ouvre un petit panneau sur ordinateur et un panneau du bas sur téléphone. La page importe `app/forum/page.css` pour les blocs BBCode ; elle n'avait pas de copie de ces styles à retirer. Aucun `confirm()` natif n'existait dans cette zone.
- **Création et modification** : un seul formulaire `ArticleForm` en blocs (l'article, classement, contenu) dans `ComposeScreen` : sur téléphone, plein écran sans barre du bas, « Annuler » et « Publier » ou « Mettre à jour » collés en bas ; sur ordinateur, colonne « Publication ». `isComposePath` connaît `/articles/create` et `/articles/edit/[id]`. « Annuler » mène à la liste ou à l'article (avant : retour à la page précédente).
- **`TagSelector`** (utilisé seulement par les articles) est refait avec `Input` et `Button` : champ en 16 pixels, croix et suggestions de 44 pixels sur téléphone, props `id` et `aria-label`. `LigueSearch` reçoit seulement une prop `inputId` pour relier son champ à un libellé.

**Fichiers.**
- Nouveaux : `apps/site/app/articles/component/ArticleFilters.tsx`, `apps/site/app/articles/[id]/component/ArticleActions.tsx`, `apps/site/tests/e2e/inventaire/articles.spec.ts`.
- Refaits : `app/articles/page.tsx`, `component/ArticleCard.tsx`, `component/ArticleForm.tsx`, `create/page.tsx`, `edit/[id]/page.tsx`, `[id]/page.tsx`, `[id]/component/ArticleReactions.tsx`, `common/components/TagSelector/TagSelector.tsx`.
- Modifiés : `common/components/LigueSearch/LigueSearch.tsx`, `common/components/AppShell/navItems.ts`, `tests/e2e/mobile-audit.spec.ts`, `lint-baseline.json`, `docs/refonte/inventaire.md`, `docs/features/articles/README.md`, `docs/GLOSSAIRE.md`, skills `mobile-ux` et `reuse-first`.
- Supprimés (plus importés nulle part) : `app/articles/page.css`, `page-mobile.css`, `[id]/page.css`, `[id]/page-mobile.css`, `component/ArticleCard.css`, `ArticleCard-mobile.css`, `ArticleFilterSidebar.tsx`, `ArticleFilterSidebar.css`, `ArticleFilterSidebar-mobile.css`, `ArticleForm.css`, `ArticleForm-mobile.css`, `[id]/component/ArticleReactions.css`, `DeleteArticleButton.tsx`, `ModerateArticleButton.tsx`, `ReportArticleButton.tsx`, `common/components/TagSelector/TagSelector.css`.

**Ce qui est vérifié.**
- `tests/e2e/inventaire/articles.spec.ts` (7 tests) a été écrit avant la refonte ; l'ancienne version a seulement reçu le nom « Trier par » sur sa liste de tri. Il passait sur l'ancienne version : 14 sur 14 (ordinateur et téléphone). Sur la nouvelle version : 14 sur 14. Une seule modification après coup : le test masque la pastille des outils de développement de Next.js, absente du site en ligne, qui recouvrait sur téléphone les boutons en bas à gauche d'un panneau (« Réinitialiser », premier émoji). Les attentes n'ont pas changé.
- `npx tsc --noEmit` sans erreur ; ESLint du site en baisse, plafond abaissé de 530 à 502.
- `articles`, `profil` (onglet « Articles » avec la carte d'article), `coquille`, `smoke` et `security` sur les deux tailles : 98 réussis, 1 sauté, 2 échecs isolés sans lien avec les articles (débannissement dans `security.spec.ts`, sujet du forum dans `smoke.spec.ts`), passés au lancement suivant. Le test du thème « Sombre » de `smoke.spec.ts` en taille téléphone a ensuite échoué deux fois par dépassement de temps, sans fichier commun avec cette carte.
- Audit mobile (liste, liste en lignes, panneau des filtres, page d'un article, création, modification, ajoutés à `mobile-audit.spec.ts`) à 360 et 390 pixels : aucun champ sous 16 pixels, rien de coupé. Restent le logo et les libellés de la barre du bas (coquille) et un lien à l'intérieur du texte de l'article. Le lien du nom de l'auteur, trop bas (24 pixels), a été agrandi à 44 pixels.
- Captures relues à 360, 390 et 1280 pixels en Vestiaire et en Saison 3, puis supprimées. Corrigés après relecture : un avatar placé dans un paragraphe (HTML invalide qui cassait l'hydratation de la liste), une icône en double dans le formulaire.

**Choix à valider par le responsable.** Colonne « Filtres » à gauche sur ordinateur (comme `/tournois`) ; tri visible dans la barre ; « Réinitialiser » retire les tags, l'auteur et le tri, mais garde la recherche et l'affichage (avant : tout était retiré) ; recherche appliquée pendant la frappe ; avatars avec cadre de rang (`UserAvatar`) ; page d'un article sans colonne latérale ; mention fausse « Membre depuis 2024 » retirée ; signalement rangé dans « ⋯ ».

**À essayer à la main sur son téléphone.**
- `/articles` : chercher un mot, ouvrir « Filtres », choisir un tag dans les suggestions, saisir un auteur, retirer une pastille, changer le tri, passer en liste, aller à la page 2.
- Page d'un article : lire un long article (confort de la colonne), toucher « Réagir », choisir un émoji puis le retirer, ouvrir « ⋯ » ; en modérateur, modérer puis annuler la modération.
- « Créer un article » : ajouter deux tags (un suggéré, un nouveau), choisir une ligue, écrire avec la barre d'outils de l'éditeur, « Publier » depuis la barre du bas ; vérifier que le clavier ne cache pas les suggestions de tags.

**Remarques (hors carte, non corrigées).**
- La liste `/articles` montre aussi les articles modérés à tout le monde (titre et début du texte), alors que l'API du profil les cache.
- Modifier un article efface sa ligue rattachée (`edit/[id]/page.tsx` ne transmet pas `ligueId`), et la page d'un article n'affiche jamais cette ligue.
- Un schéma BBScheme dans un article n'est pas animé : la page utilise `parseBBCode` et non `BBCodeContent`.
- `ModerationModal` a pour titre « Modérer le message de … » même pour un article.
- Les classes `.pagination-wrapper` de `/ressources` et `.action-button` de deux onglets de l'administration n'étaient définies que dans les feuilles de style des articles, chargées seulement après une visite de `/articles` : ces éléments perdent ce style d'emprunt (carte 096 pour les ressources).
- `LigueSearch` garde son ancien style (résultats en `div` cliquables, sans accès au clavier).
