---
id: 214
title: "Surfaces de terrain paramétrées"
epic: E11
app: site
depends_on: [210, 211]
adr: 0009
verify: "PitchField dessine la surface du thème actif (une dizaine de surfaces SVG originales, dont la pelouse de Saison 3) ; chaque surface pèse moins de 30 Ko ; les blocs restent des surfaces pleines lisibles ; audit mobile de l'accueil sans défaut"
---

# 214 — Surfaces de terrain paramétrées

## Pourquoi

Chaque équipe doit avoir son terrain en fond de l'accueil (ADR-0009), inspiré des tons et des idées des plateaux officiels, sans les copier.

## Action

1. Une dizaine de surfaces dessinées en SVG : pelouse, pelouse sombre, neige et glace, sable, dalles de pierre, souterrain, marais, jungle, parquet, cimetière.
2. Chaque thème choisit sa surface dans le fichier de données ; `PitchField` la dessine sous le quadrillage, avec les couleurs du thème.

## Résultat

Fait : `app/component/PitchSurface.tsx` lit la surface du thème actif et `PitchSurface.css` dessine 11 surfaces originales en dégradés CSS (aucune image, environ 7 Ko de CSS pour toutes) ; le quadrillage prend la couleur de ligne de chaque surface. Captures de l'accueil du visiteur dans 6 thèmes (Saison 3, Élus du Chaos, Nordiques, Vampires, Hommes Lézard, Nains), téléphone et ordinateur : titre et blocs lisibles. À relire à l'œil par le responsable.

## Annulée

Le 16 novembre 2026, après essai sur son poste, le responsable du projet a jugé le terrain dessiné en fond de l'accueil disgracieux et a demandé de le retirer. `PitchSurface.tsx` et `PitchSurface.css` sont supprimés, la surface de terrain (`pitch`) est retirée des données des thèmes, et l'ADR-0009 le note. L'accueil garde seulement l'en-but et la ligne de mêlée (carte 210).
