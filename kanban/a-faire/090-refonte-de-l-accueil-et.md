---
id: 090
title: "Refonte de l'accueil et des pages fixes"
epic: E08
app: site
depends_on: [082, 084]
adr: 0006
verify: section 5 de docs/refonte/inventaire.md cochée ; test d'inventaire vert en projets chromium et telephone ; mobile-audit vert ; validé par le user sur son téléphone
---

# 090 — Refonte de l'accueil et des pages fixes

## Pourquoi

Refaire l'accueil, `/jouer`, les mentions légales, `/media`, les statistiques, la page 404 et la page « banni » selon l'ADR 0006, sans perdre aucune des fonctionnalités listées dans la section 5 de `docs/refonte/inventaire.md`.

## Action

- Écrire d'abord le test d'inventaire de la section 5 dans `apps/site/tests/e2e/inventaire/`, et le faire passer sur la version actuelle.
- Supprimer les fichiers `page.css` et `page-mobile.css` devenus inutiles, et utiliser les composants de `packages/ui`.
- La section de l'inventaire est vérifiée par son test d'inventaire, écrit avant la refonte de l'écran et passé sans modification après, en taille ordinateur et en taille téléphone.
