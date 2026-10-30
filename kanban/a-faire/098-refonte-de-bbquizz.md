---
id: 098
title: "Refonte de BBQuizz"
epic: E08
app: site
depends_on: [082, 084]
adr: 0006
verify: section 14 de docs/refonte/inventaire.md cochée ; test d'inventaire vert en projets chromium et telephone ; mobile-audit vert ; validé par le user sur son téléphone
---

# 098 — Refonte de BBQuizz

## Pourquoi

Refaire BBQuizz : jeu, classement, proposer, valider, éditer selon l'ADR 0006, sans perdre aucune des fonctionnalités listées dans la section 14 de `docs/refonte/inventaire.md`.

## Action

- Écrire d'abord le test d'inventaire de la section 14 dans `apps/site/tests/e2e/inventaire/`, et le faire passer sur la version actuelle.
- Supprimer les fichiers `page.css` et `page-mobile.css` devenus inutiles, et utiliser les composants de `packages/ui`.
- La section de l'inventaire est vérifiée par son test d'inventaire, écrit avant la refonte de l'écran et passé sans modification après, en taille ordinateur et en taille téléphone.
