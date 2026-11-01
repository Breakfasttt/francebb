---
id: 101
title: "Suppression de l'ancien CSS"
epic: E08
app: site
depends_on: [085, 086, 087, 088, 089, 090, 091, 092, 093, 094, 095, 096, 097, 098, 099, 100]
adr: 0006
verify: plus aucun page.css ni variable v1 ; variable REFONTE retirée ; preflight actif ; suite e2e complète verte ; Lighthouse téléphone d'au moins 90 ; toutes les cases de l'inventaire cochées
---

# 101 — Suppression de l'ancien CSS

## Pourquoi

Quand tous les écrans sont refaits, l'ancien CSS, les alias v1 et la variable `REFONTE` ne servent plus. Les garder ferait coexister deux systèmes pour rien.

## Action

- Avant de supprimer, lister ce qui utilise encore chaque fichier ou variable.
- Supprimer les fichiers CSS historiques, la couche `legacy`, les alias v1, `MobileSidebar`, l'ancienne coquille et la variable `REFONTE` (mettre à jour `DEPLOY.md`).
- Activer le preflight de Tailwind et vérifier toutes les pages en taille téléphone et ordinateur.
- Lancer la suite e2e complète et Lighthouse en mode mobile.
- Corriger les défauts du socle relevés pendant la refonte des écrans :
  - `Textarea` de `packages/ui` affiché en police à chasse fixe ;
  - trait vertical de l'ancien style sur le titre des panneaux et règle `[data-theme='saison3'] h2` qui garde les titres en bleu marine en Saison 3 ;
  - chiffre de `CountBadge` en 11 pixels, trop petit ;
  - styles BBCode recopiés dans plusieurs `page.css` (garder une seule feuille partagée) ;
  - bandeau des cookies et notifications empilées qui couvrent le bas des pages sur téléphone (la modération et l'administration le contournent par une marge, à retirer ensuite) ;
  - mise en forme des mentions légales ;
  - logo de la coquille et libellés de la barre basse ;
  - `UserMapper`, `UserSearch` et `LigueSearch` encore à l'ancien style ;
  - `.loader-container` de `/bbscheme`, qui ne reçoit son style qu'après un passage par `/classement`.
