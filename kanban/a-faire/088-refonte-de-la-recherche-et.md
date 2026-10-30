---
id: 088
title: "Refonte de la recherche et de la modération du forum"
epic: E08
app: site
depends_on: [082, 084]
adr: 0006
verify: section 3.7 et 3.8 de docs/refonte/inventaire.md cochée ; test d'inventaire vert en projets chromium et telephone ; mobile-audit vert ; validé par le user sur son téléphone
---

# 088 — Refonte de la recherche et de la modération du forum

## Pourquoi

Refaire la recherche du forum, la création d'un forum et les fenêtres de modération (déplacer, modérer, modifier le titre, signaler) selon l'ADR 0006, sans perdre aucune des fonctionnalités listées dans la section 3.7 et 3.8 de `docs/refonte/inventaire.md`.

## Action

- Écrire d'abord le test d'inventaire de la section 3.7 et 3.8 dans `apps/site/tests/e2e/inventaire/`, et le faire passer sur la version actuelle.
- Formulaire de recherche replié dans un panneau sur téléphone, résultats en lignes avec l'extrait surligné.
- Fenêtres de modération construites avec les composants de `packages/ui`, à leur bon niveau de superposition.
- Supprimer les fichiers `page.css` et `page-mobile.css` devenus inutiles, et utiliser les composants de `packages/ui`.
- La section de l'inventaire est vérifiée par son test d'inventaire, écrit avant la refonte de l'écran et passé sans modification après, en taille ordinateur et en taille téléphone.
