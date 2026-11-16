---
id: 063
title: "Fluidité mobile : page du profil à 90/100"
epic: E03
app: site
depends_on: [059]
adr: 0004
verify: pnpm lighthouse (dans apps/site) donne au profil une note médiane d'au moins 90/100 et un CLS sous 0,1, et docs/mobile-audit.md est mis à jour
---

# 063 — Fluidité mobile : page du profil à 90/100

## Pourquoi

La mesure Lighthouse de la carte 059 (voir `docs/mobile-audit.md`, section « Fluidité sur téléphone ») donne à la page `/profile` une note de **75/100** sur téléphone, sous l'objectif de 90. Les autres pages principales sont entre 91 et 97.

Causes relevées par Lighthouse sur le profil :

1. **Contenu qui saute pendant le chargement** (CLS de 0,25, la limite conseillée est 0,1 ; c'est la cause principale). La carte de résumé du profil (`app/profile/component/ProfileSidebar.tsx`, boîte `profile-summary-box`) est d'abord affichée dans sa version ordinateur, puis remplacée par sa version téléphone quand le JavaScript a démarré : le hook `useIsMobile` ne connaît la largeur de l'écran que dans le navigateur. Tout ce qui est en dessous est décalé.
2. **Plus gros élément affiché tard** (LCP de 3,9 secondes, conseillé sous 2,5) : le sous-titre de la page attend une dizaine de petits fichiers CSS qui bloquent l'affichage (gain estimé de 610 ms).
3. **Logo du menu latéral trop lourd** : 85 Ko de plus que nécessaire pour son affichage en 96 × 42 pixels (commun à toutes les pages).
4. **JavaScript inutilisé** (environ 21 Ko) et code de compatibilité pour d'anciens navigateurs (14 Ko), communs à toutes les pages.

## Action

- Supprimer le saut de la carte de résumé : choisir l'affichage téléphone ou ordinateur en CSS (`@media (max-width: 1024px)`, le seuil unique du site) plutôt qu'avec `useIsMobile`, ou réserver dès le départ la place de la version téléphone. Suivre les skills `mobile-ux` et `ui-components`.
- Réduire le logo à une taille adaptée à son affichage (composant `Image` de Next.js avec une largeur et une hauteur réelles, ou un fichier plus léger). Ce gain profite à toutes les pages.
- Regarder si les fichiers CSS bloquants de la page peuvent être regroupés ou allégés (les causes 2 et 4 touchent tout le site : si la correction est large, proposer une carte à part).
- Relancer `pnpm lighthouse`, vérifier le profil en taille téléphone (360 et 390 pixels) et mettre à jour `docs/mobile-audit.md`.

## Résultat

- **Note Lighthouse du profil sur téléphone : 92/100** (passages 92, 92, 92), LCP 3,4 secondes, CLS 0. Avant : 75/100 avec un CLS de 0,25 (carte 059), puis 88/100 après la carte 019. Les quatre autres pages mesurées sont à 92-98, toutes avec un CLS à 0 (le forum était à 0,082 et le sujet à 0,065). Détail dans `docs/mobile-audit.md`.
- **Contenu qui saute, cause réelle** : en relevant les décalages dans le navigateur (avec un téléphone simulé et un processeur ralenti), la boîte de résumé descendait de 400 pixels puis remontait. La liste des onglets destinée au menu latéral (`MobilePortal`) était d'abord affichée à sa place d'origine, au-dessus de la boîte, puis déplacée dans le menu une image plus tard. Cette copie est cachée en CSS (`app/profile/page-mobile.css`). Comme le proposait la carte, les autres différences téléphone/ordinateur de la boîte sont aussi passées en CSS : les onglets collés à droite (ordinateur) sont cachés sur téléphone dès le premier affichage, et l'avatar garde la même taille pour le composant (120 pixels), réduit à 100 pixels par la propriété CSS `zoom` ; la classe `is-mobile`, qui n'était utilisée par aucune règle, est retirée (`ProfileSidebar.tsx`).
- **Bouton retour, pour toutes les pages** : sur téléphone, il s'affichait un instant dans l'en-tête avant d'être déplacé dans la barre de navigation, et toute la page remontait d'environ 60 pixels. Il est caché dès le départ dans l'en-tête quand la barre a son emplacement (`PageHeader-mobile.css`, sélecteur `:has(#mobile-back-button-slot)`).
- **Plus gros élément affiché plus tôt** : le titre de la page s'affiche sans attendre la session et les données du membre, et le reste de la page dès que la fiche du membre est arrivée ; le nombre de messages et l'activité complètent la page ensuite (`app/profile/page.tsx`). LCP de 3,9 à 3,4 secondes. Contre-épreuve : sans ce second changement (et avec toutes les autres corrections), le profil reste à 88/100. Un essai qui lançait les trois chargements en même temps donnait aussi 92, mais le test e2e du choix de thème dans le profil restait bloqué dans la suite complète (trois fois sur trois), probablement parce que la petite base de test n'accepte qu'une connexion à la fois : les chargements restent donc l'un après l'autre.
- **Logo** : déjà allégé par la carte 019, rien de plus à faire.
- **CSS bloquant, JavaScript inutilisé, code pour anciens navigateurs** (causes 2 et 4) : non traités. Ils touchent tout le site et la façon dont Next.js découpe ses fichiers ; les cinq pages dépassant maintenant 90, une carte à part ne se justifie que si une note repasse sous l'objectif (noté dans `docs/mobile-audit.md`).
- **Outil de mesure réparé** : `pnpm lighthouse` s'arrêtait sur la page d'un sujet (erreur 500, « Connection terminated unexpectedly »). Reproduit à la main : après `next build`, la petite base de test locale ne servait plus correctement cette page ; recréée après la préparation, tout marche. `playwright.lighthouse.config.ts` recrée donc la base entre `next build` et `next start` (le jeu de données est ajouté ensuite par `globalSetup`, que Playwright lance une fois le site prêt).
- **Vérifications** : `corepack pnpm lighthouse` réussi (5 pages, 3 passages chacune) ; profil mesuré en taille téléphone à 360 et 390 pixels par l'audit mobile (0 défaut) ; types, 0 erreur ; ESLint, 840 erreurs, égal au plafond ; suite e2e complète : 71 réussis, 1 ignoré volontairement (l'audit).
