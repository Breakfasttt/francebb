---
id: 097
title: "Refonte du classement CDF"
epic: E08
app: site
depends_on: [082, 084]
adr: 0006
verify: section 12 de docs/refonte/inventaire.md cochée ; test d'inventaire vert en projets chromium et telephone ; mobile-audit vert ; validé par le user sur son téléphone
---

# 097 — Refonte du classement CDF

## Pourquoi

Refaire le classement du Championnat de France et l'éditeur d'archives selon l'ADR 0006, sans perdre aucune des fonctionnalités listées dans la section 12 de `docs/refonte/inventaire.md`.

## Action

- Écrire d'abord le test d'inventaire de la section 12 dans `apps/site/tests/e2e/inventaire/`, et le faire passer sur la version actuelle.
- Tableau de classement lisible sur téléphone sans défilement horizontal de la page : les colonnes secondaires passent dans la ligne dépliée.
- Supprimer les fichiers `page.css` et `page-mobile.css` devenus inutiles, et utiliser les composants de `packages/ui`.
- La section de l'inventaire est vérifiée par son test d'inventaire, écrit avant la refonte de l'écran et passé sans modification après, en taille ordinateur et en taille téléphone.
