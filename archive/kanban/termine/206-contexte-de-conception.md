---
id: 206
title: "Contexte de conception pour Impeccable"
epic:
app: projet
depends_on: []
verify: "PRODUCT.md et DESIGN.md existent à la racine et décrivent le produit et le système visuel actuel (thème Vestiaire, variables --bb-, composants de packages/ui) ; .impeccable/design.json se lit sans erreur ; .impeccable/config.local.json n'est pas enregistré dans git"
---

# 206 — Contexte de conception pour Impeccable

## Pourquoi

L'outil de conception Impeccable (skill `impeccable`, dans `.claude/skills/`) aide l'IA à concevoir et revoir les écrans. Avant tout travail, il lit deux fichiers : `PRODUCT.md`, qui dit à qui sert le produit et ce qu'il faut préserver, et `DESIGN.md`, qui décrit l'apparence. Sans eux, il travaille à l'aveugle et risque de proposer un style étranger au site.

## Action

1. `PRODUCT.md` à la racine, valable pour toutes les applications : les quatre profils de coachs, ce qui distingue BBFrance, les contraintes (8 thèmes, téléphone d'abord, aucune fonctionnalité perdue), les principes.
2. `DESIGN.md` à la racine, relevé dans le code sans rien changer : couleurs du thème Vestiaire, police Inter, arrondis, cibles de 44 pixels, composants de `packages/ui`, règles à suivre et styles refusés.
3. `.impeccable/design.json` : le complément lu par le panneau de l'outil (exemples de composants, nuances des couleurs).
4. Ajouter `.impeccable/config.local.json` à `.gitignore` : ce fichier de réglages reste sur le poste du développeur.

## Résultat

Les trois fichiers sont écrits ; les réponses du responsable du projet ont fixé les profils d'utilisateurs, ce qui distingue le site, l'image directrice « Le Vestiaire » et les styles refusés (look « jeu vidéo » chargé, verre dépoli généralisé, tableau de bord générique). Le code n'a pas été modifié.
