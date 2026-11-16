---
id: 211
title: "Source unique des thèmes et script de génération"
epic: E11
app: packages/ui
depends_on: []
adr: 0009
verify: "les 8 fichiers de couleurs régénérés par le script themes:build sont identiques aux fichiers actuels ; la liste des thèmes du site et celle des tests viennent du fichier de données ; corepack pnpm check passe"
---

# 211 — Source unique des thèmes et script de génération

## Pourquoi

Ajouter un thème demande aujourd'hui de modifier cinq fichiers à la main (ADR-0009). Pour passer à 35 thèmes, il faut une seule source de données et un script qui génère le reste.

## Action

1. Décrire les 8 thèmes actuels dans `packages/ui/src/themes/themeData.mjs` (nom, groupe, surface de terrain, couleurs).
2. Écrire le script `themes:build`, qui génère les fichiers de couleurs, `themes/index.css` et la liste des thèmes lue par le site.
3. Faire lire cette liste par `apps/site/lib/themes.ts` et par les tests.

## Résultat

Fait : `packages/ui/src/themes/themeData.mjs` (source unique) et `packages/ui/scripts/build-themes.mjs` (commande `themes:build`, à la racine et dans `packages/ui`). Les 8 fichiers de couleurs régénérés sont identiques à l'octet aux anciens ; seul l'en-tête de `themes/index.css` change (« fichier généré »). La liste du site (`apps/site/lib/themes.ts`) lit `themeList.ts` par l'export `@bbfrance/ui/themes`. Un fichier existant garde ses fins de ligne.
