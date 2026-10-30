---
id: 093
title: "Refonte de la messagerie"
epic: E08
app: site
depends_on: [082, 084]
adr: 0006
verify: section 8 de docs/refonte/inventaire.md cochée ; test d'inventaire vert en projets chromium et telephone ; mobile-audit vert ; validé par le user sur son téléphone
---

# 093 — Refonte de la messagerie

## Pourquoi

Refaire la messagerie selon l'ADR 0006, sans perdre aucune des fonctionnalités listées dans la section 8 de `docs/refonte/inventaire.md`.

## Action

- Écrire d'abord le test d'inventaire de la section 8 dans `apps/site/tests/e2e/inventaire/`, et le faire passer sur la version actuelle.
- Sur téléphone, la liste des conversations puis la conversation en plein écran, comme une application de messagerie, avec la zone de saisie collée en bas au-dessus du clavier.
- Supprimer les fichiers `page.css` et `page-mobile.css` devenus inutiles, et utiliser les composants de `packages/ui`.
- La section de l'inventaire est vérifiée par son test d'inventaire, écrit avant la refonte de l'écran et passé sans modification après, en taille ordinateur et en taille téléphone.
