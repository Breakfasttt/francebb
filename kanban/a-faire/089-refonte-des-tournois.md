---
id: 089
title: "Refonte des tournois"
epic: E08
app: site
depends_on: [082, 084]
adr: 0006
verify: section 4 de docs/refonte/inventaire.md cochée ; test d'inventaire vert en projets chromium et telephone ; mobile-audit vert ; validé par le user sur son téléphone
---

# 089 — Refonte des tournois

## Pourquoi

Refaire la liste des tournois et les écrans de tournoi (création, modification, inscriptions, résultats) selon l'ADR 0006, sans perdre aucune des fonctionnalités listées dans la section 4 de `docs/refonte/inventaire.md`.

## Action

- Écrire d'abord le test d'inventaire de la section 4 dans `apps/site/tests/e2e/inventaire/`, et le faire passer sur la version actuelle.
- Filtres de `/tournois` dans un panneau sur téléphone, pastilles des filtres actifs, tri, affichage en grille ou en liste.
- Formulaire de tournoi découpé en blocs lisibles sur téléphone, avec le choix du lieu sur la carte.
- Module d'inscription et saisie des résultats utilisables au doigt.
- Supprimer les fichiers `page.css` et `page-mobile.css` devenus inutiles, et utiliser les composants de `packages/ui`.
- La section de l'inventaire est vérifiée par son test d'inventaire, écrit avant la refonte de l'écran et passé sans modification après, en taille ordinateur et en taille téléphone.
