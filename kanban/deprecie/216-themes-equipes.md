---
id: 216
title: "Les 27 thèmes d'équipe manquants"
epic: E11
app: packages/ui
depends_on: [212, 214, 215]
adr: 0009
verify: "27 nouveaux thèmes générés, un par équipe ; contraste AA vérifié sur tous les thèmes ; poids total des couleurs mesuré ; relecture visuelle par le responsable"
---

# 216 — Les 27 thèmes d'équipe manquants

## Pourquoi

Sur les 31 équipes, 4 reprennent un thème existant (Élus du Chaos, Khorne, Skavens, Rois des tombes) : il reste 27 équipes sans thème (ADR-0009).

## Action

Une entrée par équipe dans le fichier de données (couleurs de base, surface de terrain), puis le script `themes:build`.

## Résultat

Fait : 27 entrées `base` dans `themeData.mjs` (rubrique, surface, 3 à 5 couleurs de base originales par équipe) ; le générateur calcule les autres couleurs et corrige le contraste (il éclaircit l'état survolé d'un bouton sous un texte foncé). Les 35 thèmes passent les 20 paires du test de contraste (vérification par script Node avec les mêmes seuils). Poids total des couleurs : 33,7 Ko, sous la limite de 40 Ko. À relire à l'œil, équipe par équipe, par le responsable.

## Remplacée

Le 16 novembre 2026, après essai, le responsable trouve les thèmes trop nombreux (carte 218). Seul le thème des Elfes noirs est gardé, renommé « Violet » (identifiant `elfes-noirs`) ; les 26 autres thèmes d'équipe sont retirés.
