---
id: 099
title: "Refonte de la modération et de l'administration"
epic: E08
app: site
depends_on: [082, 084]
adr: 0006
verify: section 15 et 16 de docs/refonte/inventaire.md cochée ; test d'inventaire vert en projets chromium et telephone ; mobile-audit vert ; validé par le user sur son téléphone
---

# 099 — Refonte de la modération et de l'administration

## Pourquoi

Refaire les écrans de modération et d'administration selon l'ADR 0006, sans perdre aucune des fonctionnalités listées dans la section 15 et 16 de `docs/refonte/inventaire.md`.

## Action

- Écrire d'abord le test d'inventaire de la section 15 et 16 dans `apps/site/tests/e2e/inventaire/`, et le faire passer sur la version actuelle.
- Onglets gardés dans l'adresse (`?tab=`), avec leurs pastilles de compteur. Sur téléphone, liste d'onglets en haut de page.
- La remise à zéro de la base reste protégée par la saisie de la phrase de confirmation.
- Supprimer les fichiers `page.css` et `page-mobile.css` devenus inutiles, et utiliser les composants de `packages/ui`.
- La section de l'inventaire est vérifiée par son test d'inventaire, écrit avant la refonte de l'écran et passé sans modification après, en taille ordinateur et en taille téléphone.
