---
id: 100
title: "Refonte de l'habillage de BBScheme"
epic: E08
app: site
depends_on: [082, 084]
adr: 0006
verify: section 13 de docs/refonte/inventaire.md cochée ; test d'inventaire vert en projets chromium et telephone ; mobile-audit vert ; validé par le user sur son téléphone
---

# 100 — Refonte de l'habillage de BBScheme

## Pourquoi

Refaire l'habillage de BBScheme (barres d'outils, panneaux de réserve, fenêtres) selon l'ADR 0006, sans perdre aucune des fonctionnalités listées dans la section 13 de `docs/refonte/inventaire.md`.

## Action

- Écrire d'abord le test d'inventaire de la section 13 dans `apps/site/tests/e2e/inventaire/`, et le faire passer sur la version actuelle.
- Ne pas toucher au lecteur (`packages/bbscheme-player`) ni au pincement à deux doigts : seulement ce qui entoure le terrain.
- Garder les paramètres d'adresse `?id=`, `&embed=true` et `&layout=vertical`.
- Supprimer les fichiers `page.css` et `page-mobile.css` devenus inutiles, et utiliser les composants de `packages/ui`.
- La section de l'inventaire est vérifiée par son test d'inventaire, écrit avant la refonte de l'écran et passé sans modification après, en taille ordinateur et en taille téléphone.
